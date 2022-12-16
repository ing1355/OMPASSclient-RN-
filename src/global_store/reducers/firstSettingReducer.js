import types from '../actions/types';

const firstSetting = false;

export default (state = firstSetting, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.firstSettingToggle:
        return payload;
    default:
      return state;
  }
};
