import React from 'react';
import Block from './Block';


const indent_size = 35


function BlockList({ blocks, updateBlock, indent=false, addBlockAfter, deleteBlock, idxPath, moveBlockAfter, moveBlockAsChild, deleteChildren }) {
    let last_block_type = 0;
    let block_idx = 1;

    return (
        <div
            className='block-list'
            style={{marginLeft: `${indent ? indent_size : 0}px`}}
        >
            {blocks.map((block, idx) => {
                if (block.type !== last_block_type) {
                    last_block_type = block.type
                    block_idx = 1
                } else {
                    block_idx++
                }

                return <Block
                    key={block.id}
                    block={block}
                    updateBlock={(idxPath, new_attrs, editing) => {
                        updateBlock([idx, ...idxPath], new_attrs, editing)
                    }}
                    addBlockAfter={(idxPath, block) => {addBlockAfter([idx, ...idxPath], block)}}
                    deleteBlock={idxPath => {deleteBlock([idx, ...idxPath])}}
                    moveBlockAfter={moveBlockAfter}
                    moveBlockAsChild={moveBlockAsChild}
                    deleteChildren={deleteChildren}
                    idxPath={[...idxPath, idx]}
                    block_idx={block_idx}
                />
            })}
        </div>
    );
}

export default BlockList;
