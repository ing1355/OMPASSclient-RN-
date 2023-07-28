import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import notifee from '@notifee/react-native';

export const CheckPermission = async (props) => {
    if (props === 'All') {
        if (Platform.OS === 'android') {
            if ((await check(PERMISSIONS.ANDROID.CAMERA) !== RESULTS.GRANTED)) {
                await request(PERMISSIONS.ANDROID.CAMERA);
            }
            if ((await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS) !== RESULTS.GRANTED)) {
                await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
            }
        } else if (Platform.OS === 'ios') {
            // await notifee.requestPermission()
            if (await check(PERMISSIONS.IOS.CAMERA) !== RESULTS.GRANTED) {
                await request(PERMISSIONS.IOS.CAMERA);
            }
            if ((await check(PERMISSIONS.IOS.FACE_ID) !== RESULTS.GRANTED)) {
                await request(PERMISSIONS.IOS.FACE_ID);
            }
        }
    } else if (props.includes('CAMERA')) {
        if (Platform.OS === 'android') {
            if ((await check(PERMISSIONS.ANDROID.CAMERA) !== RESULTS.GRANTED)) {
                if(await request(PERMISSIONS.ANDROID.CAMERA) !== RESULTS.GRANTED) {
                    return false
                }
            }
        } else if (Platform.OS === 'ios') {
            if ((await check(PERMISSIONS.IOS.CAMERA) !== RESULTS.GRANTED) && props.includes("CAMERA")) {
                await request(PERMISSIONS.IOS.CAMERA);
            }
        }
    } else if (props.includes('FACE')) {
        if ((await check(PERMISSIONS.IOS.FACE_ID) !== RESULTS.GRANTED)) {
            await request(PERMISSIONS.IOS.FACE_ID);
        }
    }
    return true;
}