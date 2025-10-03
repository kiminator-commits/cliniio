import React, { useState, useRef } from 'react';
import { useContentBuilder } from '../context/ContentBuilderContext';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiImage,
  mdiVideo,
  mdiFileDocument,
  mdiDelete,
} from '@mdi/js';
import { MediaItem } from '../types';

const MediaLibrary: React.FC = () => {
  const { state, dispatch } = useContentBuilder();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type and size
        if (!isValidFile(file)) {
          console.error(`Invalid file: ${file.name}`);
          continue;
        }

        // Create media item (in a real app, this would upload to Supabase storage)
        const mediaItem: MediaItem = {
          id: crypto.randomUUID(),
          name: file.name,
          title: file.name,
          type: getMediaType(file.type),
          url: URL.createObjectURL(file), // Temporary URL for demo
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
        };

        dispatch({ type: 'ADD_MEDIA', payload: mediaItem });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const isValidFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
      // Videos
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/avi',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/ogg',
      // Documents
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Presentations
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Spreadsheets
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    return file.size <= maxSize && allowedTypes.includes(file.type);
  };

  const getMediaType = (mimeType: string): MediaItem['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
      return 'presentation';
    return 'document';
  };

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return mdiImage;
      case 'video':
        return mdiVideo;
      case 'audio':
        return mdiFileDocument;
      case 'presentation':
        return mdiFileDocument;
      case 'document':
        return mdiFileDocument;
      default:
        return mdiFileDocument;
    }
  };

  const getMediaColor = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'video':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'audio':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'presentation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'document':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveMedia = (mediaId: string) => {
    dispatch({ type: 'REMOVE_MEDIA', payload: mediaId });
  };

  const handleAddToContent = (mediaItem: MediaItem) => {
    if (state.currentContent) {
      const updatedMedia = [...(state.currentContent.media || []), mediaItem];
      dispatch({ type: 'UPDATE_CONTENT', payload: { media: updatedMedia } });
    }
  };

  const isMediaInContent = (mediaId: string): boolean => {
    return (
      state.currentContent?.media?.some((media) => media.id === mediaId) ||
      false
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon path={mdiPlus} size={14} className="mr-1" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {!state.mediaLibrary || state.mediaLibrary.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              path={mdiImage}
              size={32}
              className="mx-auto text-gray-400 mb-2"
            />
            <p className="text-sm text-gray-500">No media files uploaded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload files to get started
            </p>
          </div>
        ) : (
          (state.mediaLibrary || []).map((media) => (
            <div
              key={media.id}
              className={`p-3 rounded-lg border ${getMediaColor(media.type)}`}
            >
              <div className="flex items-center space-x-3">
                <Icon path={getMediaIcon(media.type)} size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{media.name}</p>
                  <p className="text-xs opacity-75">
                    {formatFileSize(media.size || 0)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {!isMediaInContent(media.id) && (
                    <button
                      onClick={() => handleAddToContent(media)}
                      className="p-1 text-xs hover:bg-white hover:bg-opacity-20 rounded"
                      title="Add to content"
                    >
                      <Icon path={mdiPlus} size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMedia(media.id)}
                    className="p-1 text-xs hover:bg-white hover:bg-opacity-20 rounded"
                    title="Remove from library"
                  >
                    <Icon path={mdiDelete} size={14} />
                  </button>
                </div>
              </div>

              {isMediaInContent(media.id) && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <span className="text-xs opacity-75">✓ Added to content</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-500">
        <p>Supported: Images, Videos, Audio, Documents</p>
        <p>Max size: 50MB per file</p>
      </div>
    </div>
  );
};

export default MediaLibrary;
