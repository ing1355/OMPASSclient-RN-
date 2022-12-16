export function isAuthenticateReady(Authentications, currentAuth) {
    let count = 0;
    Object.keys(Authentications).map(key => {
        if (Authentications[key]) count++;
    })

    if (count < 2) {
        return '인증방식 부족';
    }

    if (!currentAuth) {
        return '현재인증방식없음'
    }

    return '가능';
}