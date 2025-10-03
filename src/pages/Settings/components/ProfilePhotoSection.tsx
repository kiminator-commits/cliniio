import React, { useRef } from 'react';
import Icon from '@mdi/react';
import { mdiCamera, mdiDelete, mdiAccount } from '@mdi/js';

interface ProfilePhotoSectionProps {
  avatarUrl?: string | null;
  uploading: boolean;
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoRemove: () => Promise<void>;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  avatarUrl,
  uploading,
  onPhotoUpload,
  onPhotoRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon path={mdiAccount} size={3} className="text-gray-400" />
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading}
          className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Icon path={mdiCamera} size={1} />
          <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
        </button>

        {avatarUrl && (
          <button
            type="button"
            onClick={onPhotoRemove}
            disabled={uploading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Icon path={mdiDelete} size={1} />
            <span>Remove</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-gray-500 text-center">
        Recommended: Square image, at least 200x200 pixels
      </p>
    </div>
  );
};
