export function Auth_Count(Authentications) {
    let count = 0;
    Object.keys(Authentications).map(key => {
        if (Authentications[key]) count++;
    })
    return count;
}