import { supabase } from '../lib/supabase';

export interface OfficeHoursConfig {
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  startHour: number;
  endHour: number;
  openHolidays: boolean;
}

/**
 * Check if a date should be excluded from streak calculations
 * @param date - The date to check
 * @param facilityId - The facility ID
 * @returns Promise<boolean> - true if the date should be excluded
 */
export async function shouldExcludeDateFromStreak(
  date: Date,
  facilityId: string
): Promise<boolean> {
  try {
    // Check if it's a weekend (if weekends are not working days)
    const dayOfWeek = date.getDay();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = dayNames[dayOfWeek];

    // Get facility office hours
    const { data: officeHours, error: officeHoursError } = await supabase
      .from('facility_office_hours')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (officeHoursError || !officeHours) {
      // Fallback to default: exclude weekends
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }

    const config: OfficeHoursConfig = {
      workingDays: officeHours.working_days as OfficeHoursConfig['workingDays'],
      startHour: officeHours.start_hour as number,
      endHour: officeHours.end_hour as number,
      openHolidays: officeHours.open_holidays as boolean,
    };

    // Check if current day is a working day
    const isWorkingDay =
      config.workingDays[currentDay as keyof typeof config.workingDays];
    if (!isWorkingDay) {
      return true; // Exclude non-working days
    }

    // Check if it's a holiday (unless facility is open on holidays)
    if (!config.openHolidays) {
      const { data: closure, error: closureError } = await supabase
        .from('office_closures')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('closure_date', date.toISOString().split('T')[0])
        .eq('closure_type', 'holiday')
        .single();

      if (!closureError && closure) {
        return true; // Exclude holidays
      }
    }

    // Check if it's a custom closure (maintenance, etc.)
    const { data: customClosure, error: customClosureError } = await supabase
      .from('office_closures')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('closure_date', date.toISOString().split('T')[0])
      .in('closure_type', ['custom', 'maintenance'])
      .single();

    if (!customClosureError && customClosure) {
      return true; // Exclude custom closures
    }

    return false; // Date should be included in streak
  } catch (error) {
    console.error('Error checking streak exclusion:', error);
    // Fallback: exclude weekends only
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
}

/**
 * Get the next working day after a given date
 * @param date - The starting date
 * @param facilityId - The facility ID
 * @returns Promise<Date> - The next working day
 */
export async function getNextWorkingDay(
  date: Date,
  facilityId: string
): Promise<Date> {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Keep looking until we find a working day
  while (await shouldExcludeDateFromStreak(nextDay, facilityId)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Check if a date is within business hours
 * @param date - The date to check
 * @param facilityId - The facility ID
 * @returns Promise<boolean> - true if within business hours
 */
export async function isWithinBusinessHours(
  date: Date,
  facilityId: string
): Promise<boolean> {
  try {
    const { data: officeHours, error } = await supabase
      .from('facility_office_hours')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (error || !officeHours) {
      return false;
    }

    const hour = date.getHours();
    return (
      hour >= (officeHours.start_hour as number) &&
      hour < (officeHours.end_hour as number)
    );
  } catch (error) {
    console.error('Error checking business hours:', error);
    return false;
  }
}
