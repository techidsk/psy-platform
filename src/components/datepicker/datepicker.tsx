import { DayPicker } from 'react-day-picker';
import { zhCN } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
    selected: Date;
    setSelected: (day: Date | undefined) => void;
}

export function DatePickerComponent({ selected, setSelected }: DatePickerProps) {
    return (
        <DayPicker
            captionLayout="dropdown-buttons"
            fromYear={2024}
            toYear={2034}
            locale={zhCN}
            mode="single"
            selected={selected}
            onSelect={setSelected}
        />
    );
}
