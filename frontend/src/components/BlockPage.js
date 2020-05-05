import React from 'react';
import EditableMarkdownContent from './EditableMarkdownContent';
import { FaRegFileAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom';

function BlockPage({block, updateAttrs}) {
    return (
        <div
            className="block-page"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <Link to={`/page/${block.attrs.page_id}`}>
                <FaRegFileAlt size="20px"/>
            </Link>
            <div className="page-block-content" >
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

export default BlockPage;
