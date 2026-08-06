import { useEffect, useState } from 'react';
import { Plus, Car, Wrench, Trash2 } from 'lucide-react';
import {
  subscribeVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  VEHICLE_STATUS_COLORS,
} from '@fleetrentals/shared';

export function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    make: '', model: '', year: new Date().getFullYear(), plate: '', color: '', dailyRate: 50, mileage: 0,
  });

  useEffect(() => subscribeVehicles(setVehicles), []);

  const handleAdd = async () => {
    if (!form.make || !form.model || !form.plate) return;
    await createVehicle({
      ...form,
      status: 'available',
      createdAt: Date.now(),
    });
    setShowForm(false);
    setForm({ make: '', model: '', year: new Date().getFullYear(), plate: '', color: '', dailyRate: 50, mileage: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fleet</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-bold">New Vehicle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Make</label>
              <input className="input" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Toyota" />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Camry" />
            </div>
            <div>
              <label className="label">Year</label>
              <input className="input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} />
            </div>
            <div>
              <label className="label">Plate</label>
              <input className="input" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="ABC-1234" />
            </div>
            <div>
              <label className="label">Color</label>
              <input className="input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="White" />
            </div>
            <div>
              <label className="label">Daily Rate ($)</label>
              <input className="input" type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: +e.target.value })} />
            </div>
            <div>
              <label className="label">Mileage</label>
              <input className="input" type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: +e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary">Save Vehicle</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <div key={v.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                  <Car size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-bold">{v.year} {v.make} {v.model}</p>
                  <p className="text-sm text-slate-400">{v.plate} · {v.color}</p>
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                style={{ backgroundColor: `${VEHICLE_STATUS_COLORS[v.status]}20`, color: VEHICLE_STATUS_COLORS[v.status] }}
              >
                {v.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
              <span>${v.dailyRate}/day</span>
              <span>{v.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex gap-2">
              {v.status === 'available' && (
                <button
                  onClick={() => updateVehicle(v.id, { status: 'maintenance' })}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Wrench size={14} /> Maintenance
                </button>
              )}
              {v.status === 'maintenance' && (
                <button
                  onClick={() => updateVehicle(v.id, { status: 'available' })}
                  className="btn-primary text-xs py-2 px-3"
                >
                  Mark Available
                </button>
              )}
              <button
                onClick={() => deleteVehicle(v.id)}
                className="text-red-400 hover:text-red-300 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="card text-center py-12">
          <Car size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No vehicles yet. Add your first vehicle to get started.</p>
        </div>
      )}
    </div>
  );
}
