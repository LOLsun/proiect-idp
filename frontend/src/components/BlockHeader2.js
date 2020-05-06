import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockHeader2({block, updateAttrs }) {
    return (
        <div
            className="block-header2"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div className="header2-block-content" >
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

export default BlockHeader2;
