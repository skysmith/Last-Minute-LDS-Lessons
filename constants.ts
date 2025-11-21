import { Audience } from './types';

export const AUDIENCE_OPTIONS = [
  {
    value: Audience.PRIMARY,
    label: 'Primary',
    description: 'Simple concepts, stories, and engaging visuals for children.',
    icon: '🎨',
  },
  {
    value: Audience.YOUTH,
    label: 'Youth',
    description: 'Relevant applications and doctrinal discussions for teenagers.',
    icon: '🏀',
  },
  {
    value: Audience.GOSPEL_DOCTRINE,
    label: 'Gospel Doctrine',
    description: 'Deep scriptural analysis and history for adults.',
    icon: '📖',
  },
  {
    value: Audience.GOSPEL_ESSENTIALS,
    label: 'Gospel Essentials',
    description: 'Foundational principles and clarity for new members.',
    icon: '🌱',
  },
];

export const getUpcomingSundays = (count: number = 4): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  const currentDay = today.getDay();
  // Calculate days until next Sunday (0 is Sunday)
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);

  for (let i = 0; i < count; i++) {
    const d = new Date(nextSunday);
    d.setDate(nextSunday.getDate() + (i * 7));
    dates.push(d);
  }
  return dates;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};