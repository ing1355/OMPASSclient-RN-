import * as RootNavigation from '../Route/Router';

const Face = (props) => {
    if (props.type && props.callback) {
        const params = {
            cancelCallback: props.cancelCallback,
            callback: () => {
                props.callback();
            },
            text: props.type
        };
        // if(props.type === '등록') RootNavigation.replace('Face', params)
        RootNavigation.navigate('Face', params)
    } else if (props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.navigate('Face', params)
    } else if (props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.navigate('Face', params)
    }
}

export default Face;