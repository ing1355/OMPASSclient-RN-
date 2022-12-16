import * as RootNavigation from '../Route/Router';

const Face = (props) => {
    if (props.type && props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        RootNavigation.replace('Face', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.replace('Face', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.replace('Face', params)
    }
}

export default Face;