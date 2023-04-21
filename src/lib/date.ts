import dayjs from 'dayjs';

export function dateFormat(date: Date) {
    return dayjs(date).format('YYYY年MM月DD日 HH:mm:ss');
}

export function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}分${seconds.toString().padStart(2, '0')}秒`;
}