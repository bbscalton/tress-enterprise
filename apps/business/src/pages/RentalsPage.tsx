import { useEffect, useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Plus, CheckCircle } from 'lucide-react';
import {
  subscribeRentals,
  subscribeVehicles,
  subscribeCustomers,
  createRental,
  updateRental,
  updateVehicle,
  type Rental,
  type Vehicle,
  type Customer,
  RENTAL_STATUS_COLORS,
} from '@fleetrentals/shared';

export function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');
  const [form, setForm] = useState({
    vehicleId: '', customerId: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', dailyRate: 50,
  });

  useEffect(() => subscribeRentals(setRentals), []);
  useEffect(() => subscribeVehicles(setVehicles), []);
  useEffect(() => subscribeCustomers(setCustomers), []);

  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const handleCreate = async () => {
    const customer = customers.find((c) => c.id === form.customerId);
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (!customer || !vehicle || !form.endDate) return;

    const days = differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1;
    const dailyRate = form.dailyRate || vehicle.dailyRate;

    await createRental({
      vehicleId: form.vehicleId,
      customerId: customer.id,
      customerName: customer.displayName,
      customerEmail: customer.email,
      startDate: form.startDate,
      endDate: form.endDate,
      status: 'active',
      dailyRate,
      totalAmount: days * dailyRate,
      agreementSigned: false,
      createdAt: Date.now(),
    });

    await updateVehicle(form.vehicleId, { status: 'rented' });
    setShowForm(false);
  };

  const handleReturn = async (rental: Rental) => {
    await updateRental(rental.id, { status: 'returned', checkOutAt: Date.now() });
    await updateVehicle(rental.vehicleId, { status: 'available' });
  };

  const filtered = rentals
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Rentals</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={18} /> New Rental
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'overdue', 'returned'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-bold">Create Rental</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vehicle</label>
              <select className="input" value={form.vehicleId} onChange={(e) => {
                const v = vehicles.find((v) => v.id === e.target.value);
                setForm({ ...form, vehicleId: e.target.value, dailyRate: v?.dailyRate ?? 50 });
              }}>
                <option value="">Select vehicle</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} — {v.plate}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Customer</label>
              <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName} — {c.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Daily Rate ($)</label>
              <input className="input" type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: +e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="btn-primary">Create Rental</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((r) => {
          const vehicle = vehicles.find((v) => v.id === r.vehicleId);
          return (
            <div key={r.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-bold">{r.customerName}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ backgroundColor: `${RENTAL_STATUS_COLORS[r.status]}20`, color: RENTAL_STATUS_COLORS[r.status] }}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plate})` : 'Unknown vehicle'}
                </p>
                <p className="text-sm text-slate-400">
                  {format(parseISO(r.startDate), 'MMM d')} → {format(parseISO(r.endDate), 'MMM d, yyyy')}
                  · ${r.totalAmount}
                </p>
              </div>
              {(r.status === 'active' || r.status === 'overdue') && (
                <button onClick={() => handleReturn(r)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  <CheckCircle size={16} /> Process Return
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12 text-slate-400">No rentals found</div>
      )}
    </div>
  );
}
