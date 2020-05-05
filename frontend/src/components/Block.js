import React from 'react';
import { useState, useRef } from 'react';
import BlockTodo from './BlockTodo';
import BlockParagraph from './BlockParagraph';
import BlockPage from './BlockPage';
import BlockList from './BlockList';
import { FaPlus, FaGripVertical } from 'react-icons/fa';
import NewBlock from './NewBlock';
import { useDrag, useDrop } from 'react-dnd';

const blocktype_to_component = [null, BlockParagraph, BlockTodo, BlockPage];

function Block({ block, updateBlock, addBlockAfter, deleteBlock, idxPath, moveBlockAfter, moveBlockAsChild, deleteChildren }) {
    const hasChildren = block.children !== undefined && block.children.length !== 0
    const [ isHovered, setIsHovered ] = useState(false);
    const [ isMenuVisible, setIsMenuVisible ] = useState(false);
    const [ isAddingNewBlock, setIsAddingNewBlock ] = useState(false)
    const myRef = useRef()

    const [{ isOver, canDrop }, mainDropRef] = useDrop({
        accept: "block",
        drop: (item, monitor) => {
            if (monitor.didDrop())
                return

            const dropX = monitor.getClientOffset().x
            const blockX = myRef.current.getBoundingClientRect().x
            const children = (blockX + 100) < dropX

            if (children)
                moveBlockAsChild(item.idxPath, idxPath)
            else
                moveBlockAfter(item.idxPath, idxPath)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDrop: !!monitor.canDrop(),
        }),
        canDrop: item => {
            for (let i = 0; i < item.idxPath.length; i++) 
                if (idxPath[i] !== item.idxPath[i])
                    return true
            return false
        }
    })

    const [, dragRef, previewRef] = useDrag({
        item: { 
            type: "block",
            id: block.id,
            idxPath: idxPath
        },
    })

    const onDone = block => {
        addBlockAfter([], block)
        setIsAddingNewBlock(false)
    }

    const onCancel = () => {
        setIsAddingNewBlock(false)
    }

    return (
        <div className="block" ref={previewRef} >
            <div
                ref={el => {
                    myRef.current = el
                    mainDropRef(el)
                }}
                className="block-drop"
            >
                <div
                    className="block-controls-content"
                    onMouseEnter={ev => {
                        setIsHovered(true)
                    }}
                    onMouseLeave={ev => {
                        setIsHovered(false)
                        setIsMenuVisible(false)
                    }}
                >
                    <div className={`block-controls ${isHovered && "block-controls-hovered"}`}>
                        <div>
                            <FaPlus
                                className="block-control-plus"
                                size="18px"
                                onClick={ev => {setIsAddingNewBlock(true)}}
                            />
                        </div>

                        <div
                            ref={dragRef}
                            className="block-menu"
                            onClick={ev => {
                                setIsMenuVisible(!isMenuVisible)
                            }}
                        >
                            <FaGripVertical
                                className="block-control-grip"
                                size="18px"
                            />

                            <div className={`overlay ${isMenuVisible || "menu-content-hidden"}`} />

                            <div className={`menu-content ${isMenuVisible || "menu-content-hidden"}`}>
                                <div
                                    className="menu-item"
                                    onClick={ev => {
                                        deleteBlock([]) 
                                    }}
                                >
                                    delete
                                </div>
                                <div 
                                    className="menu-item"
                                    onClick={ev => {
                                        addBlockAfter([], {attrs: block.attrs, type: block.type, id: "conk"})
                                    }}
                                >
                                    duplicate
                                </div>
                                <div
                                    className="menu-item"
                                    onClick={ev => {
                                        deleteChildren(idxPath)
                                    }}
                                >
                                    delete children
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block-content">
                        {blocktype_to_component[block.type]({
                            block,
                            updateAttrs: (new_attrs, editing) => {updateBlock([], new_attrs, editing)},
                        })}
                    </div>
                </div>
            </div>

            <div className="block-children">
                {block.children !== undefined &&
                <BlockList
                    blocks={block.children}
                    indent
                    updateBlock={updateBlock}
                    addBlockAfter={addBlockAfter}
                    deleteBlock={deleteBlock}
                    idxPath={idxPath}
                    moveBlockAfter={moveBlockAfter}
                    moveBlockAsChild={moveBlockAsChild}
                    deleteChildren={deleteChildren}
                />
                }
            </div>

            {isAddingNewBlock && <NewBlock onDone={onDone} onCancel={onCancel}/>}

            <div
                className="drop-indicator"
                style={{
                    marginTop: hasChildren && "-5px",
                    opacity: (isOver && canDrop) ? "1" : "0"
                }}
            >
                <div/>
                <div/>
            </div>
        </div>
    )
}

export default Block;
