'use client'
import { useState } from 'react'
import { PlayIcon, TrashIcon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'


export default function UserButtonGroup() {


    return <div className='flex gap-4 items-center '>
        <PlayIcon height={24} width={24} onClick={() => setCount(count + 1)} />
        <TrashIcon height={24} width={24} onClick={() => setCount(count - 1)} />
        <PaperPlaneIcon height={20} width={20} />
    </div>
}