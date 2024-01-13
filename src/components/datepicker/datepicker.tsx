import { DayPicker } from 'react-day-picker';
import { zhCN } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import React from 'react';

interface DatePickerProps {
    selected: Date;
    setSelected: (day: Date | undefined) => void;
}

export const DatePickerComponent = React.forwardRef<HTMLDivElement, DatePickerProps>(
    ({ selected, setSelected }, ref) => {
        return (
            <DayPicker
                // ref={ref} // 将 ref 转发到 DayPicker
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
);

DatePickerComponent.displayName = 'DatePickerComponent'; // 为了调试目的设置 display name
