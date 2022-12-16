import types from '../actions/types';

const isForgery = {
    isChecked: false,
    isForgery: false
};

export default (state = isForgery, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.isForgeryChange:
        return Object.assign({}, payload);
    default:
      return state;
  }
};
