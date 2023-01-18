package kr.omsecurity.ompass.webauthn.util;

import android.content.Context;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyInfo;
import android.security.keystore.KeyProperties;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import co.nstant.in.cbor.CborBuilder;
import co.nstant.in.cbor.CborEncoder;
import co.nstant.in.cbor.CborException;
import kr.omsecurity.ompass.webauthn.exceptions.VirgilException;
import kr.omsecurity.ompass.webauthn.models.PublicKeyCredentialSource;
import kr.omsecurity.ompass.webauthn.util.database.CredentialDatabase;
import kr.omsecurity.ompass.Auth;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x509.AlgorithmIdentifier;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.crypto.params.AsymmetricKeyParameter;
import org.bouncycastle.crypto.util.PrivateKeyFactory;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.DefaultDigestAlgorithmIdentifierFinder;
import org.bouncycastle.operator.DefaultSignatureAlgorithmIdentifierFinder;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.bc.BcRSAContentSignerBuilder;

import javax.security.auth.x500.X500Principal;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.InvalidKeySpecException;
import java.util.Calendar;
import java.util.List;


/**
 * CredentialSafe uses the Android KeyStore to generate and store
 * ES256 keys that are hardware-backed.
 * <p>
 * These keys can optionally be protected with "Strongbox keymaster" protection and user
 * authentication on supported hardware.
 */
public class CredentialSafe {
    private static final String KEYSTORE_TYPE = "AndroidKeyStore";
    private static final String CURVE_NAME = "secp256r1";
    private KeyStore keyStore;
    private boolean authenticationRequired;
    private boolean strongboxRequired;
    private CredentialDatabase db;

    // doublek
    private boolean createMode = true; // credential 생성시 매번 인증서를 생성하므로, 등록시에만 생성하도록 구분 flag.


    public void setCreateMode(boolean mode)
    {
        this.createMode = mode;
    }
    /**
     * Construct a CredentialSafe that requires user authentication and strongbox backing.
     *
     * @param ctx The application context
     * @throws VirgilException
     */
    public CredentialSafe(Context ctx) throws VirgilException {
        this(ctx, true, true);
    }

    /**
     * Construct a CredentialSafe with configurable user authentication / strongbox choices.
     *
     * @param ctx                    The application context
     * @param authenticationRequired Whether user will be required to use biometrics to allow each
     *                               use of keys generated (requires fingerprint enrollment).
     * @param strongboxRequired      Require keys to be backed by the "Strongbox Keymaster" HSM.
     *                               Requires hardware support.
     * @throws VirgilException
     */
    public CredentialSafe(Context ctx, boolean authenticationRequired, boolean strongboxRequired) throws VirgilException {
        try {
            keyStore = KeyStore.getInstance(KEYSTORE_TYPE);
            keyStore.load(null);
        } catch (KeyStoreException | CertificateException |
                NoSuchAlgorithmException | IOException e) {
            throw new VirgilException("couldn't access keystore", e);
        }

        this.authenticationRequired = authenticationRequired;
        this.strongboxRequired = strongboxRequired;
        this.db = CredentialDatabase.getDatabase(ctx);
    }

    /**
     * Determine if user verification (by the WebAuthn definition) is supported.
     *
     * @return status of user verification requirement
     */
    public boolean supportsUserVerification() {
        return this.authenticationRequired;
    }


    /**
     * Generate a new ES256 keypair (COSE algorithm -7, ECDSA + SHA-256 over the NIST P-256 curve).
     *
     * @param alias The alias used to identify this keypair in the keystore. Needed to use key
     *              in the future.
     * @return The KeyPair object representing the newly generated keypair.
     * @throws VirgilException
     */
    private KeyPair generateNewES256KeyPair(String alias, String x500Principal, String userId) throws VirgilException {
        if (!createMode) {
            return this.getKeyPairByAlias(alias, userId);
        }
        KeyGenParameterSpec spec = new KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_SIGN)
                .setAlgorithmParameterSpec(new ECGenParameterSpec(CURVE_NAME))
                .setDigests(KeyProperties.DIGEST_SHA256)
                .setUserAuthenticationRequired(this.authenticationRequired) // fingerprint or similar
                .setCertificateSubject(new X500Principal(x500Principal))
                .build();
        if (spec == null)
            throw new VirgilException("KeyGenParameterSpec is null ");
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, KEYSTORE_TYPE);
            keyPairGenerator.initialize(spec);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            return keyPair;
        } catch (NoSuchAlgorithmException | NoSuchProviderException | InvalidAlgorithmParameterException e) {
            throw new VirgilException("couldn't generate key pair: " + e.toString());
        }
    }

    /**
     * Generate and save new credential with an ES256 keypair.
     *
     * @param rpEntityId      The relying party's identifier
     * @param userHandle      A unique ID for the user
     * @param userDisplayName A human-readable username for the user
     * @return A PublicKeyCredentialSource object corresponding to the new keypair and its associated
     * rpId, credentialId, etc.
     * @throws VirgilException
     */
    @RequiresApi(api = Build.VERSION_CODES.M)
    public PublicKeyCredentialSource generateCredential(@NonNull String rpEntityId, byte[] userHandle, String userDisplayName) throws VirgilException {
        PublicKeyCredentialSource credentialSource = new PublicKeyCredentialSource(rpEntityId, userHandle, userDisplayName);

        // Keystore에 credentialSource.keyPairAlias로 등록되어있는지 확인.
        if (createMode) deleteCertFromKeyStore(credentialSource.keyPairAlias);
//        Certificate cert = getCertificateFromKeyStore(credentialSource.keyPairAlias);

        String x500Principal = "CN=" + userDisplayName + ", OU=Authenticator Attestation, O=" + rpEntityId + ", C=KR";
        try {
            generateNewES256KeyPair(credentialSource.keyPairAlias, x500Principal, userDisplayName); // return not captured -- will retrieve credential by alias
        } catch (NullPointerException e) {
            return null;
        }
        db.credentialDao().insert(credentialSource);
        return credentialSource;
    }

    public void deleteCredential(PublicKeyCredentialSource credentialSource) {
        db.credentialDao().delete(credentialSource);
    }


    /**
     * Get keys belonging to this RP ID.
     *
     * @param rpEntityId rpEntity.id from WebAuthn spec.
     * @return The set of associated PublicKeyCredentialSources.
     */
    public List<PublicKeyCredentialSource> getKeysForEntity(@NonNull String rpEntityId) {
        return db.credentialDao().getAllByRpId(rpEntityId);
    }

    /**
     * Get the credential matching the specified id, if it exists
     *
     * @param id byte[] credential id
     * @return PublicKeyCredentialSource that matches the id, or null
     */
    public PublicKeyCredentialSource getCredentialSourceById(@NonNull byte[] id) {
        return db.credentialDao().getById(id);
    }


    /**
     * Retrieve a previously-generated keypair from the keystore.
     *
     * @param alias The associated keypair alias.
     * @return A KeyPair object representing the public/private keys. Private key material is
     * not accessible.
     * @throws VirgilException
     */
    public KeyPair getKeyPairByAlias(@NonNull String alias, @NonNull String userId) throws VirgilException {
        System.out.println("alias : " + alias);
        try {
            PrivateKey privateKey = (PrivateKey) keyStore.getKey(alias, null);
            PublicKey publicKey = null;
            try {
                if(createMode) {
                    publicKey = keyStore.getCertificate(alias).getPublicKey();
                } else {
                    if(keyStore.getCertificate(userId) != null) {
                        publicKey = keyStore.getCertificate(userId).getPublicKey();
                    } else {
                        publicKey = keyStore.getCertificate(alias).getPublicKey();
                    }
                }
            } catch (NullPointerException e) {
                Auth.err_msg = "앱 재설치";
                return null;
            }
            return new KeyPair(publicKey, privateKey);
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableEntryException e) {
            throw new VirgilException("couldn't get key by alias", e);
        }
    }

    /**
     * Checks whether this key requires user verification or not
     *
     * @param alias The associated keypair alias
     * @return whether this key requires user verification or not
     * @throws VirgilException
     */
    @RequiresApi(api = Build.VERSION_CODES.M)
    public boolean keyRequiresVerification(@NonNull String alias, @NonNull String userId) throws VirgilException {
        PrivateKey privateKey = getKeyPairByAlias(alias, userId).getPrivate();
        KeyFactory factory;
        KeyInfo keyInfo;

        try {
            factory = KeyFactory.getInstance(privateKey.getAlgorithm(), KEYSTORE_TYPE);
        } catch (NoSuchAlgorithmException | NoSuchProviderException exception) {
            throw new VirgilException("Couldn't build key factory: " + exception.toString());
        }

        try {
            keyInfo = factory.getKeySpec(privateKey, KeyInfo.class);
        } catch (InvalidKeySpecException exception) {
            throw new VirgilException("Not an android keystore key: " + exception.toString());
        }

        return keyInfo.isUserAuthenticationRequired();
    }


    /**
     * Fix the length of a byte array such that:
     * 1) If the desired length is less than the length of `arr`, the left-most source bytes are
     * truncated.
     * 2) If the desired length is more than the length of `arr`, the left-most destination bytes
     * are set to 0x00.
     *
     * @param arr         The source byte array.
     * @param fixedLength The desired length of the resulting array.
     * @return A new array of length fixedLength.
     */
    private static byte[] toUnsignedFixedLength(byte[] arr, int fixedLength) {
        byte[] fixed = new byte[fixedLength];
        int offset = fixedLength - arr.length;
        int srcPos = Math.max(-offset, 0);
        int dstPos = Math.max(offset, 0);
        int copyLength = Math.min(arr.length, fixedLength);
        System.arraycopy(arr, srcPos, fixed, dstPos, copyLength);
        return fixed;
    }

    /**
     * Encode an EC public key in the COSE/CBOR format.
     *
     * @param publicKey The public key.
     * @return A COSE_Key-encoded public key as byte array.
     * @throws VirgilException
     */
    public static byte[] coseEncodePublicKey(PublicKey publicKey) throws VirgilException {
        ECPublicKey ecPublicKey = (ECPublicKey) publicKey;
        ECPoint point = ecPublicKey.getW();
        // ECPoint coordinates are *unsigned* values that span the range [0, 2**32). The getAffine
        // methods return BigInteger objects, which are signed. toByteArray will output a byte array
        // containing the two's complement representation of the value, outputting only as many
        // bytes as necessary to do so. We want an unsigned byte array of length 32, but when we
        // call toByteArray, we could get:
        // 1) A 33-byte array, if the point's unsigned representation has a high 1 bit.
        //    toByteArray will prepend a zero byte to keep the value positive.
        // 2) A <32-byte array, if the point's unsigned representation has 9 or more high zero
        //    bits.
        // Due to this, we need to either chop off the high zero byte or prepend zero bytes
        // until we have a 32-length byte array.
        byte[] xVariableLength = point.getAffineX().toByteArray();
        byte[] yVariableLength = point.getAffineY().toByteArray();

        byte[] x = toUnsignedFixedLength(xVariableLength, 32);
        assert x.length == 32;
        byte[] y = toUnsignedFixedLength(yVariableLength, 32);
        assert y.length == 32;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            new CborEncoder(baos).encode(new CborBuilder()
                    .addMap()
                    .put(1, 2)  // kty: EC2 key type
                    .put(3, -7) // alg: ES256 sig algorithm
                    .put(-1, 1) // crv: P-256 curve
                    .put(-2, x) // x-coord
                    .put(-3, y) // y-coord
                    .end()
                    .build()
            );
        } catch (CborException e) {
            throw new VirgilException("couldn't serialize to cbor", e);
        }
        return baos.toByteArray();
    }

    // doublek
    public byte[] asCBORForPublicKey(String keyPairAlias) throws VirgilException {
        Certificate cert = getCertificateFromKeyStore(keyPairAlias);
        return coseEncodePublicKey(cert.getPublicKey());
    }

    /**
     * Increment the credential use counter for this credential.
     *
     * @param credential The credential whose counter we want to increase.
     * @return The value of the counter before incrementing.
     */
    public int incrementCredentialUseCounter(PublicKeyCredentialSource credential) {
        return db.credentialDao().incrementUseCounter(credential);
    }

    //
    // Make Certificate
    // doublek
    //
    public X509Certificate generateSelfSignedCertificate(KeyPair keyPair, byte[] privateKey) throws IOException, OperatorCreationException, CertificateException {
        AlgorithmIdentifier sigAlgId = new DefaultSignatureAlgorithmIdentifierFinder().find("SHA256withRSA"); // don't use SHA1withRSA. It's not secure anymore.
        AlgorithmIdentifier digAlgId = new DefaultDigestAlgorithmIdentifierFinder().find(sigAlgId);
        AsymmetricKeyParameter keyParam = PrivateKeyFactory.createKey(privateKey);
        SubjectPublicKeyInfo spki = SubjectPublicKeyInfo.getInstance(keyPair.getPublic().getEncoded());
        ContentSigner signer = new BcRSAContentSignerBuilder(sigAlgId, digAlgId).build(keyParam);
        X500Name issuer = new X500Name("CN=OneMoreSecurity, L=Korea");
        X500Name subject = new X500Name("CN=OMSFIDO2, L=Korea");
        BigInteger serial = BigInteger.valueOf(1); // Update with unique one if it will be used to identify this certificate
        Calendar notBefore = Calendar.getInstance();
        Calendar notAfter = Calendar.getInstance();
        notAfter.add(Calendar.YEAR, 20); // This certificate is valid for 20 years.

        X509v3CertificateBuilder v3CertGen = new X509v3CertificateBuilder(issuer,
                serial,
                notBefore.getTime(),
                notAfter.getTime(),
                subject,
                spki);
        X509CertificateHolder certificateHolder = v3CertGen.build(signer);

        return new JcaX509CertificateConverter().getCertificate(certificateHolder);
    }

    public boolean deleteCertFromKeyStore(@NonNull String alias)
    {
        try {
            keyStore.deleteEntry(alias);
        } catch (KeyStoreException e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }

    public Certificate getCertificateFromKeyStore(@NonNull String alias)
    {
        java.security.cert.Certificate cert = null;
        try {
            cert = keyStore.getCertificate(alias);
        } catch (KeyStoreException e) {
            e.printStackTrace();
        }
        return cert;
    }
}
