import { useState } from 'react';
import type { RentalAgreement } from '@fleetrentals/shared';

const INVENTORY_ITEMS = [
  'Spare Tire', '4 Tires', 'Jack', 'Wrench', 'Rug', 'Lighter', 'Radio', 'Antenna', 'Hub Caps', 'Gasoline Cap',
];

interface Props {
  value: RentalAgreement;
  onChange: (v: RentalAgreement) => void;
  customerName?: string;
  onSign?: () => void;
  signed?: boolean;
}

export function RentalAgreementForm({ value, onChange, customerName, onSign, signed }: Props) {
  const [showForm, setShowForm] = useState(true);
  const set = (patch: Partial<RentalAgreement>) => onChange({ ...value, ...patch });

  const toggleInventory = (item: string) => {
    const inv = { ...(value.inventory ?? {}) };
    inv[item] = !inv[item];
    set({ inventory: inv });
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold text-lg mb-2">Rental / Leasing Agreement</h3>
        <p className="text-sm text-slate-400 mb-4">
          Tress Enterprise Car Rental and Leasing — Upper Fort Road, St. John's, Antigua · (268) 774-6378 | 771-3914
        </p>
        <img
          src="/rental-agreement-form.jpg"
          alt="Tress Enterprise rental agreement reference"
          className="w-full rounded-xl border border-slate-600 mb-4 max-h-48 object-contain bg-white"
        />
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-brand-400 hover:text-brand-300"
        >
          {showForm ? 'Hide digital form' : 'Show digital form'}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={customerName ?? ''} readOnly placeholder="From your account" />
            </div>
            <div>
              <label className="label">Date of birth</label>
              <input className="input" type="date" value={value.dob ?? ''} onChange={(e) => set({ dob: e.target.value })} />
            </div>
            <div>
              <label className="label">Home address</label>
              <input className="input" value={value.homeAddress ?? ''} onChange={(e) => set({ homeAddress: e.target.value })} />
            </div>
            <div>
              <label className="label">Home phone</label>
              <input className="input" value={value.homePhone ?? ''} onChange={(e) => set({ homePhone: e.target.value })} />
            </div>
            <div>
              <label className="label">Local address (Antigua)</label>
              <input className="input" value={value.localAddress ?? ''} onChange={(e) => set({ localAddress: e.target.value })} />
            </div>
            <div>
              <label className="label">Local phone</label>
              <input className="input" value={value.localPhone ?? ''} onChange={(e) => set({ localPhone: e.target.value })} />
            </div>
            <div>
              <label className="label">Driver's license #</label>
              <input className="input" value={value.licenseNumber ?? ''} onChange={(e) => set({ licenseNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">License date issued</label>
              <input className="input" type="date" value={value.licenseIssued ?? ''} onChange={(e) => set({ licenseIssued: e.target.value })} />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-3 text-xs text-slate-300">
            <p className="font-semibold text-yellow-300 mb-1">Late return</p>
            <p>Charge of EC$20.00 per hour for late returns.</p>
            <input className="input mt-2" placeholder="Initial (type your name)" value={value.lateFeeInitial ?? ''} onChange={(e) => set({ lateFeeInitial: e.target.value })} />
          </div>

          <div className="bg-slate-700/50 rounded-xl p-3 text-xs text-slate-300">
            <p className="font-semibold mb-1">Loss Damage Waiver (LDW) — EC$30.00</p>
            <p>Hirer responsible for first EC$6,000 of loss/damage unless LDW accepted.</p>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" checked={value.ldwAccepted === true} onChange={() => set({ ldwAccepted: true })} />
                I Accept
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={value.ldwAccepted === false} onChange={() => set({ ldwAccepted: false })} />
                I Don't Accept
              </label>
            </div>
            <input className="input mt-2" placeholder="Liability initial" value={value.liabilityInitial ?? ''} onChange={(e) => set({ liabilityInitial: e.target.value })} />
          </div>

          <div>
            <p className="label">Vehicle inventory checklist</p>
            <div className="grid grid-cols-2 gap-2">
              {INVENTORY_ITEMS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={value.inventory?.[item] ?? false} onChange={() => toggleInventory(item)} />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Electronic signature (type full name)</label>
            <input
              className="input"
              value={value.hirerSignature ?? ''}
              onChange={(e) => set({ hirerSignature: e.target.value })}
              placeholder="Your full legal name"
            />
          </div>

          {!signed && onSign && (
            <button
              type="button"
              onClick={onSign}
              disabled={!value.hirerSignature?.trim()}
              className="btn-primary w-full"
            >
              Sign agreement electronically
            </button>
          )}
          {signed && (
            <p className="text-green-400 text-sm font-medium">✓ Agreement signed</p>
          )}
        </div>
      )}
    </div>
  );
}
