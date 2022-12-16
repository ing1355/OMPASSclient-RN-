import * as RootNavigation from '../Route/Router';

const BioMetric = (props) => {
    if (props.type && props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        RootNavigation.replace('Biometrics', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.replace('Biometrics', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.replace('Biometrics', params)
    }
}

export default BioMetric;