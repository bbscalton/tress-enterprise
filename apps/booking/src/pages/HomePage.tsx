import { Link } from 'react-router-dom';
import { Car, MapPin, Phone, Shield, Clock } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Rent a car in Antigua</h1>
        <p className="text-slate-400 max-w-lg mx-auto mb-6">
          Tress Enterprise Car Rental and Leasing — reliable vehicles, easy booking, professional service.
        </p>
        <Link to="/book" className="btn-primary inline-flex items-center gap-2">
          <Car size={20} /> Book your vehicle
        </Link>
      </section>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <MapPin className="mx-auto text-brand-500 mb-2" size={24} />
          <p className="font-semibold">Upper Fort Road</p>
          <p className="text-sm text-slate-400">St. John's, Antigua</p>
        </div>
        <div className="card text-center">
          <Phone className="mx-auto text-brand-500 mb-2" size={24} />
          <p className="font-semibold">(268) 774-6378</p>
          <p className="text-sm text-slate-400">771-3914</p>
        </div>
        <div className="card text-center">
          <Clock className="mx-auto text-brand-500 mb-2" size={24} />
          <p className="font-semibold">Fast booking</p>
          <p className="text-sm text-slate-400">Online requests · We confirm quickly</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start gap-3">
          <Shield className="text-brand-500 shrink-0 mt-1" size={22} />
          <div>
            <h2 className="font-bold mb-2">Rental agreement</h2>
            <p className="text-sm text-slate-400 mb-3">
              All rentals use our standard Tress Enterprise rental/leasing agreement. You'll review and sign digitally when you pick up the vehicle.
            </p>
            <img src="/rental-agreement-form.jpg" alt="Rental agreement" className="rounded-xl max-h-40 object-contain bg-white" />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have a rental?{' '}
        <a href="https://tress-enterprise-customer.web.app" className="text-brand-500 hover:underline">
          Open customer portal
        </a>
      </p>
    </div>
  );
}
