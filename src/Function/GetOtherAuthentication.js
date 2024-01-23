import { getRouteName, replace } from '../Route/Router';

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getOtherAuthentication({ Authentications, pass, callback, text, type }) {
    let check = 'unlock';
    let result = null;

    for (let item in Authentications) {
        if (getRouteName().toLowerCase() !== item && (pass ? !pass.includes(item) : true) && Authentications[item]) {
            result = item;
            break;
        } else {
            result = 'None';
        }
        check = 'unlock';
    }

    if (result !== 'None') {
        replace(capitalize(result), {
            callback, text, pass: pass ? pass.concat(type) : [type]
        });
        return true
    } else {
        return false
    }
}