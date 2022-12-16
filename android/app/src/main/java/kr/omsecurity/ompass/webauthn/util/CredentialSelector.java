package kr.omsecurity.ompass.webauthn.util;

import kr.omsecurity.ompass.webauthn.models.PublicKeyCredentialSource;

import java.util.List;

public interface CredentialSelector {
    public PublicKeyCredentialSource selectFrom(List<PublicKeyCredentialSource> credentialList);
}
