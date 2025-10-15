import React from 'react';

export const MediaTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Media Upload Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Max file size per upload
            </span>
            <span className="text-sm font-medium text-gray-900">50 MB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-compress images</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-compress-images"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Auto-compress images</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Generate thumbnails</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="generate-thumbnails"
                className="sr-only peer"
                defaultChecked
              />
              <div className="w-11 h-6 bg-[#4ECDC4] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:translate-x-full"></div>
              <span className="sr-only">Generate thumbnails</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Supported File Types
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="text-sm font-medium text-green-800 mb-2">Images</h5>
            <p className="text-xs text-green-700">JPEG, PNG, GIF, WebP, HEIC</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Videos</h5>
            <p className="text-xs text-blue-700">MP4, WebM, MOV, AVI</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h5 className="text-sm font-medium text-purple-800 mb-2">Audio</h5>
            <p className="text-xs text-purple-700">MP3, WAV, AAC, OGG</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-800 mb-2">
              Documents
            </h5>
            <p className="text-xs text-gray-700">
              PDF, Word, PowerPoint, Excel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
