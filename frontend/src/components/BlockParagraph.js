import React from 'react';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';


function BlockParagraph({ block, updateAttrs }) {
    const [ newContent, setNewContent ] = useState(block.attrs.content)

    return (
        <div>
            {block.editing === true ?
                <TextareaAutosize
                    value={newContent}
                    autoFocus
                    onChange={ev => {setNewContent(ev.target.value)}}
                    onBlur={ev => {updateAttrs({content: newContent}, false)}}
                    onKeyUp={ev => {
                        if (ev.key === 'Escape' || ev.key === 'Enter') {
                            updateAttrs({content: newContent}, false);
                        }
                    }}
                    className="block-edit-textarea"
                    style={{
                        width: "100%",
                        border: "none"
                    }}
                />
                :
                <p onDoubleClick={ev => {
                    updateAttrs({}, block.editing === true ? false : true);
                }} >
                    {block.attrs.content}
                </p>
            }
        </div>
    )
}

export default BlockParagraph;
