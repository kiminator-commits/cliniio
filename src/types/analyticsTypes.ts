// Strengthened analytics types
// This file provides specific, type-safe interfaces for all analytics providers

// ============================================================================
// GOOGLE ANALYTICS TYPES
// ============================================================================

export interface GoogleAnalyticsConfig {
  measurementId: string;
  customMap?: Record<string, string>;
  sendPageView?: boolean;
  anonymizeIp?: boolean;
  allowAdFeatures?: boolean;
  allowGoogleSignals?: boolean;
}

export interface GoogleAnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, string | number | boolean>;
}

export interface GoogleAnalyticsUser {
  user_id: string;
  user_properties?: Record<string, string | number | boolean>;
  custom_claims?: Record<string, string | number | boolean>;
}

export interface GoogleAnalytics {
  gtag: (
    command: 'config' | 'event' | 'set' | 'get',
    targetId: string,
    config?:
      | GoogleAnalyticsConfig
      | GoogleAnalyticsEvent
      | Record<string, unknown>
  ) => void;
}

// ============================================================================
// MIXPANEL TYPES
// ============================================================================

export interface MixpanelConfig {
  token: string;
  debug?: boolean;
  track_pageview?: boolean;
  persistence?: 'localStorage' | 'cookie' | 'memory';
  batch_requests?: boolean;
  batch_size?: number;
  batch_flush_interval_ms?: number;
}

export interface MixpanelEvent {
  event: string;
  properties?: {
    distinct_id?: string;
    time?: number;
    $insert_id?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export interface MixpanelUserProperties {
  $first_name?: string;
  $last_name?: string;
  $email?: string;
  $phone?: string;
  $created?: string;
  $last_seen?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface Mixpanel {
  track: (eventName: string, properties?: MixpanelEvent['properties']) => void;
  identify: (userId: string) => void;
  people: {
    set: (properties: MixpanelUserProperties) => void;
    set_once: (properties: MixpanelUserProperties) => void;
    increment: (properties: Record<string, number>) => void;
    append: (properties: Record<string, string[]>) => void;
    union: (properties: Record<string, string[]>) => void;
    track_charge: (
      amount: number,
      properties?: Record<string, unknown>
    ) => void;
    clear_charges: () => void;
    delete_user: () => void;
  };
  alias: (alias: string) => void;
  reset: () => void;
  get_distinct_id: () => string;
  register: (properties: Record<string, unknown>) => void;
  unregister: (property: string) => void;
  time_event: (eventName: string) => void;
  track_links: (
    selector: string,
    eventName: string,
    properties?: Record<string, unknown>
  ) => void;
  track_forms: (
    selector: string,
    eventName: string,
    properties?: Record<string, unknown>
  ) => void;
}

// ============================================================================
// AMPLITUDE TYPES
// ============================================================================

export interface AmplitudeConfig {
  apiKey: string;
  userId?: string;
  deviceId?: string;
  sessionId?: number;
  options?: {
    saveEvents?: boolean;
    includeUtm?: boolean;
    includeReferrer?: boolean;
    includeGclid?: boolean;
    includeFbclid?: boolean;
    saveParamsReferrerOncePerSession?: boolean;
    trackingOptions?: {
      city?: boolean;
      country?: boolean;
      carrier?: boolean;
      device_manufacturer?: boolean;
      device_model?: boolean;
      dma?: boolean;
      ip_address?: boolean;
      language?: boolean;
      os_name?: boolean;
      os_version?: boolean;
      platform?: boolean;
      region?: boolean;
      version_name?: boolean;
    };
  };
}

export interface AmplitudeEvent {
  event_type: string;
  user_id?: string;
  device_id?: string;
  time?: number;
  event_properties?: Record<string, string | number | boolean | null>;
  user_properties?: Record<string, string | number | boolean | null>;
  groups?: Record<string, string | string[]>;
  app_version?: string;
  platform?: string;
  os_name?: string;
  os_version?: string;
  device_brand?: string;
  device_manufacturer?: string;
  device_model?: string;
  carrier?: string;
  country?: string;
  region?: string;
  city?: string;
  dma?: string;
  language?: string;
  price?: number;
  quantity?: number;
  revenue?: number;
  productId?: string;
  revenueType?: string;
  location_lat?: number;
  location_lng?: number;
  ip?: string;
  idfa?: string;
  idfv?: string;
  adid?: string;
  android_id?: string;
  event_id?: number;
  session_id?: number;
  insert_id?: string;
}

export interface AmplitudeUserProperties {
  user_id?: string;
  device_id?: string;
  user_properties?: Record<string, string | number | boolean | null>;
  groups?: Record<string, string | string[]>;
  app_version?: string;
  platform?: string;
  os_name?: string;
  os_version?: string;
  device_brand?: string;
  device_manufacturer?: string;
  device_model?: string;
  carrier?: string;
  country?: string;
  region?: string;
  city?: string;
  dma?: string;
  language?: string;
  location_lat?: number;
  location_lng?: number;
  ip?: string;
  idfa?: string;
  idfv?: string;
  adid?: string;
  android_id?: string;
}

export interface Amplitude {
  getInstance: () => {
    logEvent: (
      eventName: string,
      properties?: AmplitudeEvent['event_properties']
    ) => void;
    setUserId: (userId: string) => void;
    setUserProperties: (properties: AmplitudeUserProperties) => void;
    identify: (identify: AmplitudeUserProperties) => void;
    setGroup: (groupType: string, groupName: string | string[]) => void;
    groupIdentify: (
      groupType: string,
      groupName: string | string[],
      identify: AmplitudeUserProperties
    ) => void;
    regenerateDeviceId: () => void;
    getDeviceId: () => string;
    setDeviceId: (deviceId: string) => void;
    getSessionId: () => number;
    setSessionId: (sessionId: number) => void;
    getUserId: () => string;
    setOptOut: (optOut: boolean) => void;
    isOptedOut: () => boolean;
    clearUserProperties: () => void;
    unsetUserProperties: (properties: string[]) => void;
    append: (property: string, value: string | number | boolean) => void;
    prepend: (property: string, value: string | number | boolean) => void;
    preInsert: (property: string, value: string | number | boolean) => void;
    postInsert: (property: string, value: string | number | boolean) => void;
    remove: (property: string, value: string | number | boolean) => void;
    setOnce: (property: string, value: string | number | boolean) => void;
    add: (property: string, value: number) => void;
    set: (property: string, value: string | number | boolean) => void;
    unset: (property: string) => void;
    prependOnce: (property: string, value: string | number | boolean) => void;
    appendOnce: (property: string, value: string | number | boolean) => void;
  };
}

// ============================================================================
// UNIFIED ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, string | number | boolean | null>;
  userId?: string;
  facilityId?: string;
  timestamp?: number;
  sessionId?: string;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  facilityId?: string;
  role?: string;
  department?: string;
  properties?: Record<string, string | number | boolean | null>;
}

export interface AnalyticsProvider {
  name: 'google_analytics' | 'mixpanel' | 'amplitude' | 'supabase';
  enabled: boolean;
  config:
    | GoogleAnalyticsConfig
    | MixpanelConfig
    | AmplitudeConfig
    | Record<string, unknown>;
}

export interface AnalyticsConfig {
  providers: {
    googleAnalytics?: GoogleAnalyticsConfig & { enabled: boolean };
    mixpanel?: MixpanelConfig & { enabled: boolean };
    amplitude?: AmplitudeConfig & { enabled: boolean };
    supabase?: { enabled: boolean };
  };
  defaultProvider: 'google_analytics' | 'mixpanel' | 'amplitude' | 'supabase';
  debug?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

// ============================================================================
// WINDOW INTERFACE EXTENSIONS
// ============================================================================

declare global {
  interface Window {
    gtag?: GoogleAnalytics['gtag'];
    mixpanel?: Mixpanel;
    amplitude?: Amplitude;
    dataLayer?: Array<{
      event: string;
      [key: string]: string | number | boolean | null | undefined;
    }>;
  }
}
