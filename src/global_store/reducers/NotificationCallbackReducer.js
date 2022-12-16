import types from '../actions/types';

const NotificationCallback = null;

export default (state = NotificationCallback, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.changeNotificationCallback:
        return payload;
    default:
      return state;
  }
};
