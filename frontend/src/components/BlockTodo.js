import React from 'react';
import { FaRegSquare, FaRegCheckSquare } from 'react-icons/fa'
import EditableMarkdownContent from './EditableMarkdownContent'


function BlockTodo({block, updateAttrs}) {
    return (
        <div
            className="block-todo"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%"
            }}
        >
            <div
                className="block-todo-check"
                onClick={ev => {
                    updateAttrs({done: !block.attrs.done})
                }}
            >
                {block.attrs.done ? <FaRegCheckSquare size="20px"/> : <FaRegSquare size="20px"/>}
            </div>

            <div
                className={`todo-block-content ${block.attrs.done && "todo-block-content-done"}`}
            >
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

export default BlockTodo;
