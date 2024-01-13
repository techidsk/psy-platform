'use client';
import React, { ChangeEventHandler, useRef, useState } from 'react';

import { zhCN } from 'date-fns/locale';
import { format, isValid, parse } from 'date-fns';
import FocusTrap from 'focus-trap-react';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
import { usePopper } from 'react-popper';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
    selected: Date;
    setSelected: (day: Date | undefined) => void;
}

export default function DatePickerDialog({ selected, setSelected }: DatePickerProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [isPopperOpen, setIsPopperOpen] = useState(false);

    const popperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

    const popper = usePopper(popperRef.current, popperElement, {
        placement: 'bottom-start',
    });

    const closePopper = () => {
        setIsPopperOpen(false);
        buttonRef?.current?.focus();
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setInputValue(e.currentTarget.value);
        const date = parse(e.currentTarget.value, 'y-MM-dd', new Date());
        if (isValid(date)) {
            setSelected(date);
        } else {
            setSelected(undefined);
        }
    };

    const handleButtonClick = () => {
        setIsPopperOpen(true);
    };

    const handleDaySelect: SelectSingleEventHandler = (date) => {
        setSelected(date);
        if (date) {
            setInputValue(format(date, 'y-MM-dd'));
            closePopper();
        } else {
            setInputValue('');
        }
    };

    return (
        <div>
            <div ref={popperRef}>
                <input
                    size={12}
                    type="text"
                    placeholder={format(new Date(), 'y-MM-dd')}
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button
                    ref={buttonRef}
                    type="button"
                    aria-label="Pick a date"
                    onClick={handleButtonClick}
                >
                    Pick a date
                </button>
            </div>
            {isPopperOpen && (
                <FocusTrap
                    active
                    focusTrapOptions={{
                        initialFocus: false,
                        allowOutsideClick: true,
                        clickOutsideDeactivates: true,
                        onDeactivate: closePopper,
                        fallbackFocus: buttonRef.current || undefined,
                    }}
                >
                    <div
                        tabIndex={-1}
                        style={popper.styles.popper}
                        className="dialog-sheet"
                        {...popper.attributes.popper}
                        ref={setPopperElement}
                        role="dialog"
                        aria-label="DayPicker calendar"
                    >
                        <DayPicker
                            captionLayout="dropdown-buttons"
                            fromYear={2024}
                            toYear={2034}
                            locale={zhCN}
                            mode="single"
                            selected={selected}
                            onSelect={handleDaySelect}
                        />
                    </div>
                </FocusTrap>
            )}
        </div>
    );
}
