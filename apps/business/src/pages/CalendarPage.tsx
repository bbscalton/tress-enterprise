import { useEffect, useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  subscribeRentals,
  subscribeVehicles,
  type Rental,
  type Vehicle,
  RENTAL_STATUS_COLORS,
} from '@fleetrentals/shared';

export function CalendarPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [month, setMonth] = useState(new Date());

  useEffect(() => subscribeRentals(setRentals), []);
  useEffect(() => subscribeVehicles(setVehicles), []);

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  const getRentalsForDay = (day: Date) =>
    rentals.filter((r) => {
      if (r.status === 'cancelled') return false;
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      return day >= start && day <= end;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className="p-2 hover:bg-slate-700 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium min-w-[140px] text-center">{format(month, 'MMMM yyyy')}</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className="p-2 hover:bg-slate-700 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[600px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
          ))}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayRentals = getRentalsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-2 rounded-lg border ${
                  isToday ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700/50'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isToday ? 'text-brand-400' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </p>
                <div className="space-y-1">
                  {dayRentals.slice(0, 3).map((r) => {
                    const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                    return (
                      <div
                        key={r.id}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate"
                        style={{
                          backgroundColor: `${RENTAL_STATUS_COLORS[r.status]}30`,
                          color: RENTAL_STATUS_COLORS[r.status],
                        }}
                      >
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : r.customerName}
                      </div>
                    );
                  })}
                  {dayRentals.length > 3 && (
                    <p className="text-[10px] text-slate-500">+{dayRentals.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {(['active', 'overdue', 'pending', 'returned'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RENTAL_STATUS_COLORS[status] }} />
              <span className="text-sm capitalize text-slate-300">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
