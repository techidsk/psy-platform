"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Icons } from "../icons";

interface FormValues {
    value: string
    label: string
}

interface SearchProps {
    name: string
    type: string
    placeholder?: string
    values?: FormValues[]
}


const SearchForm = ({ searchDatas, onInputChange, defaultParams }: {
    searchDatas: SearchProps[],
    onInputChange: Function
    defaultParams: { [key: string]: string }
}) => {
    const renderField = (field: SearchProps) => {
        switch (field.type) {
            case 'input':
                return (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        value={defaultParams[field.name] || ''} // 设置默认值
                        className="input input-bordered w-full max-w-xs"
                        onChange={(e) => onInputChange(field.name, e.target.value)}
                    />
                );
            case 'select':
                if (field.values) {
                    return (
                        <select
                            className="select select-bordered w-full max-w-xs"
                            value={defaultParams[field.name] || ''} // 设置默认值
                            onChange={(e) => onInputChange(field.name, e.target.value)}
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
            default:
                return null;
        }
    };

    return (
        <div className="grid gap-4 grid-cols-4">
            {searchDatas.map(field => (
                <div key={field.name}>
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
};


export function UserTableSearch({ defaultParams }: {
    defaultParams: { [key: string]: string }
}) {
    const router = useRouter()
    const [searchParams, setSearchParams] = useState(defaultParams);

    const handleInputChange = (name: string, value: string) => {
        setSearchParams(prevParams => ({ ...prevParams, [name]: value }));
    };

    const resetSearch = () => {
        setSearchParams({});
        search(true)
    };

    const search = (reset: boolean = false) => {
        let oldSearchParams = new URLSearchParams(window.location.search);
        let hasChanged = false

        if (reset) {
            let newSearchParams = new URLSearchParams()
            newSearchParams.set('page', (oldSearchParams.get('page') || 1).toString())
            newSearchParams.set('pagesize', (oldSearchParams.get('pagesize') || 15).toString())
            const newUrl = `./users?${newSearchParams.toString()}`;
            router.push(newUrl)
        } else {
            Object.entries(searchParams).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    oldSearchParams.set(key, value.toString())
                    hasChanged = true
                }
            })

            if (hasChanged) {
                // 构造新的URL，保留现有的查询参数
                const newUrl = `./users?${oldSearchParams.toString()}`;
                router.push(newUrl)
            }
        }
    }

    return (
        <div>
            <SearchForm searchDatas={searchDatas} onInputChange={handleInputChange} defaultParams={defaultParams} />
            <div className="flex justify-end gap-4">
                <button className="btn btn-outline btn-sm" onClick={resetSearch}>重置搜索</button>
                <button className="btn btn-primary btn-sm" onClick={() => search(false)}><Icons.search />搜索</button>
            </div>
        </div>
    )
}

const searchDatas = [
    { name: 'username', type: 'input', placeholder: '请输入用户名' },
    { name: 'email', type: 'input', placeholder: '请输入电子邮件' },
    { name: 'tel', type: 'input', placeholder: '请输入联系电话' },
    { name: 'qualtrics', type: 'input', placeholder: '请输入Qualtrics账号' },
    { name: 'group_name', type: 'input', placeholder: '请输入用户组' },
    {
        name: 'role',
        type: 'select',
        placeholder: '请输入用户角色',
        values: [
            { value: '', label: '' },
            { value: 'ADMIN', label: '管理员' },
            { value: 'ASSISTANT', label: '助教' },
            { value: 'USER', label: '测试者' },
        ]
    },
]