"use client";
import React, { useEffect, useState } from "react";

interface NinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (nin: string) => Promise<void>;
  loading?: boolean; // <-- NEW (controlled by parent)
}

const NinModal: React.FC<NinModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [nin, setNin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!/^\d{11}$/.test(nin)) {
      setError("NIN must be 11 digits");
      return;
    }
    setError("");
    await onSubmit(nin);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nin.length === 11 && !loading) {
      handleSubmit();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-[92vw] sm:max-w-sm rounded-lg bg-white p-4 sm:p-6 shadow-lg border border-gray-200">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Enter Your NIN
          </h2>
        </div>

        {/* Input Section */}
        <div className="mb-4 space-y-2">
          <label className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">
            National Identification Number
          </label>

          <input
            type="text"
            value={nin}
            inputMode="numeric"
            autoFocus
            disabled={loading}
            onChange={(e) =>
              setNin(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-black placeholder-gray-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:bg-gray-50"
            placeholder="00000000000"
            maxLength={11}
          />

          <p className="text-[11px] sm:text-xs text-gray-500">
            {nin.length}/11 digits
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 sm:mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || nin.length !== 11}
            className="flex-1 rounded-md bg-green-600 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NinModal;
