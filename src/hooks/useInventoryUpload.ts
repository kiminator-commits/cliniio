import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useInventoryUpload(facilityId: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInventoryUpload(file: File) {
    if (!file || !facilityId) return;

    try {
      setUploading(true);
      setError(null);

      // Upload file to Supabase Storage bucket "inventory_uploads"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('inventory_uploads')
        .upload(`${facilityId}/${Date.now()}_${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Record metadata for audit tracking
      const { error: insertError } = await supabase
        .from('inventory_files')
        .insert([
          {
            facility_id: facilityId,
            file_name: file.name,
            storage_path: uploadData?.path || '',
            uploaded_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      if (process.env.NODE_ENV === 'development') {
        console.debug(`📦 Uploaded inventory file: ${file.name}`);
      }

      return uploadData;
    } catch (err: any) {
      console.error('handleInventoryUpload failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return {
    uploading,
    error,
    handleInventoryUpload,
  };
}
