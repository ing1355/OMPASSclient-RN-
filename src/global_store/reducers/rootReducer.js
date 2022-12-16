import types from '../actions/types';

const isRoot = {
    isChecked : false,
    isRoot: false
};

export default (state = isRoot, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.isRootChange:
        return Object.assign({}, payload);
    default:
      return state;
  }
};
