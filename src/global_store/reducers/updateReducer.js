import types from '../actions/types';

const needUpdate = {
  isChecked: false,
  needUpdate: false
};

export default (state = needUpdate, action) => {
  switch (action.type) {
    case types.updateToggle:
      return Object.assign({}, action.payload);
    default:
      return state;
  }
};
