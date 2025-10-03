import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { FacilityService } from '../../../services/facilityService';
import OfficeClosuresManager from './OfficeClosuresManager';

interface OfficeHoursSettings {
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  openHolidays: boolean;
  startHour: number;
  endHour: number;
}

const OfficeHoursSettings: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from database or use defaults
  const [settings, setSettings] = useState<OfficeHoursSettings>(() => {
    // Default to M-F 8-5, closed holidays
    return {
      workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      openHolidays: false,
      startHour: 8,
      endHour: 17,
    };
  });

  // Load facility ID and settings from database on component mount
  useEffect(() => {
    const loadFacilityId = async () => {
      try {
        const id = await FacilityService.getCurrentFacilityId();
        setFacilityId(id);
      } catch (error) {
        console.error('Failed to load facility ID:', error);
      }
    };

    loadFacilityId();
  }, []);

  const loadSettingsFromDatabase = useCallback(async () => {
    if (!facilityId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facility_office_hours')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading office hours:', error);
        return;
      }

      if (data) {
        setSettings({
          workingDays: data.working_days as {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
          },
          startHour: data.start_hour as number,
          endHour: data.end_hour as number,
          openHolidays: data.open_holidays as boolean,
        });
      }
    } catch (error) {
      console.error('Error loading office hours:', error);
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    if (facilityId) {
      loadSettingsFromDatabase();
    }
  }, [facilityId, loadSettingsFromDatabase]);

  const saveSettingsToDatabase = async (newSettings: OfficeHoursSettings) => {
    if (!facilityId) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('facility_office_hours').upsert({
        facility_id: facilityId,
        working_days: newSettings.workingDays,
        start_hour: newSettings.startHour,
        end_hour: newSettings.endHour,
        open_holidays: newSettings.openHolidays,
      });

      if (error) {
        console.error('Error saving office hours:', error);
        return;
      }

      // Also save to localStorage as backup
      localStorage.setItem('officeHoursSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving office hours:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day: keyof OfficeHoursSettings['workingDays']) => {
    const newSettings = {
      ...settings,
      workingDays: {
        ...settings.workingDays,
        [day]: !settings.workingDays[day],
      },
    };
    setSettings(newSettings);
    saveSettingsToDatabase(newSettings);
  };

  const handleHolidayToggle = () => {
    const newSettings = {
      ...settings,
      openHolidays: !settings.openHolidays,
    };
    setSettings(newSettings);
    saveSettingsToDatabase(newSettings);
  };

  const handleTimeChange = (type: 'start' | 'end', value: number) => {
    const newSettings = {
      ...settings,
      [type === 'start' ? 'startHour' : 'endHour']: value,
    };
    setSettings(newSettings);
    saveSettingsToDatabase(newSettings);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getWorkingDaysText = () => {
    const days = Object.entries(settings.workingDays)
      .filter(([, isWorking]) => isWorking)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

    if (days.length === 0) return 'No days selected';
    if (days.length === 7) return 'Every day';
    if (
      days.length === 5 &&
      !settings.workingDays.saturday &&
      !settings.workingDays.sunday
    ) {
      return 'Monday - Friday';
    }
    return days.join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h5 className="text-md font-medium text-gray-700 mb-2">
          Office Hours & Scheduling
        </h5>
        <p className="text-xs text-gray-500 mb-4">
          These settings affect BI test scheduling, analytics calculations, and
          streak tracking
        </p>
        {saving && (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
            Saving changes...
          </div>
        )}
      </div>

      {/* Working Days */}
      <div className="space-y-3">
        <div className="block text-sm font-medium text-gray-700">
          Office Days
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(settings.workingDays).map(([day, isWorking]) => (
            <button
              key={day}
              onClick={() =>
                handleDayToggle(day as keyof OfficeHoursSettings['workingDays'])
              }
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isWorking
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Selected: {getWorkingDaysText()}
        </p>
      </div>

      {/* Hours of Operation */}
      <div className="space-y-3">
        <div className="block text-sm font-medium text-gray-700">
          Hours of Operation
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <div className="block text-xs text-gray-500 mb-1">Start Time</div>
            <select
              value={settings.startHour}
              onChange={(e) =>
                handleTimeChange('start', parseInt(e.target.value))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
          <span className="text-gray-500 mt-6">to</span>
          <div>
            <div className="block text-xs text-gray-500 mb-1">End Time</div>
            <select
              value={settings.endHour}
              onChange={(e) =>
                handleTimeChange('end', parseInt(e.target.value))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Operating hours: {formatHour(settings.startHour)} -{' '}
          {formatHour(settings.endHour)}
        </p>
      </div>

      {/* Holiday Settings */}
      <div className="space-y-3">
        <div className="block text-sm font-medium text-gray-700">
          Holiday Operations
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleHolidayToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              settings.openHolidays ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.openHolidays ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">
            {settings.openHolidays ? 'Open on holidays' : 'Closed on holidays'}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {settings.openHolidays
            ? 'BI tests and operations will continue on holidays'
            : 'BI tests due on holidays will be rescheduled to the next business day'}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h6 className="text-sm font-medium text-blue-800 mb-2">
          Current Schedule Summary
        </h6>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Working days: {getWorkingDaysText()}</p>
          <p>
            • Hours: {formatHour(settings.startHour)} -{' '}
            {formatHour(settings.endHour)}
          </p>
          <p>• Holidays: {settings.openHolidays ? 'Open' : 'Closed'}</p>
        </div>
      </div>

      {/* Office Closures Manager */}
      <OfficeClosuresManager />
    </div>
  );
};

export default OfficeHoursSettings;
