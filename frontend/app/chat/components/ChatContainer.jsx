import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {
    AddSharp, BlockSharp,
    CloseSharp, DeleteSharp,
    SendSharp,
    SettingsSharp,
} from "@mui/icons-material";
import Message from "@/app/chat/components/Message";
import MessageReply from "@/app/chat/components/MessageReply";
import {useDropzone} from "react-dropzone";
import ModalBase from "@/components/Modals/ModalBase";
import MediaGridUpload from "@/components/Media/MediaGridUpload";
import ManualDropdown from "@/components/Dropdown/ManualDropdown";
import {useRouter} from "next/navigation";
import useTranslation from "next-translate/useTranslation";

export function ChatHeader({session, blacklistUser, chatUser, room, removeRoom}) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const menuItems = []

    if (chatUser) {
        if (chatUser.blacklisted_by.includes(session.user.user_id)) {
            menuItems.push({chatUser: chatUser, IconComponent: BlockSharp, label: "Unblock", clickHandler: handleBlock})
        } else {
            menuItems.push({chatUser: chatUser, IconComponent: BlockSharp, label: "Block", clickHandler: handleBlock})
        }
        menuItems.push({roomId: room, IconComponent: DeleteSharp, label: "Delete", clickHandler: handleRemoveRoom})
    }


    async function handleBlock({chatUser}) {
        return await blacklistUser(chatUser.id)
    }

    async function handleRemoveRoom({roomId}) {
        return await removeRoom({roomId})
    }


    return (
        <div className="relative flex flex-row p-3 items-center bg-zinc-100 dark:bg-purple-200 justify-between rounded-t-xl">
            <div className="mx-auto">
                <p className="font-medium tracking-wide text-lg">
                    {chatUser && chatUser.username}
                </p>
            </div>
            <div className="text-pink-pastel">
                <div className="flex flex-row gap-3">
                    {chatUser ? (
                        <a onClick={() => router.push(`/${chatUser.id}`)} className="cursor-pointer">
                            <img src={chatUser.media[0]?.relative_path || null} width={40} height={40} className="rounded-full bg-pink-pastel" alt=""/>
                        </a>
                    ) : (
                        <div className="w-[40px] h-[40px] rounded-full bg-pink-pastel"/>
                    )}
                    <div onClick={() => setIsOpen((value) => !value)} className="cursor-pointer">
                        <SettingsSharp fontSize={"small"}/>
                    </div>
                    <ManualDropdown
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        menuItems={menuItems}
                        classes={'right-0 -bottom-full'}
                    />
                </div>
            </div>
        </div>
    )
}

export default function ChatContainer({session, room, removeRoom, blacklistUser, allRoomsData, setAllRoomsData, chatSocketRef, nextFetch}) {
    const { t } = useTranslation('chat')

    const chatUser = allRoomsData[room]?.members.find(member => member.id !== session.user.user_id) ?? null
    const messages = allRoomsData[room]?.messages ?? []
    const ChatContainerRef = useRef(null)
    const [isFetching, setIsFetching] = useState(false)

    const [messageText, setMessageText] = useState('')
    const [replyMessage, setReplyMessage] = useState('')
    const [modalFiles, setModalFiles] = useState([])
    const [caption, setCaption] = useState('')
    const [isReply, setIsReply] = useState(false)

    const [editingMessage, setEditingMessage] = useState('')
    const [isEdit, setIsEdit] = useState(false)

    async function create() {
        if (chatUser.blacklisted_by.includes(session.user.user_id)) return
        const chatSocket = chatSocketRef.current
        const errors = () => {
            let errors = false
            if (!messageText.trim() && !caption.trim() && !modalFiles.length > 0) {
                errors = true
            }
            return errors
        }

        if (errors()) {
            return
        }

        let fileObjects = []
        if (modalFiles.length > 0) {
            fileObjects = await Promise.all(modalFiles.map(processFile))

            function processFile(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const fileData = event.target.result.split(',')[1];
                        const fileObject = {
                            name: file.name,
                            data: fileData
                        };
                        resolve(fileObject);
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
        chatSocket.send(JSON.stringify({
            'message': messageText,
            'user': session.user.user_id,
            'reply': replyMessage.id,
            'media_files': fileObjects,
            'room': room,
        }))
        setMessageText('')
        setReplyMessage('')
        setModalFiles([])
        setIsReply(false)
    }

    async function edit() {
        const chatSocket = chatSocketRef.current
        chatSocket.send(JSON.stringify({
            'type': 'edit',
            'message': {
                id: editingMessage.id,
                content: editingMessage.content,
            },
            'room': room,
        }))
        setIsEdit(false)
        setEditingMessage('')
    }

    function handleSeen(messageId){
        const chatSocket = chatSocketRef.current
        chatSocket.send(JSON.stringify({
            'type': 'seen',
            'message': messageId,
            'room': room,
        }))
    }

    async function remove({messageData}) {
        const chatSocket = chatSocketRef.current
        chatSocket.send(JSON.stringify({
            'type': 'remove',
            'message': messageData.id,
            'room': room,
        }))
    }

    function handleReply({messageData}) {
        setIsReply(true)
        setReplyMessage(messageData)
    }

    function handleEdit({messageData}) {
        setIsEdit(true)
        setEditingMessage(messageData)
    }

    const [mediaModal, setMediaModal] = useState(false)
    const onDrop = useCallback((acceptedFiles, rejectedFiles, event) => {
        setMediaModal(true)
        acceptedFiles.forEach((file) => {
            setModalFiles((prevState) => [...prevState, file])
        })
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({noClick: true, onDrop})

    useEffect(() => {
        const handleScroll = () => {
            const ChatContainerDiv = ChatContainerRef.current
            if (!ChatContainerDiv) return

            const isUpperEndReached = ChatContainerDiv.scrollTop === 0;
            const hasOverflow = ChatContainerDiv.scrollHeight > ChatContainerDiv.clientHeight

            if (isUpperEndReached && hasOverflow && nextFetch.current && !isFetching) {
                const previousScrollPosition = ChatContainerDiv.scrollHeight - ChatContainerDiv.scrollTop;
                fetchMoreMessages(previousScrollPosition)
            }
        }

        async function fetchMoreMessages(previousScrollPosition) {
            if (isFetching || !nextFetch.current) return;
            setIsFetching(true)
            try {
                const response = await fetch(nextFetch.current, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${session.access}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setAllRoomsData((prevRoomMessages) => {
                        const updatedMessages = [
                            ...data.results.reverse(),
                            ...(prevRoomMessages[room]?.messages || []),
                        ]

                        const updatedRoom = {
                            ...prevRoomMessages[room],
                            messages: updatedMessages,
                        }

                        return {
                            ...prevRoomMessages,
                            [room]: updatedRoom,
                        }
                    })

                    setAllRoomsData((prevRoomNext) => {
                        const updatedRoom = {
                            ...prevRoomNext[room],
                            next: data.next
                        }
                        return {
                            ...prevRoomNext,
                            [room]: updatedRoom,
                        }
                    })
                    nextFetch.current = data.next
                    setIsFetching(false)

                    const ChatContainerDiv = ChatContainerRef.current
                    ChatContainerDiv.scrollTop = ChatContainerDiv.scrollHeight - previousScrollPosition
                } else {
                    console.error("Failed to load more messages")
                }
            } catch (error) {
                console.error("An error occurred while loading more messages:", error)
            }
        }

        if (ChatContainerRef.current) {
            ChatContainerRef.current.addEventListener('scroll', handleScroll)
        }

        return () => {
            if (ChatContainerRef.current) {
                ChatContainerRef.current.removeEventListener('scroll', handleScroll)
            }
        }
    }, [isFetching, nextFetch, room, session.access, setAllRoomsData])

    return (
        <>
            <ModalBase isOpen={mediaModal} setIsOpen={setMediaModal} label={`${modalFiles.length} ${t("files selected")}`}>
                <div className="mt-2 flex flex-col gap-3">
                    <MediaGridUpload files={modalFiles} setFiles={setModalFiles}/>
                    <textarea
                        cols={1}
                        rows={1}
                        className="textarea"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`${t("type caption here")}...`}
                    />
                </div>
                <div className="mt-4 flex flex-row gap-3 justify-between">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-pink-pastel focus:outline-none"
                        onClick={() => {setMediaModal(false); setModalFiles([])}}>
                        {t("cancel")}
                    </button>
                    <div className="flex flex-row gap-5">
                        <label htmlFor="file-input"
                               className="flex justify-center items-center bg-pink-pastel hover:bg-pink-pastel/90 transition-color duration-200 h-full rounded-xl text-slate-200 p-2 cursor-pointer">
                            <AddSharp fontSize={"medium"}/>
                        </label>
                        <div
                            className="flex justify-center items-center bg-pink-pastel hover:bg-pink-pastel/90 transition-color duration-200 h-full rounded-xl text-slate-200 p-2 cursor-pointer"
                            onClick={() => {create(); setMediaModal(false)}}>
                            <SendSharp/>
                        </div>
                    </div>
                </div>
            </ModalBase>

            <div {...getRootProps()} className={`relative w-full h-full flex flex-col justify-between shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel rounded-xl`}>
                {isDragActive && (
                    <div className="flex flex-col z-40 backdrop-blur-sm rounded-xl absolute inset-y-0 inset-x-0 gap-3 p-5 justify-content-center text-center border-[4px] border-pink-pastel border-dashed transition-all duration-200"/>
                )}
                <ChatHeader
                    session={session}
                    blacklistUser={blacklistUser}
                    chatUser={chatUser}
                    room={room}
                    removeRoom={removeRoom}
                />
                <div ref={ChatContainerRef} className="bg-zinc-200 dark:bg-purple-100 h-full overflow-y-auto px-3 py-3">
                    <TransitionGroup component={Fragment}>
                        {messages.length > 0 && (
                            messages.map((message) => (
                                <CSSTransition key={message.id} timeout={300} classNames="message">
                                    <Message
                                        messageData={message}
                                        session={session}
                                        handleSeen={handleSeen}
                                        handleReply={handleReply}
                                        handleEdit={handleEdit}
                                        remove={remove}
                                    />
                                </CSSTransition>
                            ))
                        )}
                    </TransitionGroup>
                </div>
                <div className="flex flex-col">
                    <MessageReply
                        isReply={isReply} setIsReply={setIsReply}
                        replyMessage={replyMessage}
                        setReplyMessage={setReplyMessage}
                    />
                    <div className="flex flex-row p-3 gap-3 bg-zinc-100 dark:bg-purple-200 rounded-b-xl items-center">
                        {isEdit ? (
                            <>
                                <div className="text-pink-pastel" onClick={() => {
                                    setIsEdit(false)
                                    setEditingMessage('')
                                }}>
                                    <CloseSharp fontSize={"large"}/>
                                </div>
                                <input
                                    type="text"
                                    className="w-full rounded-full border-0 p-2.5 ring-1 ring-inset ring-gray-300 bg-zinc-200 outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel text-gray-900 font-medium dark:bg-purple-100 dark:ring-pink-pastel dark:text-gray-400 placeholder:text-gray-400 placeholder:font-medium sm:text-sm sm:leading-6 transition-all duration-300"
                                    value={editingMessage.content}
                                    onChange={(e) => setEditingMessage(prevEditingMessage => ({
                                        ...prevEditingMessage,
                                        content: e.target.value
                                    }))}
                                    placeholder={`${t("type your message here")}...`}/>
                                <div className="text-pink-pastel" onClick={() => edit()}>
                                    <SendSharp fontSize={"large"}/>
                                </div>
                            </>
                        ) : (
                            <>
                                <label htmlFor="file-input"
                                       className="flex justify-center items-center bg-pink-pastel hover:bg-pink-pastel/90 transition-color duration-200 h-full rounded-xl text-slate-200 p-2 cursor-pointer">
                                    <AddSharp fontSize={"medium"}/>
                                    <input id="file-input" {...getInputProps()}/>
                                </label>
                                <input type="text"
                                       className="w-full rounded-full border-0 p-2.5 ring-1 ring-inset ring-gray-300 bg-zinc-200 outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel text-gray-900 font-medium dark:bg-purple-100 dark:ring-pink-pastel dark:text-gray-400 placeholder:text-gray-400 placeholder:font-medium sm:text-sm sm:leading-6 transition-all duration-300"
                                       value={messageText}
                                       onChange={(e) => setMessageText(e.target.value)}
                                       placeholder={room ? `${t("type your message here")}...`:`${t("choose a chat room")}!`}
                                       disabled={!room}
                                />
                                <input type="hidden" name="reply_id" id="replyId" defaultValue={replyMessage}/>
                                <div className="text-pink-pastel" onClick={() => create()}>
                                    <SendSharp fontSize={"large"}/>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>

    )
}