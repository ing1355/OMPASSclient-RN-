import types from '../actions/types';

const iosType = 'fingerprint';

export default (state = iosType, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.iosTypeToggle:
        return payload;
    default:
      return state;
  }
};
