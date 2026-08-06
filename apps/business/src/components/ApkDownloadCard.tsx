import { Download, Smartphone, Bell } from 'lucide-react';

const APK_URL =
  import.meta.env.VITE_APK_DOWNLOAD_URL ??
  'https://fleetrentals-storage.neuereatec.workers.dev/apks/tress-enterprise-business.apk';

export function ApkDownloadCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? 'p-3' : 'card'} bg-brand-900/40 border border-brand-600/50 rounded-2xl`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Smartphone size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-brand-300 flex items-center gap-2">
            <Bell size={16} /> Get the Android app
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Install the APK for loud overdue alerts, vibration, and reliable push notifications.
          </p>
          {!compact && (
            <p className="text-xs text-slate-500 mt-1">
              Web browsers limit alerts. The app keeps notifications working in the background.
            </p>
          )}
          <a
            href={APK_URL}
            download="tress-enterprise-business.apk"
            className="mt-3 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
          >
            <Download size={18} />
            Download Android APK
          </a>
        </div>
      </div>
    </div>
  );
}
