import types from '../actions/types';

const usbConnected = {
    isChecked: false,
    usbConnected: false
};

export default (state = usbConnected, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.usbConnectedChange:
        return Object.assign({}, payload);
    default:
      return state;
  }
};
