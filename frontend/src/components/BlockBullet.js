import React from 'react';
import { FaCircle } from 'react-icons/fa'
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockBullet({block, updateAttrs}) {
    return (
        <div
            className="block-bullet"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <FaCircle
                size="12px"
                style={{
                    marginTop: "4px",
                    marginLeft: "5px",
                    marginRight: "4px"
                }}
            />

            <div className="bullet-block-content" >
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

export default BlockBullet;
