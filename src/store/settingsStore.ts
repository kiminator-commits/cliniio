import { create } from "zustand";
import {
  settingsService,
  FacilitySetting,
} from "@/services/SettingsService";
import { ModuleSettingsMap, ModuleSettings } from "@/types/ModuleSettingsMap";

interface SettingsState {
  settings: Record<string, FacilitySetting<string | number>>;
  loading: boolean;
  error: string | null;
  fetchSettings: (facilityId: string) => Promise<void>;
  getSetting: <
    T extends keyof ModuleSettingsMap,
    K extends keyof ModuleSettings<T>
  >(
    facilityId: string,
    module: T,
    key: K
  ) => Promise<ModuleSettings<T>[K]>;
  setSetting: <
    T extends keyof ModuleSettingsMap,
    K extends keyof ModuleSettings<T>
  >(
    facilityId: string,
    module: T,
    key: K,
    value: ModuleSettings<T>[K]
  ) => Promise<void>;
  clearSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,
  error: null,

  async fetchSettings(facilityId) {
    set({ loading: true, error: null });
    try {
      const data = await settingsService.getAllSettings(facilityId);
      const mapped = Object.fromEntries(
        data.map((s) => [`${s.facility_id}:${s.module}`, s])
      );
      set({ settings: mapped, loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  async getSetting(facilityId, module, key) {
    try {
      const cacheKey = `${facilityId}:${module}`;
      const cached = get().settings[cacheKey] as FacilitySetting<string | number>;
      if (cached && cached.settings[key as string] !== undefined) {
        return cached.settings[key as string] as ModuleSettings<typeof module>[typeof key];
      }
      const value = await settingsService.getSetting(facilityId, module, key);
      if (value !== undefined) {
        const updated = { ...get().settings };
        if (!updated[cacheKey]) {
          updated[cacheKey] = {
            facility_id: facilityId,
            module,
            settings: {} as Record<string, string | number>,
          };
        }
        (updated[cacheKey].settings as Record<string, string | number>)[key as string] = value as string | number;
        set({ settings: updated });
      }
      return value as ModuleSettings<typeof module>[typeof key];
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  },

  async setSetting(facilityId, module, key, value) {
    try {
      await settingsService.setSetting(facilityId, module, key, value);
      const cacheKey = `${facilityId}:${module}`;
      const updated = { ...get().settings };
        if (!updated[cacheKey]) {
          updated[cacheKey] = {
            facility_id: facilityId,
            module,
            settings: {} as Record<string, string | number>,
          };
        }
        (updated[cacheKey].settings as Record<string, string | number>)[key as string] = value as string | number;
      set({ settings: updated });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  },

  clearSettings() {
    set({ settings: {}, error: null });
    settingsService.clearCache();
  },
}));
