import types from '../actions/types';

const isLoading = false;

export default (state = isLoading, action) => {
  switch (action.type) {
    case types.loadingToggle:
      return action.payload;
    default:
      return state;
  }
};
