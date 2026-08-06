import { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { setUser, getUser, upsertCustomer, uploadFileToR2 } from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function DocumentsPage() {
  const { user } = useAuth();
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUser(user.uid).then((u) => {
      if (u?.licensePhotoUrl) setLicenseUrl(u.licensePhotoUrl);
      if (u?.licenseExpiry) setLicenseExpiry(u.licenseExpiry);
    });
  }, [user]);

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadFileToR2('licenses', file, user.uid);
      setLicenseUrl(url);

      await setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'customer',
        createdAt: user.createdAt ?? Date.now(),
        licensePhotoUrl: url,
        licenseExpiry: licenseExpiry || undefined,
      });

      await upsertCustomer({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        licensePhotoUrl: url,
        licenseExpiry: licenseExpiry || undefined,
        rentalCount: 0,
        createdAt: Date.now(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleExpirySave = async () => {
    if (!user || !licenseExpiry) return;
    await setUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'customer',
      createdAt: user.createdAt ?? Date.now(),
      licensePhotoUrl: licenseUrl ?? undefined,
      licenseExpiry,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Documents</h2>
        <p className="text-slate-400 text-sm">Upload your driver's license (stored securely on Cloudflare R2)</p>
      </div>

      {saved && (
        <div className="bg-green-900/50 border border-green-500 rounded-xl p-3 flex items-center gap-2 text-green-300">
          <CheckCircle size={18} /> Saved successfully
        </div>
      )}

      <div className="card">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <FileText size={18} /> Driver's License
        </h3>
        {licenseUrl && (
          <img src={licenseUrl} className="w-full max-h-48 object-contain rounded-xl mb-4 bg-slate-700" alt="License" />
        )}
        <label className={`btn-secondary flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          <Upload size={18} />
          {uploading ? 'Uploading...' : licenseUrl ? 'Replace License Photo' : 'Upload / Take Photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleLicenseUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">License Expiry Date</h3>
        <input
          className="input mb-3"
          type="date"
          value={licenseExpiry}
          onChange={(e) => setLicenseExpiry(e.target.value)}
        />
        <button onClick={handleExpirySave} className="btn-primary w-full">Save Expiry Date</button>
      </div>

      <div className="card">
        <h3 className="font-bold mb-2">Rental Agreement</h3>
        <p className="text-sm text-slate-400">
          Your rental agreement is signed digitally during vehicle check-in. Contact us if you need a copy.
        </p>
      </div>
    </div>
  );
}
