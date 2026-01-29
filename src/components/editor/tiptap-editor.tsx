'use client';
import './styles.css';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import debounce from 'lodash.debounce';

interface TiptapEditorProps {
    placeholder: string;
    content: string; // HTML内容
    onChange?: (html: string) => void;
    editable?: boolean;
}

export default function TiptapEditor({
    placeholder,
    content,
    onChange,
    editable = false,
}: TiptapEditorProps) {
    const handleUpdate = debounce((editor: { getHTML: () => string }) => {
        if (onChange) {
            onChange(editor.getHTML());
        }
    }, 300); // 300毫秒的延迟，您可以根据需要调整这个值

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder,
                showOnlyWhenEditable: false,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-hidden h-[360px]',
            },
        },
        content: content,
        onUpdate({ editor }) {
            handleUpdate(editor);
        },
    });

    useEffect(() => {
        if (editable) {
            editor && editor.setEditable(editable);
        }
    }, [editable, editor]);

    useEffect(() => {
        return () => handleUpdate.cancel();
    }, [handleUpdate]);

    return (
        <div className="tiptap">
            <EditorContent editor={editor} />
        </div>
    );
}
