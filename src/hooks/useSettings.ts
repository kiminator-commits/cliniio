import { useCallback } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function useSettings(facilityId: string) {
  const {
    settings,
    loading,
    error,
    fetchSettings,
    getSetting,
    setSetting,
    clearSettings,
  } = useSettingsStore();

  const get = useCallback(
    async (module: string, key: string) => {
      return await getSetting(facilityId, module, key);
    },
    [facilityId, getSetting]
  );

  const set = useCallback(
    async (module: string, key: string, value: unknown) => {
      await setSetting(facilityId, module, key, value);
    },
    [facilityId, setSetting]
  );

  const loadAll = useCallback(async () => {
    await fetchSettings(facilityId);
  }, [facilityId, fetchSettings]);

  const clear = useCallback(() => {
    clearSettings();
  }, [clearSettings]);

  return {
    settings,
    loading,
    error,
    get,
    set,
    loadAll,
    clear,
  };
}
