import { AuthenticationsConst } from '../../Constans/Authentications';
import types from '../actions/types';

export const Authentications = {...AuthenticationsConst};

export default (state = Authentications, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.settingAuthentication:
      return Object.assign({}, {...state}, payload);
    case types.settingAllAuthentication:
      return payload;
    default:
      return state;
  }
};
