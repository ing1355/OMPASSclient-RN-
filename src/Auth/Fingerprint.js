import * as RootNavigation from '../Route/Router';

const Fingerprint = (props) => {
    if (props.type && props.callback) {
        const params = {
            cancelCallback: props.cancelCallback,
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        // if(props.type === '등록') RootNavigation.replace('Fingerprint', params)
        RootNavigation.navigate('Fingerprint', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.navigate('Fingerprint', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.navigate('Fingerprint', params)
    }
}

export default Fingerprint;