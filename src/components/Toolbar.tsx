"use client";
"use no memo";

import React from 'react';

interface ToolbarProps {
  onReload: () => void;
  sortActivities: boolean;
  onToggleSortActivities: () => void;
  sortResources: boolean;
  onToggleSortResources: () => void;
}

export default function Toolbar({
  onReload,
  sortActivities,
  onToggleSortActivities,
  sortResources,
  onToggleSortResources,
}: Readonly<ToolbarProps>) {
  return (
    <div
      className="flex items-center gap-2 px-4 bg-white border-b border-gray-200"
      style={{ height: '44px', flexShrink: 0 }}
    >
      <button
        onClick={onReload}
        className="px-3 py-1 rounded text-[13px] font-medium border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 cursor-pointer"
        style={{ height: '32px' }}
      >
        Reload
      </button>
      <button
        onClick={onToggleSortActivities}
        className={
          sortActivities
            ? 'px-3 py-1 rounded text-[13px] font-medium bg-blue-600 text-white border-0 cursor-pointer'
            : 'px-3 py-1 rounded text-[13px] font-medium border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 cursor-pointer'
        }
        style={{ height: '32px' }}
      >
        Sort Activities
      </button>
      <button
        onClick={onToggleSortResources}
        className={
          sortResources
            ? 'px-3 py-1 rounded text-[13px] font-medium bg-blue-600 text-white border-0 cursor-pointer'
            : 'px-3 py-1 rounded text-[13px] font-medium border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 cursor-pointer'
        }
        style={{ height: '32px' }}
      >
        Sort Resources
      </button>
    </div>
  );
}
