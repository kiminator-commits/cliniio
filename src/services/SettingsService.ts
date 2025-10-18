import { supabase } from "@/lib/supabaseClient";
import { ModuleSettingsMap, ModuleSettings } from "@/types/ModuleSettingsMap";

export interface FacilitySetting<T extends keyof ModuleSettingsMap = keyof ModuleSettingsMap> {
  facility_id: string;
  module: T;
  settings: ModuleSettings<T>;
  updated_at?: string;
}

class SettingsService {
  private cache: Map<string, FacilitySetting<any>> = new Map();

  private getCacheKey(facilityId: string, module: string): string {
    return `${facilityId}:${module}`;
  }

  async getAllSettings<T extends keyof ModuleSettingsMap>(
    facilityId: string
  ): Promise<FacilitySetting<T>[]> {
    const { data, error } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("facility_id", facilityId);

    if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
    if (data) {
      data.forEach((s) =>
        this.cache.set(this.getCacheKey(s.facility_id, s.module), s)
      );
    }
    return (data ?? []) as FacilitySetting<T>[];
  }

  async getSetting<
    T extends keyof ModuleSettingsMap,
    K extends keyof ModuleSettings<T>
  >(facilityId: string, module: T, key: K): Promise<ModuleSettings<T>[K]> {
    const cacheKey = this.getCacheKey(facilityId, module as string);
    const cached = this.cache.get(cacheKey) as FacilitySetting<T> | undefined;

    if (cached && cached.settings[key] !== undefined) {
      return cached.settings[key];
    }

    const { data, error } = await supabase
      .from("ai_settings")
      .select("settings")
      .eq("facility_id", facilityId)
      .eq("module", module as string)
      .single();

    if (error) throw new Error(`Failed to fetch setting: ${error.message}`);
    if (data)
      this.cache.set(cacheKey, {
        ...data,
        facility_id: facilityId,
        module,
      } as FacilitySetting<T>);

    return (data?.settings?.[key] ?? undefined) as ModuleSettings<T>[K];
  }

  async setSetting<
    T extends keyof ModuleSettingsMap,
    K extends keyof ModuleSettings<T>
  >(facilityId: string, module: T, key: K, value: ModuleSettings<T>[K]): Promise<void> {
    const cacheKey = this.getCacheKey(facilityId, module as string);
    const cached = this.cache.get(cacheKey) as FacilitySetting<T> | undefined;
    const updatedSettings: ModuleSettings<T> = {
      ...(cached?.settings ?? {}),
      [key]: value,
    } as ModuleSettings<T>;

    const { error } = await supabase
      .from("ai_settings")
      .upsert(
        { facility_id: facilityId, module, settings: updatedSettings },
        { onConflict: "facility_id,module" }
      );

    if (error) throw new Error(`Failed to update setting: ${error.message}`);

    this.cache.set(cacheKey, {
      facility_id: facilityId,
      module,
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    } as FacilitySetting<T>);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const settingsService = new SettingsService();
