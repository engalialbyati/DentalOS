import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export const formatDate = (d, fmt = 'MMM D, YYYY') => (d ? dayjs(d).format(fmt) : '—');
export const formatTime = (d) => (d ? dayjs(d).format('h:mm A') : '—');
export const formatDateTime = (d) => (d ? dayjs(d).format('MMM D, YYYY h:mm A') : '—');
export const fromNow = (d) => (d ? dayjs(d).fromNow() : '—');
export const isPast = (d) => (d ? dayjs(d).isBefore(dayjs(), 'day') : false);

export const formatCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0));

export const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');

export { dayjs };
