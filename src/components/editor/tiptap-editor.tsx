'use client';
import './styles.css';

import { useEditor, EditorContent, BubbleMenu, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
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
    const handleUpdate = debounce((editor) => {
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
    }, []);

    useEffect(() => {
        return () => handleUpdate.cancel();
    }, []);

    return (
        <div className="tiptap">
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}
                    >
                        bold
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}
                    >
                        italic
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}
                    >
                        strike
                    </button>
                </BubbleMenu>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}
