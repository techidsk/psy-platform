'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DatePickerComponent } from '../datepicker/datepicker';

interface FormValues {
    value: any;
    label: string;
}

interface SearchProps {
    name: string;
    type: string;
    placeholder?: string;
    values?: FormValues[];
    defaultValue?: any;
}

export function TableSearch({
    defaultParams = {},
    searchDatas,
    actionNode,
}: {
    defaultParams: { [key: string]: string };
    searchDatas: SearchProps[];
    actionNode?: React.ReactNode;
}) {
    const router = useRouter();
    const initialValues = {
        ...defaultParams,
        ...Object.fromEntries(
            searchDatas
                .filter((field) => field.defaultValue !== undefined)
                .map((field) => [field.name, field.defaultValue])
        ),
    };

    const [searchParams, setSearchParams] = useState(initialValues);
    const [formValues, setFormValues] = useState(initialValues);
    // 弹出日期选择器
    const [showDatePicker, setShowDatePicker] = useState(false);
    // 对应名称的日期选择器

    // 当输入改变时，更新对应字段的状态
    const handleChange = (fieldName: string, value: any) => {
        setFormValues((prevValues) => ({ ...prevValues, [fieldName]: value }));
        handleInputChange(fieldName, value); // 保留对外部函数的调用
    };

    // 重置表单值到默认值
    const resetForm = () => {
        setFormValues(initialValues);
    };

    const renderField = (field: SearchProps) => {
        switch (field.type) {
            case 'input':
                return (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        value={formValues[field.name] || ''} // 设置默认值
                        className="input w-full max-w-xs"
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
            case 'select':
                if (field.values) {
                    return (
                        <select
                            className="select w-full max-w-xs"
                            value={formValues[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                            {field.values.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    );
                } else {
                    return null;
                }
            case 'date':
                return (
                    <>
                        <input
                            type="text"
                            className="input w-full max-w-xs"
                            placeholder={field.placeholder}
                            value={formValues[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn m-1 btn-sm">
                                选择日期
                            </div>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm w-[320px]"
                            >
                                <DatePickerComponent
                                    selected={
                                        formValues[field.name]
                                            ? new Date(formValues[field.name])
                                            : new Date()
                                    }
                                    setSelected={(day: Date | undefined) =>
                                        handleChange(
                                            field.name,
                                            day ? format(day, 'PP', { locale: zhCN }) : ''
                                        )
                                    }
                                />
                            </ul>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const handleInputChange = (name: string, value: string) => {
        setSearchParams((prevParams) => ({ ...prevParams, [name]: value }));
    };

    const resetSearch = () => {
        setSearchParams({});
        search(true);
        resetForm();
    };

    const search = (reset: boolean = false) => {
        let oldSearchParams = new URLSearchParams(window.location.search);
        const pathname = window.location.pathname;

        // 如果是通过搜索按钮触发的，重置页码为1
        if (!reset && oldSearchParams.has('page')) {
            oldSearchParams.set('page', '1');
        }

        if (reset) {
            let emptySearchParams = new URLSearchParams();
            emptySearchParams.set('page', '1');
            emptySearchParams.set('pagesize', '10');
            const newUrl = `${pathname}?${emptySearchParams.toString()}`;
            router.push(newUrl);
        } else {
            let hasChanged = false;

            Object.entries(searchParams).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    oldSearchParams.set(key, value.toString());
                    hasChanged = true;
                }
            });

            if (hasChanged) {
                const newUrl = `${pathname}?${oldSearchParams.toString()}`;
                router.push(newUrl);
            }
        }
    };

    return (
        <div className="grid gap-2">
            <div className="grid gap-4 grid-cols-4">
                {searchDatas.map((field) => (
                    <div key={field.name}>{renderField(field)}</div>
                ))}
            </div>
            <div className="flex justify-between">
                <div>{actionNode}</div>
                <div className="flex justify-end gap-4">
                    <button className="btn btn-outline btn-sm" onClick={resetSearch}>
                        重置搜索
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => search(false)}>
                        <Icons.search />
                        搜索
                    </button>
                </div>
            </div>
        </div>
    );
}
