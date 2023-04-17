import { ReactNode } from 'react'

interface ExperimentConfirmProps extends React.HTMLAttributes<HTMLDivElement> {
    header: ReactNode
}

export function ExperimentConfirm({
    header,
    children
}: ExperimentConfirmProps) {


    return <div className='flex flex-col gap-8 justify-center items-center'>
        {header}
        <div className='flex justify-center items-center gap-8'>
            {children}
        </div>
    </div>
}