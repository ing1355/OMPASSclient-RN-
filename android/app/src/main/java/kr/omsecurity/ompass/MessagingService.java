package kr.omsecurity.ompass;

import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import kr.omsecurity.ompass.Constants.StaticMethods;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;

public class MessagingService extends FirebaseMessagingService {
    private static int n = 1;
    @Override
    public void handleIntent(Intent intent) {
        if (!MainActivity.isActivityForeground) {
            try {
                if (intent.getExtras() != null) {
                    sendNotification(intent.getStringExtra("data"));
                } else {
                    super.handleIntent(intent);
                }
            } catch (Exception e) {
                super.handleIntent(intent);
            }
        } else {
            super.handleIntent(intent);
        }
    }

    @Override
    public void onNewToken(@NonNull String s) {
        super.onNewToken(s);
        MainApplication application = (MainApplication) this.getApplication();
        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager =  reactNativeHost.getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        if (reactContext != null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("newToken", s);
        } else {
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                @Override
                public void onReactContextInitialized(ReactContext context) {
                    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("newToken", s);
                    reactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
        }
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        String pushData = remoteMessage.getData().get("data");
        if (remoteMessage.getData().size() > 0) {
            JSONObject json = null;
            try {
                json = new JSONObject(pushData);
                String accessKey = json.getString("accessKey");
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
            MainApplication application = (MainApplication) this.getApplication();
            ReactNativeHost reactNativeHost = application.getReactNativeHost();
            ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("pushEvent", pushData);
            } else {
                reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                    @Override
                    public void onReactContextInitialized(ReactContext context) {
                        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("pushEvent", pushData);
                        reactInstanceManager.removeReactInstanceEventListener(this);
                    }
                });
            }
            sendNotification(pushData);
        }
    }

    private void sendNotification(String ex_data) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("data", ex_data);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = null;
        boolean isKo = Locale.getDefault().getLanguage().equals("ko");
        JSONObject json = null;
        try {
            json = new JSONObject(ex_data);
            String accessKey = json.getString("accessKey");
            String applicationName = json.getString("applicationName");
            String userName = json.getString("username");
            String titleMsg = getApplicationContext().getResources().getString(R.string.notification_title_string);
            String titleText = isKo ? (applicationName + titleMsg) : (titleMsg + " " + applicationName);
            String bodyMsg = getApplicationContext().getResources().getString(R.string.notification_message_string);
            String bodyText = isKo ? (userName + " " + bodyMsg) : (bodyMsg + " " + userName);
//            pendingIntent = PendingIntent.getActivity(this, n /* Request code */, intent, PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
            pendingIntent = PendingIntent.getActivity(this, StaticMethods.stringToIntUUID(accessKey) /* Request code */, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
            String channelId = getApplicationContext().getResources().getString(R.string.channel_title);
            NotificationManager notificationManager =
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationCompat.Builder notificationBuilder =
                    new NotificationCompat.Builder(this, accessKey)
                            .setLargeIcon(BitmapFactory.decodeResource(getResources(),R.mipmap.ic_launcher))
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setBadgeIconType(NotificationCompat.BADGE_ICON_LARGE)
                            .setAutoCancel(true)
                            .setContentTitle(titleText)
                            .setContentText(bodyText)
                            .setChannelId(channelId)
                            .setGroup(channelId)
                            .setContentIntent(pendingIntent)
                            .setPriority(Notification.PRIORITY_HIGH);
//                            .setFullScreenIntent(pendingIntent, false);
            // Since android Oreo notification channel is needed.
//            notificationManager.notify(n++ /* ID of notification */, notificationBuilder.build());
            notificationManager.notify(StaticMethods.stringToIntUUID(accessKey) /* ID of notification */, notificationBuilder.build());
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

}