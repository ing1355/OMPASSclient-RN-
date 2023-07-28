import types from '../actions/types';

const isDeprecated = {
    isChecked: false,
    isDeprecated: false
};

export default (state = isDeprecated, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.isDeprecatedChange:
        return Object.assign({}, payload);
    default:
      return state;
  }
};
