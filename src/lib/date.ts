import dayjs from 'dayjs';

export function dateFormat(date: Date) {
    return dayjs(date).format('YYYY年MM月DD日 HH:mm:ss');
}