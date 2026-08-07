import { useEffect, useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { CheckCircle, Car } from 'lucide-react';
import {
  subscribeVehicles,
  createBookingRequest,
  type Vehicle,
} from '@fleetrentals/shared';

export function BookPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '09:00',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => subscribeVehicles(setVehicles), []);

  const available = vehicles.filter((v) => v.status === 'available');

  const selected = vehicles.find((v) => v.id === form.vehicleId);
  const days = form.startDate && form.endDate
    ? differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1
    : 0;
  const estimate = selected && days > 0 ? days * selected.dailyRate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.email || !form.vehicleId || !form.startDate || !form.endDate) return;
    setSubmitting(true);
    try {
      await createBookingRequest({
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        vehicleId: form.vehicleId,
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes.trim(),
        status: 'pending',
        createdAt: Date.now(),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="card text-center py-12">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Booking request sent!</h2>
        <p className="text-slate-400 mb-4">
          Tress Enterprise will review your request and contact you to confirm.
        </p>
        <a href="https://tress-enterprise-customer.web.app" className="text-brand-500 hover:underline text-sm">
          Track your rental in the customer app →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book a vehicle</h1>
        <p className="text-slate-400 text-sm">Choose dates and vehicle — we'll confirm your booking.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-bold">Your details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(268) ..." />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold">Dates & times</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Pick-up date</label>
              <input className="input" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Pick-up time</label>
              <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Return date</label>
              <input className="input" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Return time</label>
              <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold">Choose vehicle</h2>
          {available.length === 0 ? (
            <p className="text-slate-400 text-sm">No vehicles available right now. Call (268) 774-6378.</p>
          ) : (
            <div className="space-y-3">
              {available.map((v) => (
                <label
                  key={v.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    form.vehicleId === v.id ? 'border-brand-500 bg-brand-900/30' : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="vehicle"
                    value={v.id}
                    checked={form.vehicleId === v.id}
                    onChange={() => setForm({ ...form, vehicleId: v.id })}
                    className="accent-brand-500"
                  />
                  <Car size={24} className="text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{v.year} {v.make} {v.model}</p>
                    <p className="text-sm text-slate-400">{v.plate} · {v.color}</p>
                  </div>
                  <p className="font-bold text-brand-400">EC${v.dailyRate}/day</p>
                </label>
              ))}
            </div>
          )}
        </div>

        {estimate > 0 && (
          <div className="card bg-brand-900/30 border-brand-600/50">
            <p className="text-sm text-slate-300">{days} day(s) × EC${selected?.dailyRate}</p>
            <p className="text-xl font-bold text-brand-300">Estimated total: EC${estimate}</p>
            <p className="text-xs text-slate-500 mt-1">Final amount confirmed at pickup. Late return EC$20/hr.</p>
          </div>
        )}

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Airport pickup, child seat..." />
        </div>

        <button type="submit" disabled={submitting || available.length === 0} className="btn-primary w-full">
          {submitting ? 'Sending...' : 'Submit booking request'}
        </button>
      </form>
    </div>
  );
}
