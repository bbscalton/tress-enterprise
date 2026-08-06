import { useEffect } from 'react';
import {
  subscribeRentals,
  subscribeAlerts,
  createAlert,
  type Rental,
  type Alert,
} from '@fleetrentals/shared';
import {
  checkRentalsForAlerts,
  startAggressiveAlarm,
  stopAggressiveAlarm,
  showPushNotification,
  requestNotificationPermission,
} from '../lib/alerts';

export function useAlertMonitor() {
  useEffect(() => {
    requestNotificationPermission();

    let rentals: Rental[] = [];
    let existingAlerts: Alert[] = [];

    const unsubRentals = subscribeRentals((r) => {
      rentals = r;
      processAlerts();
    });

    const unsubAlerts = subscribeAlerts((a) => {
      existingAlerts = a;
      processAlerts();
    });

    function processAlerts() {
      const computed = checkRentalsForAlerts(rentals);
      const unacked = computed.filter(
        (c) => !existingAlerts.find((e) => e.id === c.id && e.acknowledged)
      );

      const hasUrgent = unacked.some((a) => a.type === 'rental_overdue');

      if (hasUrgent) {
        startAggressiveAlarm();
        showPushNotification('OVERDUE RENTAL', 'A vehicle return is overdue!', true);
      } else {
        stopAggressiveAlarm();
      }

      for (const alert of unacked) {
        if (!existingAlerts.find((e) => e.id === alert.id)) {
          createAlert(alert);
          if (alert.type === 'rental_due') {
            showPushNotification(alert.title, alert.message, false);
          }
        }
      }
    }

    return () => {
      unsubRentals();
      unsubAlerts();
      stopAggressiveAlarm();
    };
  }, []);
}
