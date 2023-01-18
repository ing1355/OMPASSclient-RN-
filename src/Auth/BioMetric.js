import * as RootNavigation from '../Route/Router';

const BioMetric = (props) => {
    if (props.type && props.callback) {
        const params = {
            cancelCallback: props.cancelCallback,
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        // if(props.type === '등록') RootNavigation.replace('Biometrics', params)
        RootNavigation.navigate('Biometrics', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.navigate('Biometrics', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.navigate('Biometrics', params)
    }
}

export default BioMetric;