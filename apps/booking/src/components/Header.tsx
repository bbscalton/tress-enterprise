import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <Car className="text-brand-500" size={28} />
          <div>
            <p className="font-bold text-brand-500 leading-tight">Tress Enterprise</p>
            <p className="text-[10px] text-slate-400">Car Rental & Leasing · Antigua</p>
          </div>
        </Link>
        <Link to="/book" className="btn-primary text-sm py-2 px-4">Book Now</Link>
      </div>
    </header>
  );
}
