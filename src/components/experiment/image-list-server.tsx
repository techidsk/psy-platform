


interface ImageListServerProps extends React.HTMLAttributes<HTMLDivElement> {

}

export function ImageListServer({ children }: ImageListServerProps) {
    return <div className='flex justify-between w-full items-center'>
        {children}
    </div>
}