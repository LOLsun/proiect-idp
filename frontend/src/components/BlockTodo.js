import React from 'react';
import { FaRegSquare, FaRegCheckSquare } from 'react-icons/fa'


function BlockTodo({block, updateAttrs}) {
    return (
        <div
            className="block-todo"
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center"
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

            <p style={{
                textDecoration: block.attrs.done && "line-through",
                paddingLeft: "16px"
               }}
            >
                {block.attrs.content}
            </p>
        </div>
    )
}

export default BlockTodo;
