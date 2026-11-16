const specialistAppointment = {
  name: 'Dr Shirley Bang',
  date: '2026-11-20',
  time: '10:00 AM',
} as const;

export const appointmentTestData = {
  specialist: specialistAppointment,
  screening: {
    packageName: 'Urology Wellness Screening (Men)',
    specialist: 'Dr Ronny Tan',
    date: '2026-11-21',
    time: '09:00 AM',
  },
  reschedule: {
    specialist: specialistAppointment.name,
    originalDate: specialistAppointment.date,
    originalTime: specialistAppointment.time,
    newDate: '2026-11-24',
    newTime: '09:00 AM',
  },
} as const;
