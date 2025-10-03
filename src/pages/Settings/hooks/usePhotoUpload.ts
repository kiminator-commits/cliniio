import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface PhotoUploadState {
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
}

export const usePhotoUpload = () => {
  const [state, setState] = useState<PhotoUploadState>({
    uploading: false,
    uploadError: null,
    uploadSuccess: false,
  });

  const uploadProfilePhoto = useCallback(async (file: File, userId: string) => {
    try {
      setState((prev) => ({ ...prev, uploading: true, uploadError: null }));

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setState((prev) => ({ ...prev, uploadSuccess: true }));
      setTimeout(
        () => setState((prev) => ({ ...prev, uploadSuccess: false })),
        3000
      );

      return publicUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload photo';
      setState((prev) => ({ ...prev, uploadError: errorMessage }));
      return null;
    } finally {
      setState((prev) => ({ ...prev, uploading: false }));
    }
  }, []);

  const removeProfilePhoto = useCallback(async (userId: string) => {
    try {
      setState((prev) => ({ ...prev, uploading: true, uploadError: null }));

      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setState((prev) => ({ ...prev, uploadSuccess: true }));
      setTimeout(
        () => setState((prev) => ({ ...prev, uploadSuccess: false })),
        3000
      );

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove photo';
      setState((prev) => ({ ...prev, uploadError: errorMessage }));
      return false;
    } finally {
      setState((prev) => ({ ...prev, uploading: false }));
    }
  }, []);

  const clearUploadState = useCallback(() => {
    setState({
      uploading: false,
      uploadError: null,
      uploadSuccess: false,
    });
  }, []);

  return {
    ...state,
    uploadProfilePhoto,
    removeProfilePhoto,
    clearUploadState,
  };
};
