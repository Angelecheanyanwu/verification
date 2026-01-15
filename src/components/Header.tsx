import React from "react";
import { BsCheck2Circle } from "react-icons/bs";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number[];
}

const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  completedSteps = [],
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BsCheck2Circle className="h-10 w-10 text-green-600" />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                VerifyMe
              </h1>

              <p className="text-gray-500 italic text-sm md:text-xs">
               .... Verify identities in seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
