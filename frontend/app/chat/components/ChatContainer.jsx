import {useCallback, useEffect, useState} from "react";
import {
    AddSharp, BlockSharp,
    CloseSharp, DeleteSharp,
    SendSharp,
    SettingsSharp,
} from "@mui/icons-material";
import {MessagesList} from "@/app/chat/components/Message";
import MessageReply from "@/app/chat/components/MessageReply";
import {useDropzone} from "react-dropzone";
import ModalBase from "@/components/Modals/ModalBase";
import MediaGridUpload from "@/components/Media/MediaGridUpload";
import useTranslation from "next-translate/useTranslation";
import ChatHeader from "@/app/chat/components/ChatHeader";

const ChatContainer = ({ session, room, ChatContainerRef, removeRoom, blacklistUser, allRoomsData, setAllRoomsData, chatSocketRef, nextFetch }) => {
    const { t } = useTranslation('chat')
    const chatUser = allRoomsData[room]?.members.find(member => member.id !== session.user.user_id) ?? null
    const messages = allRoomsData[room]?.messages ?? []
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
        if (room) {
            setMediaModal(true)
            acceptedFiles.forEach((file) => {
                setModalFiles((prevState) => [...prevState, file])
            })
        }
    }, [room])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({noClick: true, onDrop})

    async function handleCodeKeyDown(e) {
        if (e.key === 'Enter') {
            await create()
        }
    }

    useEffect(() => {
        const ChatContainerDiv = ChatContainerRef.current
        ChatContainerDiv.scrollTop = ChatContainerDiv.scrollHeight;
    }, [room])

    useEffect(() => {
        const handleScroll = () => {
            const ChatContainerDiv = ChatContainerRef.current
            if (!ChatContainerDiv) return

            const isUpperEndReached = ChatContainerDiv.scrollTop < 300;
            const hasOverflow = ChatContainerDiv.scrollHeight > ChatContainerDiv.clientHeight

            if (isUpperEndReached && hasOverflow && nextFetch.current && !isFetching) {
                fetchMoreMessages()
            }
        }

        async function fetchMoreMessages() {
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
        <div {...getRootProps()} className={`relative w-full h-full flex flex-col justify-between shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel rounded-xl`}>
            {isDragActive && (
                <div className="flex flex-col z-40 backdrop-blur-sm rounded-xl absolute inset-y-0 inset-x-0 gap-3 p-5 justify-content-center text-center border-[4px] border-pink-pastel border-dashed transition-all duration-200"/>
            )}
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
            <ChatHeader
                session={session}
                blacklistUser={blacklistUser}
                chatUser={chatUser}
                room={room}
                removeRoom={removeRoom}
            />
            <MessagesList
                ref={ChatContainerRef}
                chatSocketRef={chatSocketRef}
                room={room}
                session={session}
                messages={messages}
                handleReply={handleReply}
                handleEdit={handleEdit}
            />
            <div className="flex flex-col">
                <MessageReply isReply={isReply}>
                    <div className="flex flex-row items-center border-l-2 border-l-pink-pastel border-l-solid p-2 px-3 flex flex-row gap-1">
                        {replyMessage && (
                            <>
                                {replyMessage.media_files.length > 0 && (
                                    <img
                                        src={replyMessage.media_files[0].relative_path}
                                        className="rounded-full"
                                        width={55}
                                        height={55}
                                        alt=""
                                    />
                                )}
                                <div className="w-full font-medium text-sm">
                                    <p className="truncate">{replyMessage.user.username}</p>
                                    <p className="truncate">{replyMessage.content}</p>
                                </div>
                            </>
                        )}
                        <div onClick={() => {
                            setIsReply(false)
                            setReplyMessage('')
                        }} className="ms-auto text-pink-pastel">
                            <CloseSharp/>
                        </div>
                    </div>
                </MessageReply>
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
                                <input id="file-input" {...getInputProps()} disabled={!room}/>
                            </label>
                            <input type="text"
                                   className="w-full rounded-full border-0 p-2.5 ring-1 ring-inset ring-gray-300 bg-zinc-200 outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel text-gray-900 font-medium dark:bg-purple-100 dark:ring-pink-pastel dark:text-gray-400 placeholder:text-gray-400 placeholder:font-medium sm:text-sm sm:leading-6 transition-all duration-300"
                                   value={messageText}
                                   onChange={(e) => setMessageText(e.target.value)}
                                   onKeyDown={(e) => handleCodeKeyDown(e)}
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

    )
};

export default ChatContainer;