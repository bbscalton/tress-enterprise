import { useEffect, useState } from 'react';
import { Camera, CheckCircle, Upload } from 'lucide-react';
import {
  getCustomerRentals,
  updateRental,
  subscribeVehicles,
  uploadFileToR2,
  type Rental,
  type Vehicle,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function CheckInPage() {
  const { user } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    getCustomerRentals(user.uid).then((rentals) => {
      const active = rentals.find((r) => r.status === 'active' || r.status === 'overdue');
      setRental(active ?? null);
      if (active?.checkInAt) setDone(true);
      if (active?.agreementSigned) setSigned(true);
      if (active?.pickupPhotos) setPhotoPreviews(active.pickupPhotos);
    });
    return subscribeVehicles((v) => {
      if (rental) setVehicle(v.find((ve) => ve.id === rental.vehicleId) ?? null);
    });
  }, [user, rental]);

  useEffect(() => {
    if (!rental) return;
    subscribeVehicles((v) => setVehicle(v.find((ve) => ve.id === rental.vehicleId) ?? null));
  }, [rental]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      setPhotoFiles((prev) => [...prev, file]);
      setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    });
  };

  const handleCheckIn = async () => {
    if (!rental || !user || photoPreviews.length === 0) return;
    const uploaded = await Promise.all(
      photoFiles.map((file) => uploadFileToR2(`rentals/${rental.id}/pickup`, file, user.uid))
    );
    const photoUrls = uploaded.length > 0 ? uploaded : photoPreviews;

    await updateRental(rental.id, {
      pickupPhotos: photoUrls,
      checkInAt: Date.now(),
      agreementSigned: signed,
    });
    setDone(true);
  };

  if (!rental) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">No active rental to check in</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card text-center py-12">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Check-in Complete!</h2>
        <p className="text-slate-400">Your vehicle pickup has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Vehicle Check-In</h2>
        <p className="text-slate-400 text-sm">
          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Your rental vehicle'}
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Camera size={18} /> Vehicle Photos
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Take photos of the vehicle condition before you drive (all angles recommended).
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photoPreviews.map((p, i) => (
            <img key={i} src={p} className="w-full h-24 object-cover rounded-xl" alt={`Photo ${i + 1}`} />
          ))}
        </div>
        <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer">
          <Upload size={18} />
          Add Photos
          <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhoto} />
        </label>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">Rental Agreement</h3>
        <p className="text-sm text-slate-400 mb-4">
          By checking this box, you agree to the rental terms and conditions.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={signed}
            onChange={(e) => setSigned(e.target.checked)}
            className="w-5 h-5 rounded accent-brand-500"
          />
          <span>I agree to the rental agreement terms</span>
        </label>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={photoPreviews.length === 0 || !signed}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <CheckCircle size={20} /> Complete Check-In
      </button>
    </div>
  );
}
