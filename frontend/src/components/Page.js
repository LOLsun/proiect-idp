import React from 'react';
import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import BlockList from './BlockList';
import NewBlock from './NewBlock';
import EditableMarkdownContent from './EditableMarkdownContent';
import { DndProvider } from 'react-dnd';
import { FaLevelUpAlt } from 'react-icons/fa'
import Backend from 'react-dnd-html5-backend';
import Loader from 'react-loader-spinner';
import axios from 'axios';

const baseUrl = 'http://192.168.100.23:5000/'

function Page({ page, location, match }) {
    const [ blocks, setBlocks ] = useState(null);
    const [ redirect, setRedirect ] = useState({should: false, to: '/login'})
    const [ pageDetails, setPageDetails ] = useState(null)
    const [ isEditingTitle, setIsEditingTitle ] = useState(false)

    useEffect(() => {
        const get_default_page = () => {
            const url = `${baseUrl}/defaultpage`
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            })
                .then(response => {
                    setRedirect({should: true, to: `/page/${response.data.id}`})
                })
                .catch(err => {
                    setRedirect({should: true, to: `/login`})
                    console.log(err.response)
                })
        }

        if (page === undefined) {
            get_default_page()
        } else {
            setRedirect({should: true, to: `/page/${match.params.page}`})
        }
    }, [match.params.page, page])

    useEffect(() => {
        const loadPage = () => {
            const pageUrl = `${baseUrl}/pages/${page}`
            axios.get(pageUrl, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            })
                .then(response => {
                    setPageDetails(response.data)
                })
                .catch(error => {
                    if (error.response.status === 401)
                        setRedirect({should: true, to: `/login`})
                    else
                        console.log(error)
                })

            const blocksUrl = `${baseUrl}/pages/${page}/blocks`;
            axios.get(blocksUrl, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            })
                .then(response => {
                    setBlocks(response.data)
                    setRedirect({...redirect, should: false})
                })
                .catch(error => {
                    if (error.response.status === 401)
                        setRedirect({should: true, to: `/login`})
                    else
                        console.log(error)
                })
        }

        if (page !== undefined) {
            loadPage()
        }
    }, [page])

    const getBlock = (idxPath, blocksList) => {
        const [head, ...tail] = idxPath

        if (tail.length === 0)
            return blocksList[head]

        return getBlock(tail, blocksList[head].children)
    }

    const updateBlockHelper = (idxPath, blocks_list, new_attrs, editing) => {
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
                children: updateBlockHelper(tail, blocks_list[head].children, new_attrs, editing)
            },
            ...blocks_list.slice(head+1)
        ]
    }

    const updateBlock = (idxPath, new_attrs, editing) => {
        if (Object.keys(new_attrs).length === 0) {
            setBlocks(updateBlockHelper(idxPath, blocks, new_attrs, editing));
        } else {
            const block_id = getBlock(idxPath, blocks).id

            axios.put(
                `${baseUrl}/blocks/${block_id}`,
                { attrs: new_attrs },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                    }
                }
            )
                .then(() => {
                    setBlocks(updateBlockHelper(idxPath, blocks, new_attrs, editing));
                })
                .catch(err => {
                    if (err.response.status === 401)
                        setRedirect({should: true, to: `/login`})
                    else
                        console.log(err.response)
                })
        }
    }

    const addBlockHelper = (idxPath, blocksList, block) => {
        const [head, ...tail] = idxPath
        return [
            ...blocksList.slice(0, tail.length === 0 ? head+1 : head),
            tail.length === 0 ?
            {
                ...block
            }
            :
            {
                ...blocksList[head],
                children: addBlockHelper(tail, blocksList[head].children, block)
            },
            ...blocksList.slice(head+1)
        ]
    }

    const addBlockAfter = (idxPath, block) => {
        const add_after_id = getBlock(idxPath, blocks).id;
        const post_data = {
            block: {
                block_type: block.type,
                attrs: block.attrs
            },
            add_after: add_after_id
        }

        axios.post(
            `${baseUrl}/pages/${page}/blocks`,
            post_data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(response => {
                setBlocks(addBlockHelper(idxPath, blocks, response.data))
            })
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })
    }

    const addBlockAtEnd = block => {
        const post_data = {
            block: {
                block_type: block.type,
                attrs: block.attrs
            },
        }

        axios.post(
            `${baseUrl}/pages/${page}/blocks`,
            post_data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(response => {
                setBlocks([...blocks, response.data])
            })
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })
    }

    const deleteBlockHelper = (idxPath, blocks_list) => {
        const [head, ...tail] = idxPath

        if (tail.length === 0) {
            return [...blocks_list.slice(0, head), ...blocks_list.slice(head+1)]
        } else {
            return [
                ...blocks_list.slice(0, head),
                {
                    ...blocks_list[head],
                    children: deleteBlockHelper(tail, blocks_list[head].children)
                },
                ...blocks_list.slice(head+1)
            ]
        }
    }

    const deleteBlock = (idxPath) => {
        const block_id = getBlock(idxPath, blocks).id
        
        axios.delete(
            `${baseUrl}/blocks/${block_id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(() => {setBlocks(deleteBlockHelper(idxPath, blocks))})

    }

    const markBlockForDeletion = (idxPath, blocksList) => {
        const [head, ...tail] = idxPath;

        return [
            ...blocksList.slice(0, head),
            tail.length === 0 ?
            {
                ...blocksList[head],
                __marked_for_deletion: true
            }
            :
            {
                ...blocksList[head],
                children: markBlockForDeletion(tail, blocksList[head].children)
            },
            ...blocksList.slice(head+1)
        ]
    }

    const deleteMarkedBlocks = (blocksList) => {
        if (blocksList === undefined)
            return undefined

        return blocksList
            .filter(b => b.__marked_for_deletion !== true)
            .map(b => ({
                ...b,
                children: deleteMarkedBlocks(b.children)
            }))
                  
    }

    const moveBlockAfter = (from, to) => {
        const from_block = getBlock(from, blocks)
        const to_block = getBlock(to, blocks)

        axios.put(
            `${baseUrl}/move/${from_block.id}/after/${to_block.id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(() => {
                let newBlocks = markBlockForDeletion(from, blocks)
                newBlocks = addBlockHelper(to, newBlocks, from_block)
                newBlocks = deleteMarkedBlocks(newBlocks)

                setBlocks(newBlocks)
            })
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })

    }

    const addBlockAsChildHelper = (idxPath, blocksList, block) => {
        const [head, ...tail] = idxPath
        return [
            ...blocksList.slice(0, head),
            tail.length === 0 ?
            {
                ...blocksList[head],
                children: blocksList[head].children === undefined ? [block] : [block, ...(blocksList[head].children)]
            }
            :
            {
                ...blocksList[head],
                children: addBlockAsChildHelper(tail, blocksList[head].children, block)
            },
            ...blocksList.slice(head+1)
        ]
    }

    const moveBlockAsChild = (from, to) => {
        const from_block = getBlock(from, blocks)
        const to_block = getBlock(to, blocks)

        axios.put(
            `${baseUrl}/move/${from_block.id}/as_child/${to_block.id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(() => {
                let newBlocks = markBlockForDeletion(from, blocks)
                newBlocks = addBlockAsChildHelper(to, newBlocks, from_block)
                newBlocks = deleteMarkedBlocks(newBlocks)

                setBlocks(newBlocks)
            })
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })
    }

    const deleteChildrenHelper = (idxPath, blocksList) => {
        const [head, ...tail] = idxPath
        return [
            ...blocksList.slice(0, head),
            tail.length === 0 ?
            {
                ...blocksList[head],
                children: undefined
            }
            :
            {
                ...blocksList[head],
                children: deleteChildrenHelper(tail, blocksList[head].children)
            },
            ...blocksList.slice(head+1)
        ]
    }

    const deleteChildren = idxPath => {
        const block = getBlock(idxPath, blocks)

        axios.delete(
            `${baseUrl}/blocks/${block.id}/children`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(() => {setBlocks(deleteChildrenHelper(idxPath, blocks))})
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })
    }

    const onDone = block => {
        addBlockAtEnd(block)
    }

    const onCancel = () => {}

    const changePageTitle = new_title => {
        axios.put(
            `${baseUrl}/pages/${page}/title`,
            { title: new_title },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            }
        )
            .then(() => {
                setPageDetails({...pageDetails, title: new_title})
            })
            .catch(err => {
                if (err.response.status === 401)
                    setRedirect({should: true, to: `/login`})
                else
                    console.log(err.response)
            })
    }

    return (
        <div className="page">
            {redirect.should ?
                <Redirect push={redirect.to !== location.pathname} to={redirect.to} />
                :
                <>
                    {pageDetails !== null &&
                    <div className="page-header">
                        {pageDetails.parent !== null &&
                        <FaLevelUpAlt
                            onClick={() => {
                                console.log(pageDetails)
                                setRedirect({should: true, to: `/page/${pageDetails.parent}`})
                            }}
                            style={{
                                fontSize: "30px",
                                marginRight: "20px",
                                cursor: "pointer",
                            }}
                        />
                        }
                        <EditableMarkdownContent 
                            text={pageDetails.title}
                            onTextChange={text => {
                                changePageTitle(text)
                                setIsEditingTitle(false)
                            }}
                            isEditing={isEditingTitle}
                            setEditing={() => {
                                setIsEditingTitle(true)
                            }}
                            className="page-header-content"
                        />
                    </div>
                    }

                    {blocks === null ?
                        <div className="center">
                            <Loader type="Bars" color="#00BFFF" height={80} width={80} />
                        </div>
                        :
                        <>
                            <DndProvider backend={Backend}>
                                <BlockList
                                    blocks={blocks}
                                    updateBlock={updateBlock}
                                    addBlockAfter={addBlockAfter}
                                    deleteBlock={deleteBlock}
                                    moveBlockAfter={moveBlockAfter}
                                    moveBlockAsChild={moveBlockAsChild}
                                    deleteChildren={deleteChildren}
                                    idxPath={[]}
                                />
                            </DndProvider>
                        </>
                    }
                    <NewBlock onDone={onDone} onCancel={onCancel} className="page-new-block"/>
                </>
            }
        </div>
    );
}

export default Page;
