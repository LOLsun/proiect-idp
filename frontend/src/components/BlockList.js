import React from 'react';
import Block from './Block';


const indent_size = 35


function BlockList({ blocks, updateBlock, indent=false }) {
    return (
        <div
            className='block-list'
            style={{marginLeft: `${indent ? indent_size : 0}px`}}
        >
            {blocks.map((block, idx) =>
                <Block
                    key={block.id}
                    block={block}
                    updateBlock={(idxPath, new_attrs, editing) => {
                                    updateBlock([idx, ...idxPath], new_attrs, editing)
                                }}
                />
            )}
        </div>
    );
}

export default BlockList;
