import { useState, useRef, useEffect } from 'react';
import './styles.css';

const Message = ({
    title = '',
    msg = '',
    initOpen = false
}) => {
    const [open, setOpen] = useState(initOpen);

    useEffect(() => {
        setTimeout(() => {
            setOpen(false);
        }, 5000);
    }, [open]);

    return (
        <div className={!open && "none"} style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: 900, minWidth: 560 }}>
            <div className='px-4 py-8 mx-auto'>
                <div className="alert alert-error shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{msg}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;