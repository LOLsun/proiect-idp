import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ReactTinyLink } from 'react-tiny-link';
import { FaLink } from 'react-icons/fa';


function BlockUrl({block, updateAttrs }) {
    const [ newContent, setNewContent ] = useState(block.attrs.content)

    let renderUrlCard = true;
    try {
        const _ = new URL(block.attrs.content)
    } catch (err) {
        renderUrlCard = false
    }

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
            <div className="url-block-content" >
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
                    <div>
                        <div
                            onDoubleClick={ev => { updateAttrs({}, true) }}
                            className="url-block-to-edit"
                        >
                            <p><FaLink size="16px"/> Double-click here to edit the URL</p>
                        </div>
                        {renderUrlCard ?
                            <ReactTinyLink
                                cardSize="large"
                                showGraphic={true}
                                maxLine={2}
                                minLine={1}
                                onError={() => {}}
                                url={block.attrs.content}
                            />
                            :
                            <div className="url-block-error">
                                <p>"{block.attrs.content}" is not a valid URL</p>
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default BlockUrl;
