import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockHeader1({block, updateAttrs }) {
    return (
        <div
            className="block-divider"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div className="divider-block-content" >
                <hr />
            </div>
        </div>
    )
}

export default BlockHeader1;
