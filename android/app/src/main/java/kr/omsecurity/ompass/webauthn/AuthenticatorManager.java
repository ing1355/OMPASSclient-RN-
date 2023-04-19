package kr.omsecurity.ompass.webauthn;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import androidx.annotation.Keep;
import androidx.annotation.RequiresApi;
import com.facebook.react.common.StandardCharsets;
import kr.omsecurity.ompass.Auth;
import kr.omsecurity.ompass.R;
import kr.omsecurity.ompass.webauthn.exceptions.VirgilException;
import kr.omsecurity.ompass.webauthn.exceptions.WebAuthnException;
import kr.omsecurity.ompass.webauthn.models.*;
import kr.omsecurity.ompass.webauthn.util.CredentialSafe;
import kr.omsecurity.ompass.webauthn.util.CredentialSelector;
import kr.omsecurity.ompass.webauthn.util.WebAuthnCryptography;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.TrustManagerFactory;
import java.io.*;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.nio.ByteBuffer;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;

import static kr.omsecurity.ompass.webauthn.WebAuthenType.CREATE;
import static kr.omsecurity.ompass.webauthn.WebAuthenType.GET;

enum WebAuthenType {
    CREATE("webauthn.create"),
    GET("webauthn.get");

    public final String label;

    WebAuthenType(String label) {
        this.label = label;
    }

    public String getValue() {
        return this.label;
    }
}

public class AuthenticatorManager {
    Authenticator authenticator;
    CredentialSafe credentialSafe;
    WebAuthnCryptography cryptography;
    Context ctx;
    String accessKey;
    String domain;
    String home;

    public AuthenticatorManager(Context ctx, String fidoAddress, String domain, String accessKey, String userId) {
        this.ctx = ctx;
        this.accessKey = accessKey;
        this.domain = domain;
        home = "https://" + fidoAddress;
//      home = "https://210.104.181.54:8383";
        setUp();
    }

    void setUp() {
        try {
            this.authenticator = new Authenticator(this.ctx, false, false);
        } catch (VirgilException e) {
            e.printStackTrace();
        }
        this.credentialSafe = this.authenticator.credentialSafe;
        this.cryptography = this.authenticator.cryptoProvider;
    }

    public static SSLContext insertCAContext(int caName, Context appCtx) throws CertificateException, IOException, KeyStoreException, NoSuchAlgorithmException, KeyManagementException {
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        // From https://www.washington.edu/itconnect/security/ca/load-der.crt
        InputStream caInput = appCtx.getResources().openRawResource(caName);
        Certificate ca = null;

        try {
            ca = cf.generateCertificate(caInput);
//            System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
        } catch (CertificateException e) {
            e.printStackTrace();
        } finally {
            caInput.close();
        }

        // Create a KeyStore containing our trusted CAs
        String keyStoreType = KeyStore.getDefaultType();
        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        final KeyStore androidCAStore = KeyStore.getInstance("AndroidCAStore");
        androidCAStore.load(null);
        final Enumeration<String> androidCAStoreAlias = androidCAStore.aliases();
        while(androidCAStoreAlias.hasMoreElements()) {
            final String param = androidCAStoreAlias.nextElement();
            keyStore.setCertificateEntry(param, androidCAStore.getCertificate(param));
        }
        keyStore.setCertificateEntry("ca", ca);

        // Create a TrustManager that trusts the CAs in our KeyStore
        String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);

        // Create an SSLContext that uses our TrustManager
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, tmf.getTrustManagers(), null);
        return context;
    }

    public String getGetAssertionJson(String id,
                                      String clientDataHashB64ForAuthentication,
                                      boolean requireUserPresence,
                                      boolean requireUserVerification,
                                      String domain) {
        return "{" +
                "\"allowCredentialDescriptorList\": [{" +
                "\"id\":\"" + id + "\", " +
                "\"type\": \"public-key\"" +
                "}]," +
                "\"authenticatorExtensions\": \"\"," +
                "\"clientDataHash\": \"" + clientDataHashB64ForAuthentication + "\"," +
                "\"requireUserPresence\": \"" + requireUserPresence + "\"," +
                "\"requireUserVerification\": \"" + requireUserVerification + "\"," +
                "\"rpId\": \"" + domain + "\"" +
                "}";
    }

    public String getCredentialJson(String clientDataHash,
                                    int publicKeyAlg,
                                    String excludeCredentialsID,
                                    boolean requireResidentKey,
                                    boolean requireUserPresence,
                                    boolean requireUserVerification,
                                    String rpName,
                                    String rpId,
                                    String userName,
                                    String userDisplayName,
                                    String userId
    ) {
        return "{" +
                "\"authenticatorExtensions\": \"\", " +
                "\"clientDataHash\": \"" + clientDataHash + "\", " +
                "\"credTypesAndPubKeyAlgs\": [" +
                "[\"public-key\", " + publicKeyAlg + "]" +
                "]," +
                "\"excludeCredentials\": [" +
                "{" +
                "\"type\": \"public-key\"," +
                "\"id\": \"" + excludeCredentialsID + "\"" +
                //"// \"transports\" member optional but ignored\n" +
                "}" +
                "]," +
                "\"requireResidentKey\": \"" + requireResidentKey + "\"," +
                "\"requireUserPresence\": \"" + requireUserPresence + "\"," +
                "\"requireUserVerification\": \"" + requireUserVerification + "\"," +
                "\"rp\": {" +
                "\"name\": \"" + rpName + "\"," +
                "\"id\": \"" + rpId + "\"" +
                "}," +
                "\"user\": {" +
                "\"name\": \"" + userName + "\"," +
                "\"displayName\": \"" + userDisplayName + "\"," +
                "\"id\": \"" + userId + "\"" +
                "}" +
                "}";
    }

    public String getCredentialJson(String clientDataHash,
                                    int publicKeyAlg,
                                    String excludeCredentialsID,
                                    boolean requireResidentKey,
                                    boolean requireUserPresence,
                                    boolean requireUserVerification,
                                    String rpName,
                                    String rpId,
                                    String userName,
                                    String userId
    ) {
        return "{" +
                "\"authenticatorExtensions\": \"\", " +
                "\"clientDataHash\": \"" + clientDataHash + "\", " +
                "\"credTypesAndPubKeyAlgs\": [" +
                "[\"public-key\", " + publicKeyAlg + "]" +
                "]," +
                "\"excludeCredentials\": [" +
                "{" +
                "\"type\": \"public-key\"," +
                "\"id\": \"" + excludeCredentialsID + "\"" +
                //"// \"transports\" member optional but ignored\n" +
                "}" +
                "]," +
                "\"requireResidentKey\": \"" + requireResidentKey + "\"," +
                "\"requireUserPresence\": \"" + requireUserPresence + "\"," +
                "\"requireUserVerification\": \"" + requireUserVerification + "\"," +
                "\"rp\": {" +
                "\"name\": \"" + rpName + "\"," +
                "\"id\": \"" + rpId + "\"" +
                "}," +
                "\"user\": {" +
                "\"name\": \"" + userName + "\"," +
                "\"id\": \"" + userId + "\"" +
                "}" +
                "}";
    }

    String makeAuthenticateJson(String redirectUri, int did, String username) {
        return "{\"redirectUri\":\"" + redirectUri + "\"," +
                "\"did\":\"" + did + "\"," +
                "\"username\":\"" + username + "\"," +
                "\"domain\":\"" + domain + "\"}";
    }

    public Boolean jsonIsEmpty(JSONObject jsonObject) {
        return !jsonObject.keys().hasNext();
    }

    public JSONObject preAuthenticate(String redirectUri, int did, String username) {
        String jsonData = makeAuthenticateJson(redirectUri, did, username);
        String preAuthenticate = home + "/fido2/preauthenticate";
        URL urlPreAuthenticate = null;
        try {
            urlPreAuthenticate = new URL(preAuthenticate);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        URL finalUrlPreAuthenticate = urlPreAuthenticate;
        final JSONObject[] return_value = {new JSONObject()};
        final long time = System.currentTimeMillis();
        final boolean[] isComplete = {false};
        new Thread(new Runnable() {
            HttpsURLConnection conPreAuthenticate = null;
            @Override
            public void run() {
                try {
                    conPreAuthenticate = (HttpsURLConnection) finalUrlPreAuthenticate.openConnection();
//                    conPreAuthenticate.setSSLSocketFactory(insertCAContext(R.raw.thawte_rsa_ca_2018).getSocketFactory());
                    conPreAuthenticate.setRequestMethod("POST");
                    conPreAuthenticate.setRequestProperty("Content-Type", "application/json; utf-8");
                    conPreAuthenticate.setRequestProperty("Accept", "application/json");
                    conPreAuthenticate.setConnectTimeout(5000);
                    conPreAuthenticate.setRequestProperty("accessKey", accessKey);
                    conPreAuthenticate.setDoOutput(true);

                    try (OutputStream os = conPreAuthenticate.getOutputStream()) {
                        byte[] input = jsonData.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    } catch (SSLPeerUnverifiedException e) {
                        e.printStackTrace();
                        Auth.err_msg = "SSLerror";
                        return_value[0] = null;
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    try (BufferedReader br = new BufferedReader(
                            new InputStreamReader(conPreAuthenticate.getInputStream(), "utf-8"))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = br.readLine()) != null) {
                            response.append(responseLine.trim());
                        }
                        // System.out.println("DEBUG : " + response.toString());

                        JSONObject json = new JSONObject(response.toString());
                        if(json.has("Response")) {
                            String temp = json.getString("Response");
                            JSONObject jsonSub = new JSONObject(temp);

                            JSONArray allowCredentials = jsonSub.getJSONArray("allowCredentials");
                            JSONObject jsonObject = (JSONObject) allowCredentials.get(0);
                            return_value[0].put("authorization", conPreAuthenticate.getHeaderField("Authorization"));
                            return_value[0].put("challenge",jsonSub.getString("challenge"));
                            return_value[0].put("userId",jsonObject.getString("id"));
                            isComplete[0] = true;
                        } else {
                            Auth.err_msg = json.getString("isSuccess");
                            return_value[0] = null;
                        }

                    } catch (JSONException e) {
                        Auth.err_msg = "CODE001";
                        e.printStackTrace();
                        return_value[0] = null;
                    }
                } catch (SocketTimeoutException e) {
                    Auth.err_msg = "CODE003";
                    e.printStackTrace();
                    return_value[0] = null;
                } catch (IOException e) {
                    Auth.err_msg = "CODE002";
                    e.printStackTrace();
                    return_value[0] = null;
                }
//                catch (CertificateException | KeyStoreException | NoSuchAlgorithmException | KeyManagementException e) {
//                    Auth.err_msg = "CODE004";
//                    e.printStackTrace();
//                }
                finally {
                    conPreAuthenticate.disconnect();
                }
            }
        }).start();
        while(System.currentTimeMillis() - time <= 5000) {
            if(Auth.err_msg != null) break;
            if(isComplete[0]) {
                if(!jsonIsEmpty(return_value[0])) break;
            }
            if(System.currentTimeMillis() - time >= 5000) {
                Auth.err_msg = "CODE003";
                break;
            }
        }
        return return_value[0];
    }

    String getClientDataJosn(WebAuthenType type, String challenge) {
        return "{\"type\":\"" + type.getValue() + "\"," +
                "\"challenge\":\"" + challenge + "\"," +
                "\"origin\":\"https://" + domain + "\"}";
    }


    @RequiresApi(api = Build.VERSION_CODES.P)
    public void tryAuthenticate(String username, String authorization, String challenge, String userId, String pushToken, String clientInfo) {
        String clientDataJSONDataForAuthenticate = getClientDataJosn(GET, challenge);
        MessageDigest digestAuthenticate = null;
        try {
            digestAuthenticate = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        byte[] clientDataHashForAuthentication = digestAuthenticate.digest(clientDataJSONDataForAuthenticate.getBytes(StandardCharsets.UTF_8));
        String clientDataHashB64ForAuthentication = Base64.encodeToString(clientDataHashForAuthentication, Base64.URL_SAFE | Base64.NO_WRAP);
//        String clientDataHashB64ForAuthentication = Base64.encodeToString(clientDataHashForAuthentication, Base64.DEFAULT).trim();

        String assertionJson = getGetAssertionJson(userId,
                clientDataHashB64ForAuthentication,
                true,
                false,
                domain);

        String credentialJson = getCredentialJson(clientDataHashB64ForAuthentication,
                -7,
                "cre",
                true,
                true,
                false,
                domain,
                domain,
                username,
                userId);

        // System.out.println("json test : " + credentialJson);

        AuthenticatorMakeCredentialOptions makeCredentialOptionsForAuthenticate = AuthenticatorMakeCredentialOptions.fromJSON(credentialJson);
        makeCredentialOptionsForAuthenticate.clientDataHash = clientDataHashForAuthentication;

        AttestationObject attObjForAuthenticate = null;
        try {
            attObjForAuthenticate = authenticator.makeCredential(makeCredentialOptionsForAuthenticate, false);
            if(attObjForAuthenticate == null) {
                Auth.err_msg = "앱 재설치";
                return;
            }
        } catch (WebAuthnException e) {
            e.printStackTrace();
        } catch (VirgilException e) {
            e.printStackTrace();
        }

        byte[] credentialId = null;
        try {
            credentialId = attObjForAuthenticate.getCredentialId();
        } catch(NullPointerException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
            return;
        }
        // Now let's see if we can generate an assertion based on the returned credential ID
        AuthenticatorGetAssertionOptions getAssertionOptions = AuthenticatorGetAssertionOptions.fromJSON(assertionJson);
        getAssertionOptions.allowCredentialDescriptorList.add(new PublicKeyCredentialDescriptor("public-key", credentialId, null));

        AuthenticatorGetAssertionResult getAssertionResult = null;
        try {
            getAssertionResult = authenticator.getAssertion(getAssertionOptions, new CredentialSelector() {
                @Override
                public PublicKeyCredentialSource selectFrom(List<PublicKeyCredentialSource> credentialList) {
                    return credentialList.get(0);
                }
            });
        } catch (WebAuthnException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
            return;
        } catch (VirgilException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
            return;
        } catch (NullPointerException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
            return;
        }

        List<PublicKeyCredentialSource> sources = null;
        PublicKeyCredentialSource source = null;
        try {
            ByteBuffer resultBuf = ByteBuffer.allocate(getAssertionOptions.clientDataHash.length + getAssertionResult.authenticatorData.length);
            resultBuf.put(getAssertionResult.authenticatorData);
            resultBuf.put(getAssertionOptions.clientDataHash);
            sources = this.credentialSafe.getKeysForEntity(makeCredentialOptionsForAuthenticate.rpEntity.id);
            source = sources.get(sources.size() - 1);
        } catch (NullPointerException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
            return;
        }

        Certificate cert = this.credentialSafe.getCertificateFromKeyStore(source.keyPairAlias);

        String authenticateURL = home + "/fido2/authenticate";
        URL urlAuthenticate = null;
        try {
            urlAuthenticate = new URL(authenticateURL);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        final long time = System.currentTimeMillis();
        URL finalUrlAuthenticate = urlAuthenticate;
        AuthenticatorGetAssertionResult finalGetAssertionResult = getAssertionResult;
        final boolean[] success = {false};
        new Thread(new Runnable() {
            HttpsURLConnection conAuthenticate = null;
            @Override
            public void run() {
                try {

                    conAuthenticate = (HttpsURLConnection) finalUrlAuthenticate.openConnection();
//                    conAuthenticate.setSSLSocketFactory(insertCAContext(R.raw.thawte_rsa_ca_2018).getSocketFactory());
                    conAuthenticate.setRequestMethod("POST");
                    conAuthenticate.setRequestProperty("Content-Type", "application/json; utf-8");
                    conAuthenticate.setRequestProperty("Accept", "application/json");
                    conAuthenticate.setConnectTimeout(5000);
                    conAuthenticate.setRequestProperty("accessKey", accessKey);
                    conAuthenticate.setRequestProperty("Authorization", authorization);
                    conAuthenticate.setDoOutput(true);

                    String b64ClientDataJSON = Base64.encodeToString(clientDataJSONDataForAuthenticate.getBytes(StandardCharsets.UTF_8), Base64.URL_SAFE | Base64.NO_WRAP).trim();
                    String b64Signature = Base64.encodeToString(finalGetAssertionResult.signature, Base64.URL_SAFE | Base64.NO_WRAP).trim();
                    String b64SelectedCredentialUserHandle = Base64.encodeToString(finalGetAssertionResult.selectedCredentialUserHandle, Base64.URL_SAFE | Base64.NO_WRAP).trim();
                    String b64AuthenticatorData = Base64.encodeToString(finalGetAssertionResult.authenticatorData, Base64.URL_SAFE | Base64.NO_WRAP).trim();

                    String jsonRegister = makeResponseJSONForAuthenticate(b64AuthenticatorData, b64Signature, b64SelectedCredentialUserHandle, b64ClientDataJSON, userId, pushToken, clientInfo);
                     System.out.println("Authenticate Json Data : " + jsonRegister);
                    try (OutputStream os = conAuthenticate.getOutputStream()) {
                        byte[] input = jsonRegister.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    } catch (SSLPeerUnverifiedException e) {
                        e.printStackTrace();
                        Auth.err_msg = "SSLerror";
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    try (BufferedReader br = new BufferedReader(
                            new InputStreamReader(conAuthenticate.getInputStream(), "utf-8"))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = br.readLine()) != null) {
                            response.append(responseLine.trim());
                        }
                        // System.out.println("DEBUG : " + response.toString());
                        JSONObject json = new JSONObject(response.toString());
                        String response_msg = json.getString("isSuccess");
                        Auth.authenticateToken = conAuthenticate.getHeaderField("Authorization");
                        if(response_msg.equals("true")) {
                            success[0] = true;
                            return;
                        }
                        Auth.err_msg = response_msg;
                    } catch (JSONException e) {
                        Auth.err_msg = "CODE001 " + e;
                        e.printStackTrace();
                    }
                } catch (java.net.SocketTimeoutException e) {
                    Auth.err_msg = "CODE003";
                    e.printStackTrace();
                } catch (IOException e) {
                    Auth.err_msg = "CODE002";
                    e.printStackTrace();
                }
//                catch (CertificateException | KeyStoreException | NoSuchAlgorithmException | KeyManagementException e) {
//                    Auth.err_msg = "CODE004";
//                    e.printStackTrace();
//                }
                finally {
                    conAuthenticate.disconnect();
                }
            }
        }).start();

        while(System.currentTimeMillis() - time <= 5000) {
            if(Auth.err_msg != null) break;
            if(success[0]) break;
            if(System.currentTimeMillis() - time >= 5000) {
                Auth.err_msg = "CODE003";
                break;
            }
        }
    }

    String getPreRegisterJson(String username,
                              String displayName,
                              String redirectUri,
                              int did) {
        System.out.println("domain : " + domain);
        return "{\"username\" : \"" + username + "\", \"displayName\": \"" + displayName + "\", \"domain\" : \"" + domain + "\", \"redirectUri\" : \"" + redirectUri + "\", \"did\" : " + did + "}";
    }

    //
    // Try, PreRegister
    //
    public JSONObject preRegister(String username, String displayName, String redirectUri, int did) {
        String jsonString = getPreRegisterJson(username, displayName, redirectUri, did);
        String urlString = home + "/fido2/preregister";
        URL url = null;
        final JSONObject[] return_value = {new JSONObject()};
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        URL finalUrl = url;
        // System.out.println("preRegister url : " + url);
        final long time = System.currentTimeMillis();
        final boolean[] isComplete = {false};

        Bundle bundle = new Bundle();
        try {
            JSONObject jsonObject = new JSONObject(jsonString);
            Iterator<String> it = jsonObject.keys();
            while(it.hasNext()) {
                String key = it.next();
                bundle.putString(key,jsonObject.getString(key));
            }
        } catch (JSONException e) {
            Auth.err_msg = "CODE001";
            e.printStackTrace();
            return null;
        }
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                HttpsURLConnection con = null;
                try {
                    con = (HttpsURLConnection) finalUrl.openConnection();
//                    con.setSSLSocketFactory(insertCAContext(R.raw.thawte_rsa_ca_2018).getSocketFactory());
                    con.setRequestMethod("POST");
                    con.setRequestProperty("Content-Type", "application/json; utf-8");
                    con.setRequestProperty("Accept", "application/json");
                    con.setConnectTimeout(5000);
                    con.setReadTimeout(5000);
                    con.setRequestProperty("accessKey", accessKey);
                    con.setDoOutput(true);

                    try (OutputStream os = con.getOutputStream()) {
                        byte[] input = jsonString.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    } catch (SSLPeerUnverifiedException e) {
                        e.printStackTrace();
                        Auth.err_msg = "SSLerror";
                        return_value[0] = null;
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    try (BufferedReader br = new BufferedReader(
                            new InputStreamReader(con.getInputStream(), "utf-8"))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = br.readLine()) != null) {
                            response.append(responseLine.trim());
                        }

                        // System.out.println("DEBUG : " + response.toString());
                        JSONObject json = new JSONObject(response.toString());
                        System.out.println("Register Response : " + response.toString());

                        if(json.has("Response")) {
                            String temp = json.getString("Response");

                            JSONObject jsonSub = new JSONObject(temp);

                            String user = jsonSub.getString("user");
                            JSONObject jsonUser = new JSONObject(user);

                            return_value[0].put("authorization",con.getHeaderField("Authorization"));
                            return_value[0].put("challenge",jsonSub.getString("challenge"));
                            return_value[0].put("userId",jsonUser.getString("id"));
                            isComplete[0] = true;
                        } else {
                            Auth.err_msg = json.getString("isSuccess");
                            return_value[0] = null;
                        }

                    } catch (JSONException e) {
                        Auth.err_msg = "CODE001";
                        e.printStackTrace();
                        return_value[0] = null;
                    }
                } catch (SocketTimeoutException e) {
                    Auth.err_msg = "CODE003";
                    e.printStackTrace();
                    return_value[0] = null;
                } catch (IOException  e) {
                    Auth.err_msg = "CODE002";
                    e.printStackTrace();
                    return_value[0] = null;
                }
//                catch (CertificateException | KeyManagementException | NoSuchAlgorithmException | KeyStoreException e) {
//                    Auth.err_msg = "CODE004";
//                    e.printStackTrace();
//                }
                finally {
                    con.disconnect();
                }
            }
        });
        thread.start();
        while(System.currentTimeMillis() - time <= 5000) {
            if(Auth.err_msg != null) break;
            if(isComplete[0]) {
                if(!jsonIsEmpty(return_value[0])) break;
            }
            if(System.currentTimeMillis() - time >= 5000) {
                Auth.err_msg = "CODE003";
                break;
            }
        }
        return return_value[0];
    }

    String makeResponseJSONForRegister(String cborB64,
                                       String b64ClientDataJSON,
                                       String userId,
                                       String pushToken,
                                       String clientInfo) {
        return "{\"response\":{\"attestationObject\":\"" + cborB64 + "\"," +
                "\"clientDataJSON\":\"" + b64ClientDataJSON +
                "\"}," +
                "\"rawId\":\"" + userId + "\"," +
                "\"id\":\"" + userId + "\"," +
                "\"type\":\"public-key\"," +
                "\"ompass\":{\"pushToken\":\"" + pushToken + "\"," +
                "\"clientInfo\":" + clientInfo + "}" +
                "}";
    }

    String makeResponseJSONForAuthenticate(String b64AuthenticatorData, String b64Signature, String b64SelectedCredentialUserHandle, String b64ClientDataJSON, String id, String pushToken, String clientInfo) {
        return new StringBuilder().append("{\"response\":{\"authenticatorData\":\"").append(b64AuthenticatorData).append("\",")
                .append("\"signature\":\"").append(b64Signature).append("\",")
                .append("\"userHandle\":\"").append(b64SelectedCredentialUserHandle).append("\",")
                .append("\"clientDataJSON\":\"").append(b64ClientDataJSON).append("\"},")
                .append("\"rawId\":\"").append(id).append("\",")
                .append("\"id\":\"").append(id).append("\",")
                .append("\"type\":\"public-key\"").append(",")
                .append("\"ompass\":").append("{")
                    .append("\"pushToken\":").append("\"").append(pushToken).append("\",")
                    .append("\"clientInfo\":").append(clientInfo)
                .append("}").append("}").toString();
    }

    //
    // Try, Register
    //
    @RequiresApi(api = Build.VERSION_CODES.P)
    @Keep
    public void tryRegister(String pushToken, String username, String displayName, String authorization, String challenge, String userId, String clientInfo) {
        String clientDataJSONData = getClientDataJosn(CREATE, challenge);

        MessageDigest digest = null;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }



        byte[] clientDataHash = digest.digest(clientDataJSONData.getBytes(StandardCharsets.UTF_8));

        String clientDataHashB64ForRegister = Base64.encodeToString(clientDataHash, Base64.URL_SAFE | Base64.NO_WRAP).trim();

        String credentialJsonForRegister = getCredentialJson(clientDataHashB64ForRegister,
                -7,
                "AA",
                true,
                true,
                false,
                domain,
                domain,
                username,
                displayName,
                userId);
        AuthenticatorMakeCredentialOptions makeCredentialOptions = AuthenticatorMakeCredentialOptions.fromJSON(credentialJsonForRegister);
        makeCredentialOptions.clientDataHash = clientDataHash;
        byte[] cborEncoded = new byte[0];
        AttestationObject attObj = null;
        try {
            attObj = authenticator.makeCredential(makeCredentialOptions, true);
            cborEncoded = attObj.asCBOR();
        } catch (WebAuthnException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
        } catch (VirgilException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";
        } catch (NullPointerException e) {
            e.printStackTrace();
            Auth.err_msg = "CODE004";

        }

        String cborB64 = Base64.encodeToString(cborEncoded, Base64.URL_SAFE | Base64.NO_WRAP);


        String stringRegister = home + "/fido2/register/type/ompass";
//        String stringRegister = home + "/fido2/register";
        URL urlRegister = null;
        try {
            urlRegister = new URL(stringRegister);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

        final HttpsURLConnection[] conRegister = {null};
        URL finalUrlRegister = urlRegister;
        final long time = System.currentTimeMillis();
        final boolean[] success = {false};
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    conRegister[0] = (HttpsURLConnection) finalUrlRegister.openConnection();
//                    conRegister[0].setSSLSocketFactory(insertCAContext(R.raw.thawte_rsa_ca_2018).getSocketFactory());
                    conRegister[0].setRequestMethod("POST");
                    conRegister[0].setRequestProperty("Content-Type", "application/json; utf-8");
                    conRegister[0].setRequestProperty("Accept", "application/json");
                    conRegister[0].setConnectTimeout(5000);
                    conRegister[0].setConnectTimeout(5000);
                    conRegister[0].setRequestProperty("accessKey", accessKey);
                    conRegister[0].setRequestProperty("Authorization", authorization);
                    conRegister[0].setDoOutput(true);

                    String b64ClientDataJSON = Base64.encodeToString(clientDataJSONData.getBytes(StandardCharsets.UTF_8), Base64.URL_SAFE | Base64.NO_WRAP);

                    String jsonRegister = makeResponseJSONForRegister(cborB64, b64ClientDataJSON, userId, pushToken, clientInfo);
                    // System.out.println("Register Json : " + jsonRegister);

                    try (OutputStream os = conRegister[0].getOutputStream()) {
                        byte[] input = jsonRegister.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    } catch (SSLPeerUnverifiedException e) {
                        e.printStackTrace();
                        Auth.err_msg = "SSLerror";
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    try (BufferedReader br = new BufferedReader(
                            new InputStreamReader(conRegister[0].getInputStream(), "utf-8"))) {
                        StringBuilder response = new StringBuilder();
                        String responseLine = null;
                        while ((responseLine = br.readLine()) != null) {
                            response.append(responseLine.trim());
                        }
                        // System.out.println("DEBUG : " + response.toString());
                        JSONObject json = new JSONObject(response.toString());
                        String response_msg = json.getString("isSuccess");
                        if(response_msg.equals("true")) {
                            success[0] = true;
                            return;
                        }
                        Auth.err_msg = response_msg;
                    } catch (JSONException e) {
                        Auth.err_msg = "CODE001";
                        e.printStackTrace();
                    }
                } catch (SocketTimeoutException e) {
                    Auth.err_msg = "CODE003";
                    e.printStackTrace();
                } catch (IOException e) {
                    Auth.err_msg = "CODE002";
                    e.printStackTrace();
                }
//                catch (CertificateException | NoSuchAlgorithmException | KeyStoreException | KeyManagementException e) {
//                    Auth.err_msg = "CODE004";
//                    e.printStackTrace();
//                }
                finally {
                    conRegister[0].disconnect();
                }

            }
        }).start();

        while(System.currentTimeMillis() - time <= 5000) {
            if(Auth.err_msg != null) break;
            if(success[0]) break;
            if(System.currentTimeMillis() - time >= 5000) {
                Auth.err_msg = "CODE003";
                break;
            }
        }
    }
}

