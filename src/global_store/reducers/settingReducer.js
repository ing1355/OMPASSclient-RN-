import types from '../actions/types';

const settings = {
    exitAfterAuth : false,
    logsNum: 10
};

export default (state = settings, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.settingChange:
        return Object.assign({}, payload);
    default:
      return state;
  }
};
