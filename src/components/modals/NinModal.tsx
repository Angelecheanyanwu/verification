"use client";
import React, { useState } from "react";

interface NinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (nin: string) => Promise<void>;
}

const NinModal: React.FC<NinModalProps> = ({ open, onClose, onSubmit }) => {
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!/^\d{11}$/.test(nin)) {
      setError("NIN must be 11 digits");
      return;
    }
    setError("");
    setLoading(true);
    await onSubmit(nin);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 text-center">
          Enter Your NIN
        </h2>
        <input
          type="text"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter 11-digit NIN"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-green-600 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NinModal;
