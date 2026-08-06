import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getFirebaseAuth, setUser, getUser } from '@fleetrentals/shared';

export async function initNativePush() {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    const auth = getFirebaseAuth();
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    const existing = await getUser(fbUser.uid);
    if (!existing) return;
    await setUser({ ...existing, fcmToken: token.value });
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration failed', err);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]);
    console.log('Push received', notification);
  });
}
