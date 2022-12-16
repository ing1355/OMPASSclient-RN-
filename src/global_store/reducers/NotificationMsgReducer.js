import types from '../actions/types';

const NotificationMsg = null;

export default (state = NotificationMsg, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.changeNotificationMsg:
        return payload;
    default:
      return state;
  }
};
