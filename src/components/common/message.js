import { useState, useRef, useEffect } from 'react';
import * as Toast from '@radix-ui/react-toast';
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
        <Toast.Provider swipeDirection="right">
            <Toast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
                <Toast.Title className="ToastTitle">{title}</Toast.Title>
                <Toast.Description asChild>
                    <div className="ToastDescription">
                        {msg}
                    </div>
                </Toast.Description>
                {/* <Toast.Action className="ToastAction" asChild altText="Goto schedule to undo">
                    <button className="Button small green">Undo</button>
                </Toast.Action> */}
            </Toast.Root>
            <Toast.Viewport className="ToastViewport" />
        </Toast.Provider>
    );



};

export default Message;