import {useEffect, useState, useRef, forwardRef} from "react";
import MediaGridLoaded from "@/components/Media/MediaGridLoaded";
import {CheckSharp, DeleteSharp, DoneAllSharp, EditSharp, ReplySharp} from "@mui/icons-material";
import MessageDropdown from "@/components/Dropdown/MessageDropdown";
import useTranslation from "next-translate/useTranslation";
import {CSSTransition, TransitionGroup} from "react-transition-group";

export const MessagesList = forwardRef(({ session, room, messages, handleReply, handleEdit, chatSocketRef }, ref) => {
    async function handleSeen(messageId){
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

    return (
        <div ref={ref} className="bg-zinc-200 dark:bg-purple-100 h-full overflow-y-auto px-3 py-3">
            <TransitionGroup>
                {messages.length > 0 && (
                    messages.map((message) => (
                        <CSSTransition key={message.id} timeout={300}
                                       classNames="message">
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
    )
})

export function Message({session, messageData, handleSeen, handleReply, handleEdit, remove}) {
    const { t } = useTranslation('chat')

    const messageRef = useRef(null)
    const userId = session.user.user_id
    const isUser = messageData.user.id === userId
    const isMedia = messageData.media_files.length > 0
    const [isContext, setIsContext] = useState(false)
    const [mediaFiles, setMediaFiles] = useState(messageData.media_files)
    const [messageSeen, setMessageSeen] = useState(false)
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })

    let dropdownItems = [
        {messageData: messageData, IconComponent: ReplySharp, label: "Reply", clickHandler: handleReply},
        {messageData: messageData, IconComponent: DeleteSharp, label: "Delete", clickHandler: remove},
    ]
    if (session.user.user_id === messageData.user.id) {
        dropdownItems = [
            {messageData: messageData, IconComponent: ReplySharp, label: "Reply", clickHandler: handleReply},
            {messageData: messageData, IconComponent: EditSharp, label: "Edit", clickHandler: handleEdit},
            {messageData: messageData, IconComponent: DeleteSharp, label: "Delete", clickHandler: remove},
        ]
    }

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !messageSeen && !messageData.seen && messageData.user.id !== session.user.user_id) {
                    setMessageSeen(true)
                    messageData.seen = true
                    handleSeen(messageData.id)
                }
            })
        })

        if (messageRef.current) {
            observer.observe(messageRef.current)
        }

        return () => {
            if (messageRef.current) {
                observer.unobserve(messageRef.current)
            }
        }
    }, [messageData, messageSeen])

    return (
        <div className={`relative flex flex-col mb-2 w-[45%] ${isUser ? 'ms-auto' : ''}`} onDoubleClick={() => handleReply({messageData})} onContextMenu={(e) => {
            e.preventDefault()
            setIsContext((value) => !value)
            setClickPosition({ x: e.clientX, y: e.clientY })
        }}>
            <div
                ref={messageRef}
                id={`message${messageData.id}`}
                className={`flex flex-col rounded-xl pb-6 ${!isUser ? 'bg-pastel-100' : 'bg-pink-pastel'} ${isMedia ? 'bg-transparent p-0 overflow-hidden' : 'p-3'}`}>
                <MessageDropdown menuItems={dropdownItems} isOpen={isContext} setIsOpen={setIsContext} clickPosition={clickPosition}/>
                {messageData.reply && (
                    <div
                        className="flex flex-row items-center border-l-2 border-l-zinc-200 border-l-solid flex flex-row">
                        {messageData.reply.media_files.length > 0 && (
                            <img
                                src={messageData.reply.media_files[0].relative_path}
                                className="rounded-full"
                                width={25}
                                height={25}
                                alt=""
                            />
                        )}
                        <div className="w-full ms-2 font-medium text-sm text-zinc-200">
                            <p className="truncate">{messageData.reply.user.username}</p>
                            <p className="truncate">{messageData.reply.content}</p>
                        </div>
                    </div>
                )}
                {isMedia ? (
                    <div className={`${messageData.content ? 'bg-pink-pastel rounded-b-xl pb-6' : ''}`}>
                        <MediaGridLoaded
                            files={mediaFiles}
                        />
                        <p className={`font-medium text-base tracking-wide text-zinc-100 pt-2 px-3`}>{messageData.content}</p>
                    </div>
                ) : (
                    <p className={`font-medium text-base tracking-wide text-zinc-100`}>{messageData.content}</p>
                )}
            </div>
            <div className={`absolute w-full px-2 bottom-1 right-1 ms-auto flex flex-row items-center justify-end ${isMedia ? 'bottom-7':''}`}>
                {messageData.edited && (
                    <div className="me-auto ms-2">
                        <p className="text-xs font-medium text-zinc-300">{t("edited")}</p>
                    </div>
                )}
                <div className="me-1 text-zinc-100 font-medium text-xs">
                    {messageData.timestamp}
                </div>
                {messageData.seen ? (
                    <div className="text-zinc-100">
                        <DoneAllSharp fontSize={"small"}/>
                    </div>
                ) : (
                    <div className="text-zinc-100">
                        <CheckSharp fontSize={"small"}/>
                    </div>
                )}
            </div>
        </div>
    )
}