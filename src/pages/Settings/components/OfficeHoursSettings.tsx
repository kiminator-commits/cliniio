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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-6">
        <h5 className="text-xl font-semibold text-gray-800 mb-2">
          Office Hours & Scheduling
        </h5>
        <p className="text-sm text-gray-600">
          These settings affect BI test scheduling, analytics calculations, and streak tracking
        </p>
        {saving && (
          <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            💾 Saving changes...
          </div>
        )}
      </div>

      {/* Working Days */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-[#4ECDC4] bg-opacity-10 rounded-lg">
            <svg className="w-5 h-5 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h6 className="text-lg font-semibold text-gray-800">
            📅 Working Days
          </h6>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-4">
          {Object.entries(settings.workingDays).map(([day, isWorking]) => (
            <button
              key={day}
              onClick={() =>
                handleDayToggle(day as keyof OfficeHoursSettings['workingDays'])
              }
              className={`p-4 text-center rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                isWorking
                  ? 'bg-[#4ECDC4] text-white shadow-lg shadow-[#4ECDC4]/25'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <div className="text-sm font-bold">
                {day.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs opacity-75">
                {day.slice(0, 3)}
              </div>
            </button>
          ))}
        </div>
        
        <div className="bg-[#4ECDC4] bg-opacity-10 rounded-lg p-4">
          <p className="text-sm text-[#4ECDC4] font-medium">
            ✅ Selected: {getWorkingDaysText()}
          </p>
        </div>
      </div>

      {/* Hours of Operation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-[#4ECDC4] bg-opacity-10 rounded-lg">
            <svg className="w-5 h-5 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h6 className="text-lg font-semibold text-gray-800">
            ⏰ Hours of Operation
          </h6>
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-3">Start Time</div>
            <select
              value={settings.startHour}
              onChange={(e) =>
                handleTimeChange('start', parseInt(e.target.value))
              }
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] text-lg font-semibold bg-white shadow-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl text-[#4ECDC4] font-bold">→</div>
            <div className="text-xs text-gray-500 mt-1">to</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-3">End Time</div>
            <select
              value={settings.endHour}
              onChange={(e) =>
                handleTimeChange('end', parseInt(e.target.value))
              }
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] text-lg font-semibold bg-white shadow-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Holiday Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-[#4ECDC4] bg-opacity-10 rounded-lg">
            <svg className="w-5 h-5 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h6 className="text-lg font-semibold text-gray-800">
            🎉 Holiday Operations
          </h6>
        </div>
        
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {settings.openHolidays ? '🎊' : '🏠'}
            </div>
            <div>
              <h6 className="text-lg font-semibold text-gray-800">
                {settings.openHolidays ? 'Open on holidays' : 'Closed on holidays'}
              </h6>
              <p className="text-sm text-gray-600">
                {settings.openHolidays
                  ? 'BI tests and operations will continue on holidays'
                  : 'BI tests due on holidays will be rescheduled to the next business day'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleHolidayToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/20 ${
              settings.openHolidays ? 'bg-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/25' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                settings.openHolidays ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h6 className="text-lg font-semibold text-blue-800">
            📋 Current Schedule Summary
          </h6>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Working Days</div>
            <div className="text-lg font-semibold text-gray-800">{getWorkingDaysText()}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Hours</div>
            <div className="text-lg font-semibold text-gray-800">
              {formatHour(settings.startHour)} - {formatHour(settings.endHour)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Holidays</div>
            <div className="text-lg font-semibold text-gray-800">
              {settings.openHolidays ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      </div>

      {/* Office Closures Manager */}
      <OfficeClosuresManager />
    </div>
  );
};

export default OfficeHoursSettings;
