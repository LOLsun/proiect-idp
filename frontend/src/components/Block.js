import React from 'react';
import BlockTodo from './BlockTodo';
import BlockParagraph from './BlockParagraph';
import BlockList from './BlockList'

const blocktype_to_component = [null, BlockParagraph, BlockTodo];

function Block({ block, updateBlock }) {
    return (
        <div className="block">
            {blocktype_to_component[block.type]({
                block,
                updateAttrs: (new_attrs, editing) => {updateBlock([], new_attrs, editing)},
            })}

            {block.children !== undefined &&
                <BlockList
                    blocks={block.children}
                    indent
                    updateBlock={updateBlock}
                />
            }
        </div>
    )
}

export default Block;
