import type { Rental, Alert } from '@fleetrentals/shared';
import { isBefore, parseISO, startOfDay } from 'date-fns';

let alarmAudio: HTMLAudioElement | null = null;
let alarmInterval: ReturnType<typeof setInterval> | null = null;

function getAlarmAudio() {
  if (!alarmAudio) {
    alarmAudio = new Audio('/alarm.mp3');
    alarmAudio.loop = true;
  }
  return alarmAudio;
}

export function startAggressiveAlarm() {
  const audio = getAlarmAudio();
  audio.play().catch(() => {
    // Fallback: use Web Audio API beep if no audio file
    playBeepLoop();
  });

  if ('vibrate' in navigator) {
    alarmInterval = setInterval(() => {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }, 2000);
  }
}

function playBeepLoop() {
  const ctx = new AudioContext();
  const playBeep = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };
  alarmInterval = setInterval(playBeep, 800);
}

export function stopAggressiveAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if ('vibrate' in navigator) navigator.vibrate(0);
}

export function checkRentalsForAlerts(rentals: Rental[]): Alert[] {
  const today = startOfDay(new Date());
  const alerts: Alert[] = [];

  for (const rental of rentals) {
    if (rental.status !== 'active' && rental.status !== 'overdue') continue;
    const endDate = parseISO(rental.endDate);
    const isOverdue = isBefore(endDate, today);
    const isDueToday = endDate.getTime() === today.getTime();

    if (isOverdue) {
      alerts.push({
        id: `overdue-${rental.id}`,
        type: 'rental_overdue',
        title: 'OVERDUE RENTAL',
        message: `${rental.customerName} — ${rental.endDate} was due. Vehicle needs return.`,
        rentalId: rental.id,
        vehicleId: rental.vehicleId,
        customerId: rental.customerId,
        dueAt: endDate.getTime(),
        acknowledged: false,
        createdAt: Date.now(),
      });
    } else if (isDueToday) {
      alerts.push({
        id: `due-${rental.id}`,
        type: 'rental_due',
        title: 'Return Due Today',
        message: `${rental.customerName} must return vehicle today.`,
        rentalId: rental.id,
        vehicleId: rental.vehicleId,
        customerId: rental.customerId,
        dueAt: endDate.getTime(),
        acknowledged: false,
        createdAt: Date.now(),
      });
    }
  }

  return alerts;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showPushNotification(title: string, body: string, urgent = false) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/favicon.svg',
    tag: urgent ? 'urgent-rental' : 'rental',
    requireInteraction: urgent,
  });
}
