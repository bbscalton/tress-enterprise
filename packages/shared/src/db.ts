import {
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get,
  query,
  orderByChild,
  equalTo,
  type Unsubscribe,
} from 'firebase/database';
import { getFirebaseDb } from './firebase';
import type {
  User,
  Vehicle,
  Rental,
  Customer,
  Chat,
  ChatMessage,
  Task,
  Alert,
  LocationUpdate,
  Issue,
} from './types';

function dbRef(path: string) {
  return ref(getFirebaseDb(), path);
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await get(dbRef(`users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export async function setUser(user: User) {
  await set(dbRef(`users/${user.uid}`), user);
}

export function subscribeVehicles(callback: (vehicles: Vehicle[]) => void): Unsubscribe {
  return onValue(dbRef('vehicles'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data));
  });
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id'>) {
  const newRef = push(dbRef('vehicles'));
  await set(newRef, { ...vehicle, id: newRef.key! });
  return newRef.key!;
}

export async function updateVehicle(id: string, data: Partial<Vehicle>) {
  await update(dbRef(`vehicles/${id}`), data);
}

export async function deleteVehicle(id: string) {
  await remove(dbRef(`vehicles/${id}`));
}

export function subscribeRentals(callback: (rentals: Rental[]) => void): Unsubscribe {
  return onValue(dbRef('rentals'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data));
  });
}

export async function createRental(rental: Omit<Rental, 'id'>) {
  const newRef = push(dbRef('rentals'));
  await set(newRef, { ...rental, id: newRef.key! });
  return newRef.key!;
}

export async function updateRental(id: string, data: Partial<Rental>) {
  await update(dbRef(`rentals/${id}`), data);
}

export function subscribeCustomers(callback: (customers: Customer[]) => void): Unsubscribe {
  return onValue(dbRef('customers'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data));
  });
}

export async function upsertCustomer(customer: Customer) {
  await set(dbRef(`customers/${customer.id}`), customer);
}

export function subscribeChats(callback: (chats: Chat[]) => void): Unsubscribe {
  return onValue(dbRef('chats'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data));
  });
}

export function subscribeChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  return onValue(dbRef(`chats/${chatId}/messages`), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data).sort((a, b) => a.createdAt - b.createdAt));
  });
}

export async function sendMessage(chatId: string, message: Omit<ChatMessage, 'id'>) {
  const newRef = push(dbRef(`chats/${chatId}/messages`));
  await set(newRef, { ...message, id: newRef.key! });
  await update(dbRef(`chats/${chatId}`), {
    lastMessage: message.text ?? (message.type === 'image' ? '📷 Photo' : message.type === 'voice' ? '🎤 Voice' : ''),
    lastMessageAt: message.createdAt,
  });
}

export async function createChat(chat: Omit<Chat, 'id'>) {
  const newRef = push(dbRef('chats'));
  await set(newRef, { ...chat, id: newRef.key! });
  return newRef.key!;
}

export function subscribeTasks(callback: (tasks: Task[]) => void): Unsubscribe {
  return onValue(dbRef('tasks'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data));
  });
}

export async function createTask(task: Omit<Task, 'id'>) {
  const newRef = push(dbRef('tasks'));
  await set(newRef, { ...task, id: newRef.key! });
  return newRef.key!;
}

export async function updateTask(id: string, data: Partial<Task>) {
  await update(dbRef(`tasks/${id}`), data);
}

export function subscribeAlerts(callback: (alerts: Alert[]) => void): Unsubscribe {
  return onValue(dbRef('alerts'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data).sort((a, b) => b.createdAt - a.createdAt));
  });
}

export async function createAlert(alert: Omit<Alert, 'id'>) {
  const newRef = push(dbRef('alerts'));
  await set(newRef, { ...alert, id: newRef.key! });
  return newRef.key!;
}

export async function acknowledgeAlert(id: string) {
  await update(dbRef(`alerts/${id}`), { acknowledged: true });
}

export async function updateLocation(uid: string, location: LocationUpdate) {
  await set(dbRef(`locations/${uid}`), location);
}

export function subscribeLocations(
  callback: (locations: Record<string, LocationUpdate>) => void
): Unsubscribe {
  return onValue(dbRef('locations'), (snap) => {
    callback(snap.val() ?? {});
  });
}

export function subscribeIssues(callback: (issues: Issue[]) => void): Unsubscribe {
  return onValue(dbRef('issues'), (snap) => {
    const data = snap.val() ?? {};
    callback(Object.values(data).sort((a, b) => b.createdAt - a.createdAt));
  });
}

export async function createIssue(issue: Omit<Issue, 'id'>) {
  const newRef = push(dbRef('issues'));
  await set(newRef, { ...issue, id: newRef.key! });
  return newRef.key!;
}

export async function updateIssue(id: string, data: Partial<Issue>) {
  await update(dbRef(`issues/${id}`), data);
}

export async function getCustomerRentals(customerId: string): Promise<Rental[]> {
  const snap = await get(query(dbRef('rentals'), orderByChild('customerId'), equalTo(customerId)));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
}
