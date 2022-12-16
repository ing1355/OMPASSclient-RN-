import notifee, { AndroidImportance, AndroidVisibility, AndroidLaunchActivityFlag } from '@notifee/react-native';
import { translate } from '../../App';

export const displayNotification = async (message) => {
    // 안드로이드 푸시 채널 설정
    const channelId = await notifee.createChannel({
        id: 'Authenticate',
        name: 'ompass',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound:"doorbell",
        vibration: true
    });

    // firebase 수신 데이터
    const pushData = JSON.parse(message.data.data);
    
    // 푸시 노출
    await notifee.displayNotification({
        id: message.messageId,
        title: translate('notificationTitle'),
        body: translate('notificationBody', { username: pushData.username }),
        data: message.data,
        android: {
            channelId,
            pressAction: {
                id: 'default',
                launchActivity: 'default',
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
            },
        },
        ios: {
            foregroundPresentationOptions: {
                badge: true,
                sound: true
            },
            critical: true
        }
    });
    
    await notifee.incrementBadgeCount();
}