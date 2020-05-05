import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent';


function BlockParagraph({ block, updateAttrs }) {
    return (
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
    )
}

export default BlockParagraph;
