import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuctionStore } from '../../store/auction.store';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useAuctionStore();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 bg-slate-900/95 border-slate-700">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-400 shrink-0" />}

      <span className="text-sm font-medium text-slate-100">{toastMessage.text}</span>

      <button
        onClick={() => (useAuctionStore.getState() as any).showToast('', 'info')}
        className="ml-2 text-slate-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
