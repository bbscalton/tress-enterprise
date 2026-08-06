import { useState } from 'react';
import { Siren, MapPin, Phone, CheckCircle } from 'lucide-react';
import { updateLocation } from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function EmergencyPage() {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [locationSent, setLocationSent] = useState(false);

  const shareLocation = () => {
    if (!user || !navigator.geolocation) return;
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocation(user.uid, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          updatedAt: Date.now(),
        });
        setLocationSent(true);
        setSharing(false);
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      },
      () => {
        alert('Could not get location. Please enable location services.');
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Siren size={40} />
        </div>
        <h2 className="text-2xl font-bold text-red-400">Emergency</h2>
        <p className="text-slate-400 mt-2">Share your location so we can find you quickly</p>
      </div>

      {locationSent && (
        <div className="bg-green-900/50 border border-green-500 rounded-xl p-4 flex items-center gap-3 text-green-300">
          <CheckCircle size={24} />
          <div>
            <p className="font-bold">Location Shared!</p>
            <p className="text-sm">Our team can see your location on the live map.</p>
          </div>
        </div>
      )}

      <button
        onClick={shareLocation}
        disabled={sharing}
        className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-6 px-6 rounded-2xl flex items-center justify-center gap-3 text-lg transition-colors disabled:opacity-50"
      >
        <MapPin size={28} />
        {sharing ? 'Getting Location...' : 'Share My Location Now'}
      </button>

      <div className="card space-y-4">
        <h3 className="font-bold">Emergency Contacts</h3>
        <a href="tel:911" className="flex items-center gap-3 p-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
          <Phone size={20} className="text-red-400" />
          <div>
            <p className="font-medium">Emergency Services</p>
            <p className="text-sm text-slate-400">911</p>
          </div>
        </a>
        <p className="text-xs text-slate-500">
          Your location is automatically shared while you use the app during an active rental.
          Use the button above for immediate emergency location sharing.
        </p>
      </div>
    </div>
  );
}
