import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockHeader3({block, updateAttrs }) {
    return (
        <div
            className="block-header3"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div className="header3-block-content" >
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

export default BlockHeader3;
