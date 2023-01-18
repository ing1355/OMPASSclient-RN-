import * as RootNavigation from '../Route/Router';

const Pattern = (props) => {
    if (props.type && props.callback) {
        const {type, callback} = props;
        const params = {
            cancelCallback: props.cancelCallback,
            callback: () => {
                callback();
            },
            text: type
        };
        // if(props.type === '등록') RootNavigation.replace('Pattern', params)
        RootNavigation.navigate('Pattern', params)
    } else if(props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.navigate('Pattern', params)
    } else if(props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.navigate('Pattern', params)
    }
}

export default Pattern;