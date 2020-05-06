import React from 'react';
import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import MarkdownContent from './MarkdownContent';


function EditableMarkdownContent({ text, onTextChange, isEditing, setEditing, style, className }) {
    const [ newContent, setNewContent ] = useState(text)

    useEffect(() => {
        setNewContent(text)
    }, [text])

    return (
        <div style={style}>
            {isEditing === true ?
                <TextareaAutosize
                    value={newContent}
                    autoFocus
                    onChange={ev => { setNewContent(ev.target.value) }}
                    onBlur={ev => { onTextChange(ev.target.value) }}
                    onKeyDown={ev => {
                        if (ev.key === 'Escape' || ev.key === 'Enter') {
                            ev.preventDefault()
                            onTextChange(ev.target.value)
                        }
                    }}
                    className="block-edit-textarea"
                />
                :
                <div onDoubleClick={ev => { setEditing() }} >
                    <MarkdownContent
                        text={text}
                        className={className}
                    />
                </div>
            }
        </div>
    )
}

export default EditableMarkdownContent;
