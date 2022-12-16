import types from '../actions/types';

const currentAuth = "";

export default (state = currentAuth, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.settingCurrentAuth:
        return payload;
    default:
      return state;
  }
};
