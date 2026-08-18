import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission was not granted');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Campus Food Orders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f97316',
      });
    }
  } catch (error) {
    console.log('Error configuring push notifications:', error);
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // null = fire immediately (supported in SDK 54)
    });
  } catch (err) {
    console.log('Could not schedule local notification:', err);
  }
}
