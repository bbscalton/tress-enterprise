import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// Check rentals every hour and create overdue alerts
export const checkOverdueRentals = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const rentalsSnap = await db.ref('rentals').once('value');
    const rentals = rentalsSnap.val() ?? {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const rental of Object.values(rentals) as Array<{
      id: string;
      status: string;
      endDate: string;
      customerName: string;
      vehicleId: string;
      customerId: string;
    }>) {
      if (rental.status !== 'active') continue;
      const endDate = new Date(rental.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        await db.ref('rentals').child(rental.id).update({ status: 'overdue' });
        await db.ref('alerts').push({
          type: 'rental_overdue',
          title: 'OVERDUE RENTAL',
          message: `${rental.customerName} — return was due ${rental.endDate}`,
          rentalId: rental.id,
          vehicleId: rental.vehicleId,
          customerId: rental.customerId,
          dueAt: endDate.getTime(),
          acknowledged: false,
          createdAt: Date.now(),
        });
      }
    }
    return null;
  });

// Send FCM push when new alert is created
export const onAlertCreated = functions.database
  .ref('/alerts/{alertId}')
  .onCreate(async (snapshot) => {
    const alert = snapshot.val();
    if (!alert || alert.acknowledged) return;

    const usersSnap = await db.ref('users').orderByChild('role').equalTo('business').once('value');
    const users = usersSnap.val() ?? {};

    const tokens: string[] = [];
    for (const user of Object.values(users) as Array<{ fcmToken?: string }>) {
      if (user.fcmToken) tokens.push(user.fcmToken);
    }

    if (tokens.length === 0) return;

    const isUrgent = alert.type === 'rental_overdue';
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: alert.title,
        body: alert.message,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: isUrgent ? 'urgent_alerts' : 'rental_alerts',
        },
      },
      webpush: {
        headers: { Urgency: isUrgent ? 'high' : 'normal' },
        notification: {
          requireInteraction: isUrgent,
        },
      },
    });
  });
