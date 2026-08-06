import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Car, Camera, MessageCircle, FileText, AlertTriangle } from 'lucide-react';
import {
  getCustomerRentals,
  subscribeVehicles,
  type Rental,
  type Vehicle,
  RENTAL_STATUS_COLORS,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!user) return;
    getCustomerRentals(user.uid).then(setRentals);
    return subscribeVehicles(setVehicles);
  }, [user]);

  const activeRental = rentals.find((r) => r.status === 'active' || r.status === 'overdue');
  const vehicle = activeRental ? vehicles.find((v) => v.id === activeRental.vehicleId) : null;

  const quickActions = [
    { to: '/checkin', icon: Camera, label: 'Check In', color: 'bg-blue-600' },
    { to: '/chat', icon: MessageCircle, label: 'Chat', color: 'bg-purple-600' },
    { to: '/documents', icon: FileText, label: 'Documents', color: 'bg-green-600' },
    { to: '/issues', icon: AlertTriangle, label: 'Report Issue', color: 'bg-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Hi, {user?.displayName?.split(' ')[0]}!</h2>
        <p className="text-slate-400 text-sm">Manage your rental easily</p>
      </div>

      {activeRental && vehicle ? (
        <div className="card bg-gradient-to-br from-brand-800/50 to-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
              <Car size={28} className="text-brand-400" />
            </div>
            <div>
              <p className="font-bold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</p>
              <p className="text-sm text-slate-400">{vehicle.plate} · {vehicle.color}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400">Start</p>
              <p className="font-medium">{format(parseISO(activeRental.startDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-slate-400">Return Due</p>
              <p className="font-medium">{format(parseISO(activeRental.endDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
          <span
            className="inline-block mt-3 text-xs px-3 py-1 rounded-full font-medium capitalize"
            style={{
              backgroundColor: `${RENTAL_STATUS_COLORS[activeRental.status]}20`,
              color: RENTAL_STATUS_COLORS[activeRental.status],
            }}
          >
            {activeRental.status}
          </span>
        </div>
      ) : (
        <div className="card text-center py-8">
          <Car size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">No active rental</p>
          <p className="text-sm text-slate-500 mt-1">Contact us to book a vehicle</p>
        </div>
      )}

      <div>
        <h3 className="font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              <Icon size={24} />
              <span className="font-medium text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
