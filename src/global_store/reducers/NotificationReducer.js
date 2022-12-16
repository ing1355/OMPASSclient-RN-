import types from '../actions/types';

const NotificationToggle = false;

export default (state = NotificationToggle, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.changeNotificationToggle:
        return payload;
    default:
      return state;
  }
};
