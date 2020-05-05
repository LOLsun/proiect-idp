import React from 'react';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import BlockTypes from './BlockTypes';

const textToBlock = text => {
    if (text.startsWith('[] ')) {
        // it's a To-Do block

        // remove the trailing '[] ' and strip spaces
        text = text.slice('[] '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.TODO,
            attrs: {
                content: text,
                done: false
            }
        }
    }

    if (text.startsWith('/page ')) {
        // it's a page block
        //
        // remove the trailing '/page ' and strip spaces
        text = text.slice('/page '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.PAGE,
            attrs: {
                content: text,
            }
        }
    }

    return {
        id: 'bepis',
        type: BlockTypes.PARAGRAPH,
        attrs: {
            content: text
        }
    }
}

function NewBlock ({ onDone, onCancel, className }) {
    const [ content, setContent ] = useState("")

    return (
        <div className={`new-block ${className && className}`}>
            <TextareaAutosize
                placeholder="Type Something!"
                value={content}
                autoFocus
                onChange={ev => {setContent(ev.target.value)}}
                onBlur={() => {
                    if (content.length === 0) {
                        onCancel()
                    } else {
                        onDone(textToBlock(content))
                        setContent("")
                    }
                }}
                onKeyDown={ev => {
                    if (ev.key === 'Escape') {
                        ev.preventDefault()
                        setContent("")
                        onCancel()
                    }
                    if (ev.key === 'Enter') {
                        ev.preventDefault()
                        if (content.length !== 0)
                            onDone(textToBlock(content))
                        else
                            onCancel()
                        setContent("")
                    }
                }}
                className="block-edit-textarea"
            />
        </div>
    )
}

export default NewBlock;
