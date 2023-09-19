import { NativeModules } from 'react-native';
import {getRouteName} from '../Route/Router';

const { 
    Security, 
    Remove, 
    RemoveAll, 
    AuthLock, 
    isLock, 
    isAllLock,
    errorCountAdd, 
    getErrorCount, 
    resetErrorCount, 
    InitSecurity, 
    Verification,
    isVerification,
    getRegisteredCredential
} = NativeModules.Security;

export async function getRegisteredCredentialsByDomain(domain, userId) {
    return await getRegisteredCredential(domain, userId)
}

export function VerificationSuccess(suc_callback) {
    Verification(cal => {
        if(cal === 'success' && suc_callback) {
            suc_callback();
        } else if(cal === 'fail' && fail_callback){
            fail_callback();
        }
    })
}

export function IsVerification(suc_callback, fail_callback) {
    isVerification(cal => {
        if(cal === 'success' && suc_callback) {
            suc_callback();
        } else if(cal === 'fail' && fail_callback){
            fail_callback();
        }
    })
}

export function AuthSecurity(value, auth_name, auth_type, suc_callback, err_callback) {
    Security(value, auth_name, auth_type, suc => {
        if (suc_callback) suc_callback(suc);
    }, err => {
        if (err_callback) err_callback();
    });
}

export function initSecurity(suc_callback) {
    InitSecurity(suc => {
        if (suc_callback) suc_callback(suc);
    });
}

export function RemoveSecurity(auth_name, suc_callback, err_callback) {
    Remove(auth_name, (suc) => {
        if (suc_callback) suc_callback();
    }, (err) => {
        if (err_callback) err_callback();
    })
}

export function RemoveAllSecurity(suc_callback, err_callback) {
    RemoveAll((suc) => {
        if (suc_callback) suc_callback();
    }, (err) => {
        if (err_callback) err_callback();
    })
}

export function AuthenticateLock(err_count) {
    AuthLock(getRouteName(), (Math.floor(Date.now() / 1000) + (err_count - 4) * 30).toString(), cal => {
    })
}

export async function AuthenticateIsLock(suc_callback, name) {
    return isLock(name ? name : getRouteName(), cal => {
        if(cal && suc_callback) suc_callback(cal);
    })
}

export async function AuthenticateIsAllLock(suc_callback) {
    return isAllLock(Math.floor(Date.now() / 1000), cal => {
        if(cal && suc_callback) suc_callback(cal);
    })
}

export function AuthenticateErrorCountAdd(suc_callback) {
    return errorCountAdd(getRouteName(), cal => {
        if(suc_callback) suc_callback(cal);
    })
}

export async function AuthenticateGetErrorCount(suc_callback) {
    return getErrorCount(getRouteName(),cal => {
        if(suc_callback) suc_callback(parseInt(cal));
    });
}

export function AuthenticateResetErrorCount() {
    resetErrorCount(getRouteName(), cal => {
        
    })
}