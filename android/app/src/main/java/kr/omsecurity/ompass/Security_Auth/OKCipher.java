package kr.omsecurity.ompass.Security_Auth;

import android.content.Context;
import android.icu.util.Calendar;
import android.os.Build;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.annotation.RequiresApi;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.security.auth.x500.X500Principal;
import javax.security.cert.CertificateException;
import java.io.IOException;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.Certificate;
import java.util.Enumeration;
import java.util.Locale;

public class OKCipher {

    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";

    private static KeyStore.Entry createKeys(Context context, String ALIAS)
            throws NoSuchAlgorithmException,
            KeyStoreException, IOException, UnrecoverableEntryException,
            NoSuchProviderException, InvalidAlgorithmParameterException, java.security.cert.CertificateException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        keyStore.load(null);
        boolean containsAlias = keyStore.containsAlias(ALIAS);

        if (!containsAlias) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                KeyPairGenerator kpg = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, "AndroidKeyStore");
                KeyGenParameterSpec spec = new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
                        .build();
                kpg.initialize(spec);
                kpg.generateKeyPair();
            } else {
                KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
                KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(context)
                        .setAlias(ALIAS)
                        .setSubject(new X500Principal("CN=" + ALIAS))
                        .setSerialNumber(BigInteger.ONE)
                        .build();
                kpg.initialize(spec);
                kpg.generateKeyPair();
            }
        }

        return keyStore.getEntry(ALIAS, null);
    }

    private static byte[] encryptUsingKey(PublicKey publicKey, byte[] bytes) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher inCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        inCipher.init(Cipher.ENCRYPT_MODE, publicKey);
        return inCipher.doFinal(bytes);
    }

    private static byte[] decryptUsingKey(PrivateKey privateKey, byte[] bytes) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher inCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        inCipher.init(Cipher.DECRYPT_MODE, privateKey);
        return inCipher.doFinal(bytes);
    }

    public static String encrypt(Context context, String plainText, String alias) throws NoSuchPaddingException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException, NoSuchAlgorithmException, KeyStoreException, CertificateException, IOException, UnrecoverableEntryException, NoSuchProviderException, InvalidAlgorithmParameterException, java.security.cert.CertificateException {
        KeyStore.Entry entry = createKeys(context, alias);
        if (entry instanceof KeyStore.PrivateKeyEntry) {
            Certificate certificate = ((KeyStore.PrivateKeyEntry) entry).getCertificate();
            PublicKey publicKey = certificate.getPublicKey();
            byte[] bytes = plainText.getBytes("UTF-8");
            byte[] encryptedBytes = encryptUsingKey(publicKey, bytes);
            byte[] base64encryptedBytes = Base64.encode(encryptedBytes, Base64.DEFAULT);
            return new String(base64encryptedBytes);
        }
        return null;
    }

    public static String decrypt(String alias, String cipherText) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException, KeyStoreException, CertificateException, IOException, UnrecoverableEntryException, java.security.cert.CertificateException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        keyStore.load(null);
        KeyStore.Entry entry = keyStore.getEntry(alias, null);
        if (entry instanceof KeyStore.PrivateKeyEntry) {
            PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) entry).getPrivateKey();
            byte[] bytes = cipherText.getBytes("UTF-8");
            byte[] base64encryptedBytes = Base64.decode(bytes, Base64.DEFAULT);
            byte[] decryptedBytes = decryptUsingKey(privateKey, base64encryptedBytes);
            return new String(decryptedBytes);
        }
        return null;
    }
}
