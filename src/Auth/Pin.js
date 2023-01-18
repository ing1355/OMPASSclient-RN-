import * as RootNavigation from '../Route/Router';

const Pin = (props) => {
    if (props.type && props.callback) {
        const { type, callback } = props;
        const params = {
            cancelCallback: props.cancelCallback,
            callback: () => {
                callback();
            },
            text: type
        };
        // if(props.type === '등록') RootNavigation.replace('Pin', params)
        RootNavigation.navigate('Pin', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.navigate('Pin', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.navigate('Pin', params)
    }
}

export default Pin;