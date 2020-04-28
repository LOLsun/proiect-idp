import React from 'react';
import { useState } from 'react'
import data from './MockData'
import BlockList from './components/BlockList'
import './App.css'

function App() {
    const [ blocks, setBlocks ] = useState(data);

    const generateNewBlocks = (idxPath, blocks_list, new_attrs, editing) => {
        const [head, ...tail] = idxPath
        return [
            ...blocks_list.slice(0, head),
            tail.length === 0 ?
            {
                ...blocks_list[head],
                attrs: {
                    ...blocks_list[head].attrs,
                    ...new_attrs
                },
                editing: editing !== undefined ? editing : blocks_list[head].editing,
            }
            :
            {
                ...blocks_list[head],
                children: generateNewBlocks(tail, blocks_list[head].children, new_attrs, editing)
            },
            ...blocks_list.slice(head+1)
        ]
    }

    const updateBlock = (idxPath, new_attrs, editing) => {
        setBlocks(generateNewBlocks(idxPath, blocks, new_attrs, editing));
    }

    return (
        <div className="App">
            <div className="main-container">
                <BlockList
                    blocks={blocks}
                    updateBlock={updateBlock}
                />
            </div>
        </div>
    );
}

export default App;
