"use client";
import React from "react";
import Header from "./Header";

interface VerificationResultProps {
  data: any;
  onClose?: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({ data }) => {
  const isFailed = data?.verified === false;

  const imageUrl = data?.face_image_url || null;
  const citizenData = data?.citizen_data || {};
  const nin = data?.nin || "";
  const confidenceScore = data?.confidence_score || 0;
  const matchedFinger = data?.matched_finger || "";

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <Header currentStep={1} totalSteps={1} />

      <main className="flex-1 overflow-auto flex items-center justify-center">
        <div className="mx-auto max-w-4xl p-4 sm:p-5 md:p-6 w-full">
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow-lg">
            {isFailed ? (
              <>
                {/* Title */}
                <div className="mb-6 sm:mb-8 text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                    Not Verified
                  </h2>
                </div>

                {/* Failed details box */}
                <div className="mb-5 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    Verification Details
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    We couldn’t verify this person with the provided fingerprint.
                    Please recapture and try again.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {matchedFinger ? (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Matched Finger
                        </span>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                          {matchedFinger}
                        </p>
                      </div>
                    ) : null}

                    {typeof confidenceScore === "number" ? (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Confidence Score
                        </span>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {(confidenceScore * 100).toFixed(2)}%
                        </p>
                      </div>
                    ) : null}

                    {nin ? (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          NIN
                        </span>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                          {nin}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <button
                    onClick={goHome}
                    className="rounded-lg bg-green-600 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Title */}
                <div className="mb-6 sm:mb-8 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                    ✓ Verified Successfully
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    NIN: {nin}
                  </p>
                </div>

                {/* Details of Person Text */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Details of Person
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                  {/* Image Section - Left */}
                  {imageUrl && (
                    <div className="flex-shrink-0 flex justify-center md:justify-start">
                      <div className="overflow-hidden rounded-lg border-4 border-green-300 shadow-md">
                        <img
                          src={imageUrl}
                          alt="Verified Person"
                          className="h-40 w-28 sm:h-48 sm:w-36 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Information Section - Right */}
                  <div className="flex-1">
                    {/* Verification Details */}
                    <div className="mb-5 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Verification Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Matched Finger
                          </span>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                            {matchedFinger}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Confidence Score
                          </span>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {(confidenceScore * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Citizen Data */}
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Person Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {Object.entries(citizenData).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-[11px] sm:text-xs font-medium text-gray-700 capitalize">
                              {key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <button
                    onClick={goHome}
                    className="rounded-lg bg-green-600 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationResult;
