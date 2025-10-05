import React from "react";

const MaintenanceMode: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-600 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Simple error-like appearance */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-lg font-normal text-gray-500">
            Nothing to see here
          </h1>
          <p className="text-sm text-gray-400">
            This page appears to be empty or under construction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
