"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Fingerprint as FingerprintIcon, X } from "lucide-react";
import Header from "./Header";
import NinModal from "./modals/NinModal";
import type { EnrollmentFormData } from "@/utils/types";

// ✅ Single finger only (no 10-finger flow)
const FINGERS = [{ id: "R1", name: "Right Thumb", hand: "right" }] as const;

type Finger = (typeof FINGERS)[number];
type FingerId = Finger["id"];

type FingerprintData = {
  image: string;
  base64: string;
  imageName: string;
  file?: File;
};

const PY_URL = process.env.NEXT_PUBLIC_PYTHON_URL ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const FINGER_FIELD_MAP: Record<FingerId, keyof EnrollmentFormData> = {
  R1: "right_thumb",
};

function base64ToFile(
  base64: string,
  fileName: string,
  fallbackType = "image/png"
): File {
  let mime = fallbackType;
  let data = base64;
  if (base64.startsWith("data:")) {
    const [header, body] = base64.split(",");
    const m = header.match(/data:(.*?);base64/);
    if (m) mime = m[1];
    data = body;
  }
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], fileName || `finger-${Date.now()}.png`, { type: mime });
}

const initialForm: EnrollmentFormData = {
  nin: "",
  right_thumb: null,
  right_index: null,
  right_middle: null,
  right_ring: null,
  right_little: null,
  left_thumb: null,
  left_index: null,
  left_middle: null,
  left_ring: null,
  left_little: null,
};

const FingerPrintCapture: React.FC = () => {
  const [currentFingerIndex] = useState<number>(0); // always 0 now
  const [capturedFingers, setCapturedFingers] = useState<
    Partial<Record<FingerId, FingerprintData>>
  >({});
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const [form, setForm] = useState<EnrollmentFormData>(initialForm);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitDone, setSubmitDone] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);

  const currentFinger = FINGERS[currentFingerIndex];

  const capturedCount = useMemo(
    () => Object.keys(capturedFingers).length,
    [capturedFingers]
  );

  // ✅ With single finger, "all captured" means 1 capture done
  const isCaptured = !!capturedFingers[currentFinger.id];

  const fetchFingerprint = async (fingerId: FingerId) => {
    try {
      setIsCapturing(true);
      const res = await fetch(`${PY_URL}/scan-fingerprint2`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Scan failed (${res.status}). ${text}`);
      }

      const data: { image: string; base64: string; imageName: string } =
        await res.json();

      setIsScanning(true);

      // keep your scan animation delay
      setTimeout(() => {
        const file = base64ToFile(data.base64, data.imageName, "image/png");

        setCapturedFingers((prev) => ({
          ...prev,
          [fingerId]: {
            image: `${PY_URL}/${data.image}`,
            base64: data.base64,
            imageName: data.imageName,
            file,
          },
        }));

        const field = FINGER_FIELD_MAP[fingerId];
        setForm((f) => ({ ...f, [field]: file }));

        setIsScanning(false);
        setIsCapturing(false);
      }, 2000);
    } catch (e) {
      console.error("Error capturing fingerprint:", e);
      setIsCapturing(false);
      setIsScanning(false);
      alert(
        `Failed to scan fingerprint: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    }
  };

  const deleteFingerprint = async (fingerId: FingerId) => {
    const fingerData = capturedFingers[fingerId];
    if (!fingerData) return;

    try {
      await fetch(`${PY_URL}/delete-fingerprint`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: fingerData.imageName,
      });

      setCapturedFingers((prev) => {
        const copy = { ...prev };
        delete copy[fingerId];
        return copy;
      });

      const field = FINGER_FIELD_MAP[fingerId];
      setForm((f) => ({ ...f, [field]: null }));

      // ✅ If they delete the only capture, close modal
      setShowModal(false);
    } catch (e) {
      console.error("Error deleting fingerprint:", e);
    }
  };

  // ✅ Auto-scan once on load (like you had before), because we only have one finger
  useEffect(() => {
    const id = currentFinger.id;
    if (!capturedFingers[id] && !isCapturing) {
      void fetchFingerprint(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ When the single scan exists, open modal (only if not already open/done)
  useEffect(() => {
    if (isCaptured && !showModal && !submitDone) {
      setShowModal(true);
    }
  }, [isCaptured, showModal, submitDone]);

  // ✅ Submit NIN + ONE fingerprint file
  const handleSubmitEnrollment = async (nin: string) => {
    // must have the captured file
    const fp = form.right_thumb;
    if (!fp) {
      alert("No fingerprint captured. Please scan again.");
      setShowModal(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("nin", nin);

      // Send only the single fingerprint
      fd.append("right_thumb", fp, fp.name || "right_thumb.png");

      const resp = await fetch(`${API_URL}/enroll`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const data = await resp.json();
          msg = (data?.message || data?.detail || msg) as string;
        } catch {}
        throw new Error(msg);
      }

      // ✅ Success only after backend OK
      setSubmitDone(true);
      setShowModal(false);
    } catch (err) {
      console.error("Verify/submit failed:", err);
      alert(
        `Failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitDone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentStep={1} totalSteps={1} />
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center p-6">
          <div className="w-full rounded-lg bg-white p-8 text-center shadow">
            <h2 className="mb-2 text-2xl font-bold text-green-600">
              Verified / Submitted!
            </h2>
            <p className="text-gray-600">
              Fingerprint submitted successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <Header currentStep={1} totalSteps={1} />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                 Place a Finger on the Scanner
                </h2>
                <p className="text-gray-600">
                  {isCaptured
                    ? "Fingerprint captured. Proceed to enter NIN."
                    : "Please place your finger on the scanner."}
                </p>
              </div>

              <div className="rounded-full bg-white px-4 py-1.5 shadow">
                <span className="text-xs font-medium text-gray-700">
                  Progress: {capturedCount}/{FINGERS.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-64 overflow-hidden rounded-lg border-4 border-gray-300 bg-gray-50 h-[420px]">
                  {isCaptured && !isScanning ? (
                    <div className="relative h-full w-full">
                      <img
                        src={capturedFingers[currentFinger.id]!.image}
                        alt={currentFinger.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => deleteFingerprint(currentFinger.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 shadow-lg hover:bg-red-600"
                        aria-label="Delete fingerprint"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ) : isScanning ? (
                    <div className="relative flex h-full w-full items-center justify-center bg-green-500/50">
                      <div className="animate-scan absolute left-0 right-0 h-1 bg-green-600" />
                      <FingerprintIcon className="h-32 w-32 animate-pulse text-white" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FingerprintIcon className="h-32 w-32 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fetchFingerprint(currentFinger.id)}
                disabled={isCapturing}
                className="rounded-lg bg-green-800 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isCaptured ? "Recapture" : "Scan Fingerprint"}
              </button>

              {isCaptured && (
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  Enter NIN
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {isSubmitting && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/20">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow">
            <div className="h-10 w-10 animate-spin rounded-full border-b-4 border-green-600" />
            <p className="text-sm text-gray-600">Submitting…</p>
          </div>
        </div>
      )}

      <NinModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitEnrollment}
      />

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 4px); }
          100% { top: 0; }
        }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FingerPrintCapture;
