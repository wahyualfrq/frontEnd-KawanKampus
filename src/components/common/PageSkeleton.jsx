import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Shimmering Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="h-4 w-72 bg-gray-200 rounded-lg" />
      </div>

      {/* Shimmering Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pt-4">
        {/* Column 1 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-12 w-full bg-gray-200 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-28 w-full bg-gray-200 rounded-[20px]" />
            <div className="h-28 w-full bg-gray-200 rounded-[20px]" />
            <div className="h-28 w-full bg-gray-200 rounded-[20px]" />
          </div>
        </div>

        {/* Column 2 */}
        <div className="hidden lg:block space-y-4">
          <div className="h-[400px] w-full bg-gray-200 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
