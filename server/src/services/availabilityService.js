import mongoose from 'mongoose';
import { Doctor, Availability, Appointment } from '../models/index.js';

/**
 * Convert time string "HH:mm" (24-hour) to minutes since midnight
 */
export const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Convert minutes since midnight to 24-hour string "HH:mm"
 */
export const minutesToTimeString = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Convert minutes since midnight to 12-hour format string, e.g. "09:00 AM"
 */
export const minutesTo12HourString = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm} ${ampm}`;
};

/**
 * Normalize a Date or date string to local/UTC midnight YYYY-MM-DD
 */
export const normalizeDateString = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Compare two dates ignoring time
 */
export const isSameCalendarDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calculate dynamic slots for a doctor on a specific date
 */
export const getDoctorAvailableSlots = async ({ doctorId, date, mode }) => {
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    const error = new Error('Invalid doctor ID format');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch Doctor
  const doctor = await Doctor.findById(doctorId)
    .populate('user', 'fullName email phone')
    .populate('hospital', 'name address city phone');

  if (!doctor) {
    const error = new Error('Doctor not found');
    error.statusCode = 404;
    throw error;
  }

  if (doctor.verificationStatus !== 'approved') {
    const error = new Error('Doctor is not verified/approved for appointments');
    error.statusCode = 400;
    throw error;
  }

  if (doctor.isAvailable === false) {
    return {
      success: true,
      doctorId: doctor._id,
      date,
      isAvailable: false,
      reason: 'Doctor is currently marked as unavailable for appointments',
      slots: [],
      availableCount: 0,
      totalCount: 0,
    };
  }

  // 2. Validate Consultation Mode if requested
  if (mode && doctor.consultationModes && doctor.consultationModes.length > 0) {
    if (!doctor.consultationModes.includes(mode)) {
      return {
        success: true,
        doctorId: doctor._id,
        date,
        isAvailable: false,
        reason: `Doctor does not support "${mode}" consultations. Supported: ${doctor.consultationModes.join(', ')}`,
        slots: [],
        availableCount: 0,
        totalCount: 0,
      };
    }
  }

  // 3. Parse and Validate Date
  if (!date) {
    const error = new Error('Date is required (YYYY-MM-DD)');
    error.statusCode = 400;
    throw error;
  }

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    const error = new Error('Invalid date format. Please use YYYY-MM-DD');
    error.statusCode = 400;
    throw error;
  }

  // Prevent past dates (allow today)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const targetDayStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0,
    0,
    0,
    0
  );

  if (targetDayStart < todayStart) {
    return {
      success: true,
      doctorId: doctor._id,
      date: normalizeDateString(targetDate),
      isAvailable: false,
      reason: 'Cannot book appointments for past dates',
      slots: [],
      availableCount: 0,
      totalCount: 0,
    };
  }

  // 4. Fetch Doctor Availability Document
  let availability = await Availability.findOne({ doctor: doctor._id });
  if (!availability) {
    // Default fallback schedule if doctor hasn't configured specific custom hours
    availability = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: { start: '09:00', end: '17:00' },
      breakTime: { start: '13:00', end: '14:00' },
      slotDurationMinutes: 30,
      leaveDates: [],
      holidays: [],
    };
  }

  // 5. Check Working Days
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[targetDate.getDay()];

  if (!availability.workingDays || !availability.workingDays.includes(dayOfWeek)) {
    return {
      success: true,
      doctorId: doctor._id,
      date: normalizeDateString(targetDate),
      dayOfWeek,
      isAvailable: false,
      reason: `Doctor does not consult on ${dayOfWeek}s`,
      slots: [],
      availableCount: 0,
      totalCount: 0,
    };
  }

  // 6. Check Leaves & Holidays
  if (availability.leaveDates && availability.leaveDates.length > 0) {
    const isOnLeave = availability.leaveDates.some((leaveDate) =>
      isSameCalendarDay(leaveDate, targetDate)
    );
    if (isOnLeave) {
      return {
        success: true,
        doctorId: doctor._id,
        date: normalizeDateString(targetDate),
        dayOfWeek,
        isAvailable: false,
        reason: 'Doctor is scheduled on leave on this date',
        slots: [],
        availableCount: 0,
        totalCount: 0,
      };
    }
  }

  if (availability.holidays && availability.holidays.length > 0) {
    const isHoliday = availability.holidays.some((holiday) =>
      isSameCalendarDay(holiday, targetDate)
    );
    if (isHoliday) {
      return {
        success: true,
        doctorId: doctor._id,
        date: normalizeDateString(targetDate),
        dayOfWeek,
        isAvailable: false,
        reason: 'Clinic / Hospital is closed for a scheduled holiday on this date',
        slots: [],
        availableCount: 0,
        totalCount: 0,
      };
    }
  }

  // 7. Generate Time Intervals
  const startMin = timeStringToMinutes(availability.workingHours?.start || '09:00');
  const endMin = timeStringToMinutes(availability.workingHours?.end || '17:00');
  const breakStart = timeStringToMinutes(availability.breakTime?.start || '13:00');
  const breakEnd = timeStringToMinutes(availability.breakTime?.end || '14:00');
  const duration = Number(availability.slotDurationMinutes) || 30;

  // 8. Query Existing Booked Appointments for this Doctor on target date
  const dayRangeStart = new Date(targetDate);
  dayRangeStart.setHours(0, 0, 0, 0);
  const dayRangeEnd = new Date(targetDate);
  dayRangeEnd.setHours(23, 59, 59, 999);

  const existingBookings = await Appointment.find({
    doctor: doctor._id,
    date: { $gte: dayRangeStart, $lte: dayRangeEnd },
    status: { $in: ['confirmed', 'pending'] },
  }).select('timeSlot startTime endTime status bookingId');

  const bookedSlotsMap = new Set();
  existingBookings.forEach((apt) => {
    if (apt.timeSlot) bookedSlotsMap.add(apt.timeSlot.trim());
    if (apt.startTime) bookedSlotsMap.add(apt.startTime.trim());
  });

  const isToday = targetDayStart.getTime() === todayStart.getTime();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  const slots = [];

  for (let m = startMin; m + duration <= endMin; m += duration) {
    // Check if slot falls inside break time interval
    const slotEnd = m + duration;
    const overlapsBreak = !(slotEnd <= breakStart || m >= breakEnd);
    if (overlapsBreak) {
      continue;
    }

    const startTime24 = minutesToTimeString(m);
    const endTime24 = minutesToTimeString(slotEnd);
    const timeSlotLabel = minutesTo12HourString(m);
    const timeSlotInterval = `${minutesTo12HourString(m)} - ${minutesTo12HourString(slotEnd)}`;

    // Check if slot has already passed today (add 15 min buffer)
    const isPast = isToday && m <= currentMinutesFromMidnight + 15;

    // Check if booked
    const isBooked =
      bookedSlotsMap.has(timeSlotLabel) ||
      bookedSlotsMap.has(startTime24) ||
      bookedSlotsMap.has(timeSlotInterval);

    const isSlotAvailable = !isPast && !isBooked;

    // Determine period: Morning (before 12), Afternoon (12 to 17), Evening (17+)
    let period = 'morning';
    if (m >= 12 * 60 && m < 17 * 60) {
      period = 'afternoon';
    } else if (m >= 17 * 60) {
      period = 'evening';
    }

    slots.push({
      timeSlot: timeSlotLabel,
      interval: timeSlotInterval,
      startTime: startTime24,
      endTime: endTime24,
      period,
      isAvailable: isSlotAvailable,
      booked: isBooked,
      isPast,
    });
  }

  const availableSlots = slots.filter((s) => s.isAvailable);

  return {
    success: true,
    doctorId: doctor._id,
    doctorName: doctor.user?.fullName || doctor.name,
    hospital: doctor.hospital,
    consultationFee: doctor.consultationFee,
    consultationModes: doctor.consultationModes || ['In-person', 'Online'],
    date: normalizeDateString(targetDate),
    dayOfWeek,
    slotDurationMinutes: duration,
    isAvailable: availableSlots.length > 0,
    slots,
    availableCount: availableSlots.length,
    totalCount: slots.length,
  };
};
