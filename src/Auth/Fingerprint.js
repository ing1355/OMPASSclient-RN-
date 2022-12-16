import * as RootNavigation from '../Route/Router';

const Fingerprint = (props) => {
    if (props.type && props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        RootNavigation.replace('Fingerprint', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.replace('Fingerprint', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.replace('Fingerprint', params)
    }
}

export default Fingerprint;