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

/**
 * Calculates the next BI test due date based on office hours settings
 * @param lastTestDate - The date of the last BI test
 * @returns The adjusted due date that falls within office hours
 */
export const calculateNextBIDue = (lastTestDate: Date | null): Date | null => {
  if (!lastTestDate) {
    return null;
  }

  // Load office hours settings from localStorage
  const savedSettings = localStorage.getItem('officeHoursSettings');
  if (!savedSettings) {
    // If no settings, use default (M-F 8-5)
    return calculateNextBIDueWithSettings(lastTestDate, {
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
    });
  }

  const settings: OfficeHoursSettings = JSON.parse(savedSettings);
  return calculateNextBIDueWithSettings(lastTestDate, settings);
};

/**
 * Helper function to calculate next BI due with specific settings
 */
const calculateNextBIDueWithSettings = (
  lastTestDate: Date,
  settings: OfficeHoursSettings
): Date => {
  // Start with 24 hours after the last test
  const rawDueDate = new Date(lastTestDate);
  rawDueDate.setHours(rawDueDate.getHours() + 24);

  // Adjust the date to fall within office hours
  return adjustToOfficeHours(rawDueDate, settings);
};

/**
 * Adjusts a date to fall within office hours
 */
const adjustToOfficeHours = (
  date: Date,
  settings: OfficeHoursSettings
): Date => {
  const adjustedDate = new Date(date);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = adjustedDate.getDay();
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

  // Check if current day is a working day
  const isWorkingDay =
    settings.workingDays[currentDay as keyof typeof settings.workingDays];

  if (!isWorkingDay) {
    // Find the next working day
    let daysToAdd = 1;
    while (daysToAdd <= 7) {
      const nextDay = new Date(adjustedDate);
      nextDay.setDate(nextDay.getDate() + daysToAdd);
      const nextDayOfWeek = nextDay.getDay();
      const nextDayName = dayNames[nextDayOfWeek];

      if (
        settings.workingDays[nextDayName as keyof typeof settings.workingDays]
      ) {
        adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
        adjustedDate.setHours(settings.startHour, 0, 0, 0);
        return adjustedDate;
      }
      daysToAdd++;
    }
  }

  // If it's a working day, adjust the time to be within office hours
  const currentHour = adjustedDate.getHours();

  if (currentHour < settings.startHour) {
    // Before office hours, set to start of day
    adjustedDate.setHours(settings.startHour, 0, 0, 0);
  } else if (currentHour >= settings.endHour) {
    // After office hours, move to next working day
    let daysToAdd = 1;
    while (daysToAdd <= 7) {
      const nextDay = new Date(adjustedDate);
      nextDay.setDate(nextDay.getDate() + daysToAdd);
      const nextDayOfWeek = nextDay.getDay();
      const nextDayName = dayNames[nextDayOfWeek];

      if (
        settings.workingDays[nextDayName as keyof typeof settings.workingDays]
      ) {
        adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
        adjustedDate.setHours(settings.startHour, 0, 0, 0);
        return adjustedDate;
      }
      daysToAdd++;
    }
  }

  return adjustedDate;
};

/**
 * Formats a date for display in the BI card
 */
export const formatBIDueDate = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};
