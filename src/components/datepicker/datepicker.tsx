import React from 'react';
import { DayPicker } from 'react-day-picker';
import { zhCN } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
    selected: Date;
    setSelected: (day: Date | undefined) => void;
}

export const DatePickerComponent = React.forwardRef<HTMLDivElement, DatePickerProps>(
    ({ selected, setSelected }, ref) => {
        return (
            <DayPicker
                // ref={ref} // 将 ref 转发到 DayPicker
                captionLayout="dropdown"
                startMonth={new Date(2024, 0)}
                endMonth={new Date(2034, 12)}
                locale={zhCN}
                mode="single"
                selected={selected}
                onSelect={setSelected}
            />
        );
    }
);

DatePickerComponent.displayName = 'DatePickerComponent'; // 为了调试目的设置 display name
