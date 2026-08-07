import { useEffect, useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import {
  Car,
  AlertTriangle,
  Calendar,
  Users,
  Bell,
  CheckCircle,
} from 'lucide-react';
import {
  subscribeVehicles,
  subscribeRentals,
  subscribeAlerts,
  subscribeIssues,
  subscribeBookingRequests,
  acknowledgeAlert,
  type Vehicle,
  type Rental,
  type Alert,
  type Issue,
  type BookingRequest,
  VEHICLE_STATUS_COLORS,
  RENTAL_STATUS_COLORS,
} from '@fleetrentals/shared';
import { stopAggressiveAlarm } from '../lib/alerts';
import { ApkDownloadCard } from '../components/ApkDownloadCard';

export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);

  useEffect(() => {
    return subscribeVehicles(setVehicles);
  }, []);
  useEffect(() => {
    return subscribeRentals(setRentals);
  }, []);
  useEffect(() => {
    return subscribeAlerts(setAlerts);
  }, []);
  useEffect(() => {
    return subscribeIssues(setIssues);
  }, []);
  useEffect(() => {
    return subscribeBookingRequests(setBookingRequests);
  }, []);

  const activeRentals = rentals.filter((r) => r.status === 'active' || r.status === 'overdue');
  const dueToday = rentals.filter((r) => {
    if (r.status !== 'active') return false;
    return isToday(parseISO(r.endDate));
  });
  const unackedAlerts = alerts.filter((a) => !a.acknowledged);
  const openIssues = issues.filter((i) => i.status === 'open');
  const pendingBookings = bookingRequests.filter((b) => b.status === 'pending');

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, icon: Car, color: 'text-blue-400' },
    { label: 'Active Rentals', value: activeRentals.length, icon: Calendar, color: 'text-green-400' },
    { label: 'Due Today', value: dueToday.length, icon: Bell, color: 'text-yellow-400' },
    { label: 'Open Issues', value: openIssues.length, icon: AlertTriangle, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-slate-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <ApkDownloadCard />

      {pendingBookings.length > 0 && (
        <div className="card border border-brand-600/50">
          <h3 className="font-bold mb-3">New online bookings ({pendingBookings.length})</h3>
          <div className="space-y-2">
            {pendingBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex justify-between py-2 border-b border-slate-700 last:border-0 text-sm">
                <span>{b.customerName} · {b.startDate} → {b.endDate}</span>
                <a href="https://tress-enterprise-booking.web.app" className="text-brand-400">View</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent alerts banner */}
      {unackedAlerts.length > 0 && (
        <div className="bg-red-900/50 border border-red-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="text-red-400 animate-pulse" size={20} />
            <h3 className="font-bold text-red-300">Active Alerts ({unackedAlerts.length})</h3>
          </div>
          <div className="space-y-2">
            {unackedAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-red-950/50 rounded-xl p-3">
                <div>
                  <p className="font-semibold text-red-200">{alert.title}</p>
                  <p className="text-sm text-red-300/80">{alert.message}</p>
                </div>
                <button
                  onClick={() => {
                    acknowledgeAlert(alert.id);
                    stopAggressiveAlarm();
                  }}
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
                >
                  <CheckCircle size={16} /> Ack
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3">
              <Icon className={color} size={24} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's returns */}
      {dueToday.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-yellow-400" />
            Returns Due Today
          </h3>
          <div className="space-y-2">
            {dueToday.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="font-medium">{r.customerName}</p>
                  <p className="text-sm text-slate-400">Vehicle ID: {r.vehicleId}</p>
                </div>
                <span className="text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                  Due today
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fleet overview */}
      <div className="card">
        <h3 className="font-bold mb-3">Fleet Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['available', 'rented', 'maintenance', 'reserved'] as const).map((status) => {
            const count = vehicles.filter((v) => v.status === status).length;
            return (
              <div key={status} className="text-center p-3 bg-slate-700/50 rounded-xl">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: VEHICLE_STATUS_COLORS[status] }}
                />
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-slate-400 capitalize">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active rentals */}
      <div className="card">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Users size={18} />
          Active Rentals
        </h3>
        {activeRentals.length === 0 ? (
          <p className="text-slate-400 text-sm">No active rentals</p>
        ) : (
          <div className="space-y-2">
            {activeRentals.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="font-medium">{r.customerName}</p>
                  <p className="text-sm text-slate-400">
                    {format(parseISO(r.startDate), 'MMM d')} → {format(parseISO(r.endDate), 'MMM d')}
                  </p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${RENTAL_STATUS_COLORS[r.status]}20`,
                    color: RENTAL_STATUS_COLORS[r.status],
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
