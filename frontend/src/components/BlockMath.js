import React, { useState } from 'react';
import EditableMarkdownContent from './EditableMarkdownContent'
import TextareaAutosize from 'react-textarea-autosize';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';


function BlockMath({block, updateAttrs }) {
    console.log(block)
    const [ newContent, setNewContent ] = useState(block.attrs.content)

    return (
        <div
            className="block-math"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div className="math-block-content" >
                {block.editing ?
                    <TextareaAutosize
                        value={newContent}
                        autoFocus
                        onChange={ev => { setNewContent(ev.target.value) }}
                        onBlur={ev => { updateAttrs({ content: ev.target.value }, false) }}
                        onKeyDown={ev => {
                            if (ev.key === 'Escape' || ev.key === 'Enter') {
                                ev.preventDefault()
                                updateAttrs({ content: ev.target.value }, false)
                            }
                        }}
                        className="block-edit-textarea"
                    />
                    :
                    <div onDoubleClick={ev => { updateAttrs({}, true) }}>
                        <TeX math={block.attrs.content} />
                    </div>
                }
            </div>
        </div>
    )
}

export default BlockMath;
