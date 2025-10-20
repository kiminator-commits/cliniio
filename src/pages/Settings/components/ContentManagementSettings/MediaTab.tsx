import React from 'react';
import { useMediaSettings } from '../../../../hooks/useMediaSettings';

export const MediaTab: React.FC = () => {
  const { settings, loading, error, updateSetting, facilityLoading } = useMediaSettings();

  const handleToggleChange = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
  };

  const handleFileSizeChange = (value: number) => {
    updateSetting('maxFileSize', value);
  };

  const handleWatermarkToggle = (enabled: boolean) => {
    updateSetting('watermarkSettings', {
      ...settings.watermarkSettings,
      enabled,
    });
  };

  const handleWatermarkPositionChange = (position: string) => {
    updateSetting('watermarkSettings', {
      ...settings.watermarkSettings,
      position,
    });
  };

  const handleWatermarkOpacityChange = (opacity: number) => {
    updateSetting('watermarkSettings', {
      ...settings.watermarkSettings,
      opacity,
    });
  };

  if (loading || facilityLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading media settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-sm text-red-700">Error loading media settings: {error}</div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="500"
                value={settings.maxFileSize}
                onChange={(e) => handleFileSizeChange(parseInt(e.target.value) || 50)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
              />
              <span className="text-sm font-medium text-gray-900">MB</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-compress images</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-compress-images"
                className="sr-only peer"
                checked={settings.autoCompression}
                onChange={(e) => handleToggleChange('autoCompression', e.target.checked)}
              />
              <div className={`w-11 h-6 ${settings.autoCompression ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.autoCompression ? 'after:translate-x-full' : ''}`}></div>
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
                checked={settings.backupEnabled}
                onChange={(e) => handleToggleChange('backupEnabled', e.target.checked)}
              />
              <div className={`w-11 h-6 ${settings.backupEnabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.backupEnabled ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Generate thumbnails</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CDN enabled</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="cdn-enabled"
                className="sr-only peer"
                checked={settings.cdnEnabled}
                onChange={(e) => handleToggleChange('cdnEnabled', e.target.checked)}
              />
              <div className={`w-11 h-6 ${settings.cdnEnabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.cdnEnabled ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">CDN enabled</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Watermark Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enable watermark</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="watermark-enabled"
                className="sr-only peer"
                checked={settings.watermarkSettings.enabled}
                onChange={(e) => handleWatermarkToggle(e.target.checked)}
              />
              <div className={`w-11 h-6 ${settings.watermarkSettings.enabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.watermarkSettings.enabled ? 'after:translate-x-full' : ''}`}></div>
              <span className="sr-only">Enable watermark</span>
            </label>
          </div>
          
          {settings.watermarkSettings.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Position</span>
                <select
                  value={settings.watermarkSettings.position}
                  onChange={(e) => handleWatermarkPositionChange(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Opacity</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.watermarkSettings.opacity}
                    onChange={(e) => handleWatermarkOpacityChange(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {Math.round(settings.watermarkSettings.opacity * 100)}%
                  </span>
                </div>
              </div>
            </>
          )}
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
