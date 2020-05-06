import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockNumbered({block, updateAttrs, block_idx}) {
    return (
        <div
            className="block-numbered"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div className="numbered-block-number">
                <p>
                    {block_idx}.
                </p>
            </div>

            <div className="numbered-block-content" >
                <EditableMarkdownContent
                    text={block.attrs.content}
                    onTextChange={newText => {
                        updateAttrs({content: newText}, false)
                    }}
                    isEditing={block.editing}
                    setEditing={() => {
                        updateAttrs({}, true)
                    }}
                />
            </div>
        </div>
    )
}

export default BlockNumbered;
