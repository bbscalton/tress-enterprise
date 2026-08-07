export type UserRole = 'business' | 'customer';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  createdAt: number;
  licenseExpiry?: string;
  licensePhotoUrl?: string;
  fcmToken?: string;
}

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  color: string;
  status: VehicleStatus;
  mileage: number;
  dailyRate: number;
  lastServiceDate?: string;
  nextServiceMileage?: number;
  imageUrl?: string;
  notes?: string;
  createdAt: number;
}

export type RentalStatus = 'pending' | 'active' | 'returned' | 'overdue' | 'cancelled';

export interface Rental {
  id: string;
  vehicleId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  dailyRate: number;
  totalAmount: number;
  deposit?: number;
  pickupPhotos?: string[];
  returnPhotos?: string[];
  agreementSigned?: boolean;
  agreementUrl?: string;
  checkInAt?: number;
  checkOutAt?: number;
  notes?: string;
  createdAt: number;
  /** Digital rental agreement fields (Tress Enterprise form) */
  agreement?: RentalAgreement;
}

export interface RentalAgreement {
  agreementNumber?: string;
  dob?: string;
  homeAddress?: string;
  homePhone?: string;
  localAddress?: string;
  localPhone?: string;
  licenseNumber?: string;
  licenseIssued?: string;
  permitNumber?: string;
  permitIssued?: string;
  additionalDrivers?: string;
  paymentMethod?: 'cash' | 'credit' | 'other';
  ldwAccepted?: boolean;
  ldwInitial?: string;
  lateFeeInitial?: string;
  unauthorizedInitial?: string;
  liabilityInitial?: string;
  fuelOutLevel?: number;
  fuelInLevel?: number;
  inventory?: Record<string, boolean>;
  hirerSignature?: string;
  signedAt?: number;
}

export interface BookingRequest {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: number;
}

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licensePhotoUrl?: string;
  notes?: string;
  rentalCount: number;
  createdAt: number;
}

export type MessageType = 'text' | 'image' | 'voice' | 'system';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  duration?: number;
  createdAt: number;
  read: boolean;
}

export interface Chat {
  id: string;
  rentalId?: string;
  customerId: string;
  customerName: string;
  participants: Record<string, boolean>;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadBusiness?: number;
  unreadCustomer?: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  vehicleId?: string;
  rentalId?: string;
  createdAt: number;
}

export type AlertType = 'rental_due' | 'rental_overdue' | 'maintenance' | 'license_expiry' | 'custom';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  rentalId?: string;
  vehicleId?: string;
  customerId?: string;
  dueAt: number;
  acknowledged: boolean;
  createdAt: number;
}

export interface LocationUpdate {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
  rentalId?: string;
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  rentalId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  title: string;
  description: string;
  photos?: string[];
  status: IssueStatus;
  createdAt: number;
  resolvedAt?: number;
}

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  available: '#22c55e',
  rented: '#3b82f6',
  maintenance: '#f59e0b',
  reserved: '#8b5cf6',
};

export const RENTAL_STATUS_COLORS: Record<RentalStatus, string> = {
  pending: '#8b5cf6',
  active: '#3b82f6',
  returned: '#22c55e',
  overdue: '#ef4444',
  cancelled: '#6b7280',
};
