import types from '../actions/types';

const NotificationTitle = "";

export default (state = NotificationTitle, action) => {
  const { payload } = action;
  switch (action.type) {
    case types.changeNotificationMsg:
        return payload;
    default:
      return state;
  }
};
