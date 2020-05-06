import React from 'react';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import BlockTypes from './BlockTypes';

const textToBlock = text => {
    if (text.startsWith('[] ')) {
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
        text = text.slice('/page '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.PAGE,
            attrs: {
                content: text,
            }
        }
    }

    if (text.startsWith('- ')) {
        text = text.slice('- '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.BULLET,
            attrs: {
                content: text,
            }
        }
    }

    if (text.match(/^[1-9][0-9]*\. .+$/)) {
        text = text.replace(/^[1-9][0-9]*\.\s*/, '')
        return {
            type: BlockTypes.NUMBERED,
            attrs: {
                content: text
            }
        }
    }

    if (text.startsWith('# ')) {
        text = text.slice('# '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.HEADER1,
            attrs: {
                content: text,
            }
        }
    }

    if (text.startsWith('## ')) {
        text = text.slice('## '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.HEADER2,
            attrs: {
                content: text,
            }
        }
    }

    if (text.startsWith('### ')) {
        text = text.slice('### '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.HEADER3,
            attrs: {
                content: text,
            }
        }
    }

    if (text.replace(/^\s+|\s+$/g, '') === '---') {
        return {
            type: BlockTypes.DIVIDER,
            attrs: {
                content: text,
            }
        }
    }

    if (text.startsWith('/math ')) {
        text = text.slice('/math '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.MATH,
            attrs: {
                content: text,
            }
        }
    }

    if (text.startsWith('/url ')) {
        text = text.slice('/url '.length).replace(/^\s+|\s+$/g, '');
        return {
            type: BlockTypes.URL,
            attrs: {
                content: text,
            }
        }
    }

    return {
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
