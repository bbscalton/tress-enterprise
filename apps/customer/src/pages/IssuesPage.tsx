import { useEffect, useState } from 'react';
import { AlertTriangle, Camera, Plus } from 'lucide-react';
import {
  getCustomerRentals,
  subscribeIssues,
  createIssue,
  uploadFileToR2,
  type Rental,
  type Issue,
} from '@fleetrentals/shared';
import { useAuth } from '../context/AuthContext';

export function IssuesPage() {
  const { user } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getCustomerRentals(user.uid).then((rentals) => {
      const active = rentals.find((r) => r.status === 'active' || r.status === 'overdue');
      setRental(active ?? null);
    });
    return subscribeIssues((all) => {
      setIssues(all.filter((i) => i.customerId === user.uid));
    });
  }, [user]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      setPhotoFiles((prev) => [...prev, file]);
      setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !user || !rental) return;
    const photoUrls = photoFiles.length > 0
      ? await Promise.all(photoFiles.map((f) => uploadFileToR2(`issues/${rental.id}`, f, user.uid)))
      : [];

    await createIssue({
      rentalId: rental.id,
      customerId: user.uid,
      customerName: user.displayName,
      vehicleId: rental.vehicleId,
      title: title.trim(),
      description: description.trim(),
      photos: photoUrls,
      status: 'open',
      createdAt: Date.now(),
    });
    setShowForm(false);
    setTitle('');
    setDescription('');
    setPhotoFiles([]);
    setPhotoPreviews([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Report Issue</h2>
          <p className="text-slate-400 text-sm">Something wrong with the vehicle?</p>
        </div>
        {rental && (
          <button onClick={() => setShowForm(true)} className="btn-primary p-3">
            <Plus size={20} />
          </button>
        )}
      </div>

      {showForm && (
        <div className="card space-y-4">
          <div>
            <label className="label">Issue Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flat tire, scratch, etc." />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." />
          </div>
          <div>
            <label className="label">Photos</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photoPreviews.map((p, i) => (
                <img key={i} src={p} className="w-full h-20 object-cover rounded-lg" alt="" />
              ))}
            </div>
            <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer text-sm py-2">
              <Camera size={16} /> Add Photos
              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="btn-primary flex-1">Submit Issue</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="card">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-orange-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">{issue.title}</p>
                <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    issue.status === 'open' ? 'bg-orange-500/20 text-orange-300' :
                    issue.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {issue.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {issue.photos && issue.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {issue.photos.map((p, i) => (
                      <img key={i} src={p} className="w-16 h-16 object-cover rounded-lg" alt="" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {issues.length === 0 && !showForm && (
          <div className="card text-center py-8 text-slate-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
            <p>No issues reported</p>
          </div>
        )}
      </div>
    </div>
  );
}
