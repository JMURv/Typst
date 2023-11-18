'use client';
import Rooms from "@/app/chat/components/Rooms";
import ChatContainer from "@/app/chat/components/ChatContainer";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import handleBlacklist from "@/lib/handleBlacklist";
import {ArrowBack, ArrowBackSharp} from "@mui/icons-material";
import GlobalLoading from "@/components/Loadings/GlobalLoading";


export default function ChatApp({session, roomsObject, currentRoom}) {
    const router = useRouter()
    const chatSocketRef = useRef(null)
    const ChatContainerRef = useRef(null)
    const currentRoomRef = useRef(currentRoom || null)
    const nextFetch = useRef(roomsObject[currentRoom]?.next ?? null)
    const [allRoomsData, setAllRoomsData] = useState(roomsObject)
    const [isLoading, setIsLoading] = useState(true)

    async function handleBlockUser(userId) {
        await handleBlacklist(session.access, userId)
    }

    async function removeRoom({e, roomId}) {
        if (e){
            e.preventDefault()
            e.stopPropagation()
        }
        try {
            const response = await fetch(`/api/v1/chat/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({roomId: roomId})
            })
            if (response.ok) {
                router.push('chat/')
                setAllRoomsData((prevRooms) => {
                    const updatedRooms = {...prevRooms}
                    delete updatedRooms[roomId]
                    return updatedRooms
                })
            }
        } catch (e) {
            console.log(`Error while deleting the room: ${e}`)
        }
    }

    useEffect(() => {
        nextFetch.current = allRoomsData[currentRoomRef.current]?.next ?? null
    }, [allRoomsData, currentRoom])

    useEffect(() => {
        const wsStart = window.location.protocol === "https:" ? "wss://" : "ws://"
        chatSocketRef.current = new WebSocket(
            `${wsStart}${window.location.host}/ws/chat/${session.user.user_id}/`
        )

        chatSocketRef.current.onopen = () => {
            setIsLoading(false)
            console.log('WebSocket connection established')
        }

        chatSocketRef.current.onmessage = async function (event) {
            const data = JSON.parse(event.data)
            const roomId = data.room

            if (data.type === 'edit') {
                setAllRoomsData((prevRoomMessages) => {
                    const updatedRoom = {
                        ...prevRoomMessages[roomId],
                        messages: prevRoomMessages[roomId]?.messages.map((message) =>
                            message.id === data.id ? {
                                ...message,
                                content: data.content,
                                edited: data.edited
                            } : message
                        ),
                    }
                    return {
                        ...prevRoomMessages,
                        [roomId]: updatedRoom,
                    }
                })
            } else if (data.type === 'remove') {
                setAllRoomsData((prevRoomMessages) => {
                    const updatedMessages = [
                        ...(prevRoomMessages[roomId]?.messages.filter(message => message.id !== data.message) || []),
                    ]
                    const updatedRoom = {
                        ...prevRoomMessages[roomId],
                        messages: updatedMessages,
                    }
                    return {
                        ...prevRoomMessages,
                        [roomId]: updatedRoom,
                    }
                })
            } else if (data.type === 'seen'){
                setAllRoomsData((prevRoomMessages) => {
                    const updatedRoom = {
                        ...prevRoomMessages[roomId],
                        messages: prevRoomMessages[roomId]?.messages.map((message) =>
                            message.id === data.id ? {
                                ...message,
                                seen: true,
                            } : message
                        ),
                    }
                    return {
                        ...prevRoomMessages,
                        [roomId]: updatedRoom,
                    }
                })

            } else if (data.type === 'chat_message') {
                setAllRoomsData((prevRoomMessages) => {
                    const updatedMessages = [
                        ...(prevRoomMessages[roomId]?.messages || []),
                        data,
                    ]
                    const updatedRoom = {
                        ...prevRoomMessages[roomId],
                        messages: updatedMessages,
                        last_message: data
                    }
                    return {
                        ...prevRoomMessages,
                        [roomId]: updatedRoom,
                    }
                })
                if (roomId === currentRoomRef.current) {
                    const ChatContainerDiv = ChatContainerRef.current
                    const isEndTrasholdReached = ChatContainerDiv.scrollHeight - ChatContainerDiv.scrollTop <= ChatContainerDiv.clientHeight + 300
                    setTimeout(() => {
                        if (isEndTrasholdReached) {
                            const targetElement = document.getElementById(`message${data.id}`)
                            targetElement.scrollIntoView({behavior: 'smooth'});
                    }
                    }, 50)

                }
            }
        };
        chatSocketRef.current.onclose = () => {
            console.log('WebSocket connection closed')
        }
        return () => {
            chatSocketRef.current.close()
        }
    }, [session.user.user_id])

    return (
        <>
            {isLoading && (
                <GlobalLoading isLoading={isLoading} />
            )}
            <div className="hidden lg:flex flex-row flex-nowrap w-full gap-3 h-[75vh]">
                <div className="w-full lg:w-1/4 bg-zinc-100 rounded-xl shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel dark:bg-purple-200">
                    <Rooms
                        session={session}
                        rooms={allRoomsData} setRooms={setAllRoomsData} remove={removeRoom}
                        currentRoomRef={currentRoomRef}
                    />
                </div>
                <ChatContainer
                    ChatContainerRef={ChatContainerRef}
                    session={session}
                    chatSocketRef={chatSocketRef}
                    removeRoom={removeRoom}
                    blacklistUser={handleBlockUser}
                    room={currentRoomRef.current} setAllRoomsData={setAllRoomsData} allRoomsData={allRoomsData}
                    nextFetch={nextFetch}
                />
            </div>
            <div className={`flex lg:hidden w-full gap-3 h-[75vh]`}>
                {currentRoomRef.current ? (
                    <div className={`flex flex-col gap-3 w-full`}>
                        <div onClick={() => {
                            router.push('chat')
                            currentRoomRef.current = ''
                        }} className={`cursor-pointer`}>
                            <ArrowBackSharp fontSize={"large"} />
                        </div>
                        {/*<ChatContainer*/}
                        {/*    // ChatContainerRef={ChatContainerRef}*/}
                        {/*    session={session}*/}
                        {/*    chatSocketRef={chatSocketRef}*/}
                        {/*    removeRoom={removeRoom}*/}
                        {/*    blacklistUser={handleBlockUser}*/}
                        {/*    room={currentRoomRef.current} setAllRoomsData={setAllRoomsData} allRoomsData={allRoomsData}*/}
                        {/*    nextFetch={nextFetch}*/}
                        {/*/>*/}
                    </div>
                ) : (
                    <div className="w-full bg-zinc-100 rounded-xl shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel dark:bg-purple-200">
                        <Rooms
                            session={session}
                            rooms={allRoomsData} setRooms={setAllRoomsData} remove={removeRoom}
                            currentRoomRef={currentRoomRef}
                        />
                    </div>
                )}
            </div>
        </>
    )
}