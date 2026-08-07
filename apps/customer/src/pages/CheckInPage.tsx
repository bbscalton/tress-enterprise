import { useEffect, useState } from 'react';
import { Camera, CheckCircle, Upload } from 'lucide-react';
import {
  getCustomerRentals,
  updateRental,
  subscribeVehicles,
  uploadFileToR2,
  type Rental,
  type Vehicle,
  type RentalAgreement,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';
import { RentalAgreementForm } from '../components/RentalAgreementForm';

export function CheckInPage() {
  const { user } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [agreement, setAgreement] = useState<RentalAgreement>({});
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    getCustomerRentals(user.uid).then((rentals) => {
      const active = rentals.find((r) => r.status === 'active' || r.status === 'overdue');
      setRental(active ?? null);
      if (active?.checkInAt) setDone(true);
      if (active?.agreementSigned) setSigned(true);
      if (active?.agreement) setAgreement(active.agreement);
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

  const handleSignAgreement = () => {
    if (!agreement.hirerSignature?.trim()) return;
    setAgreement((a) => ({ ...a, signedAt: Date.now() }));
    setSigned(true);
  };

  const handleCheckIn = async () => {
    if (!rental || !user || photoPreviews.length === 0 || !signed) return;
    const uploaded = await Promise.all(
      photoFiles.map((file) => uploadFileToR2(`rentals/${rental.id}/pickup`, file, user.uid))
    );
    const photoUrls = uploaded.length > 0 ? uploaded : photoPreviews;

    await updateRental(rental.id, {
      pickupPhotos: photoUrls,
      checkInAt: Date.now(),
      agreementSigned: true,
      agreement: { ...agreement, signedAt: agreement.signedAt ?? Date.now() },
    });
    setDone(true);
  };

  if (!rental) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">No active rental to check in</p>
        <p className="text-sm text-slate-500 mt-2">
          <a href="https://tress-enterprise-booking.web.app/book" className="text-brand-500">Book a vehicle online</a>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card text-center py-12">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Check-in Complete!</h2>
        <p className="text-slate-400">Your vehicle pickup and agreement have been recorded.</p>
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

      <RentalAgreementForm
        value={agreement}
        onChange={setAgreement}
        customerName={user?.displayName}
        onSign={handleSignAgreement}
        signed={signed}
      />

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
