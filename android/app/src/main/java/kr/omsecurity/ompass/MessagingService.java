package kr.omsecurity.ompass;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
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
import com.google.gson.JsonParser;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;

public class MessagingService extends FirebaseMessagingService {
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
        Log.d("push", ex_data);
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("data", ex_data);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = null;
        boolean isKo = Locale.getDefault().getLanguage().equals("ko");
        JSONObject json = null;
        try {
            json = new JSONObject(ex_data);
            String applicationName = json.getString("applicationName");
            String userName = json.getString("username");
            String titleMsg = getApplicationContext().getResources().getString(R.string.notification_title_string);
            String titleText = isKo ? (applicationName + titleMsg) : (titleMsg + " " + applicationName);
            String bodyMsg = getApplicationContext().getResources().getString(R.string.notification_message_string);
            String bodyText = isKo ? (userName + " " + bodyMsg) : (bodyMsg + " " + userName);
            pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
//            pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent, PendingIntent.FLAG_ONE_SHOT);
            String channelId = "Channel ID";
            NotificationCompat.Builder notificationBuilder =
                    new NotificationCompat.Builder(this, channelId)
                            .setLargeIcon(BitmapFactory.decodeResource(getResources(),R.mipmap.ic_launcher))
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setBadgeIconType(NotificationCompat.BADGE_ICON_LARGE)
                            .setAutoCancel(true)
                            .setContentTitle(titleText)
                            .setContentText(bodyText)
                            .setContentIntent(pendingIntent)
                            .setPriority(Notification.PRIORITY_HIGH)
                            .setFullScreenIntent(pendingIntent, true);
            NotificationManager notificationManager =
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            // Since android Oreo notification channel is needed.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(channelId,
                        "Channel human readable title",
                        NotificationManager.IMPORTANCE_HIGH);
                notificationManager.createNotificationChannel(channel);
            }

            notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

}