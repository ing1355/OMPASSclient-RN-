import * as RootNavigation from '../Route/Router';

const Pattern = (props) => {
    if (props.type && props.callback) {
        const {type, callback} = props;
        const params = {
            callback: () => {
                callback();
            },
            text: type
        };
        RootNavigation.replace('Pattern', params)
    } else if(props.callback) {
        const params = {
            callback: () => {
                props.callback();
            },
            text: 'first_regist'
        }
        RootNavigation.replace('Pattern', params)
    } else if(props.AuthenticateCallback) {
        const params = {
            callback: () => {
                props.AuthenticateCallback();
            },
            text: 'local_Authenticate'
        }
        RootNavigation.replace('Pattern', params)
    }
}

export default Pattern;