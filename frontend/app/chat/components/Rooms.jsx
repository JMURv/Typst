import {SearchSharp} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import useTranslation from "next-translate/useTranslation";

export default function Rooms({session, rooms, setRooms, remove}) {
    const { t } = useTranslation('chat')
    const router = useRouter()

    async function handleChatSearch(event) {
        const response = await fetch('/api/v1/chat/search/rooms/',
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({room_search: event.target.value})
            }
        )
        const roomsData = await response.json()
        const roomsObject = roomsData.reduce((acc, room) => {
            acc[room.id] = room
            return acc
        }, {})
        setRooms((prevRooms) => roomsObject)
    }

    async function changeRoom(roomId) {
        router.push(`/chat/?r=${roomId}`)
    }

    return (
        <>
            <div className="w-full flex flex-row items-center">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-pink-pastel dark:text-stone-50">
                        <SearchSharp fontSize="medium"/>
                    </div>
                    <input
                        type="search"
                        name="roomSearch"
                        className="pl-10 p-1.5 block w-full rounded-t-xl border-0
                        bg-gray-100
                        outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel
                        text-gray-900 font-medium
                        dark:bg-purple-100 dark:ring-pink-pastel dark:text-gray-400
                        placeholder:text-gray-400 placeholder:font-medium
                        sm:text-sm sm:leading-6
                        transition-all duration-300"
                        placeholder={t("search")}
                        onChange={handleChatSearch}
                    />
                </div>
            </div>
            <div className="flex flex-col w-full h-full divide-y dark:divide-pink-pastel">
                {rooms && Object.values(rooms).length > 0 ? (
                    Object.values(rooms).map((room) => (
                        <Room
                            key={room.id}
                            session={session}
                            room={room}
                            change={changeRoom}
                        />
                    ))
                ) : (
                    <p className="flex justify-center items-center h-full font-medium text-zinc-400">{t("no rooms available")}</p>
                )}
            </div>
        </>
    )
}

export function Room({room, session, change}) {
    const currentUserId = session.user.user_id
    const chatUser = room.members.find(member => member.id !== currentUserId) ?? null
    let unseenMessages = room.messages.filter(message =>
        message.seen === false &&
        message.user.id !== currentUserId
    )
    return (
        <div
            className={
            `relative flex flex-row p-3 bg-zinc-100 dark:bg-purple-200 hover:bg-zinc-200 dark:hover:bg-purple-300 ${unseenMessages.length > 0 ? 'dark:bg-pink-pastel/20':''} cursor-pointer transition-color duration-200`
        }
            onClick={() => change(room.id)}
        >
            <div className="w-full flex flex-row gap-3">
                {chatUser ? (
                    <img
                        loading={"lazy"}
                        src={chatUser.media[0]?.relative_path || ''}
                        width={50}
                        height={50}
                        className="rounded-full bg-pink-pastel object-cover w-[50px] h-[50px]"
                        alt=""
                    />
                ):(
                    <div className="w-[50px] h-[50px] rounded-full bg-pink-pastel"/>
                )}

                <div className="max-w-[200px]">
                    <h6 className="font-medium text-base">
                        {chatUser && chatUser.username}
                    </h6>
                    <p className="font-medium text-sm truncate">{room.last_message.content}</p>
                </div>
            </div>
            <div className="absolute top-3 right-2 text-right">
                <div className="chat-time">
                    <p className="font-medium text-sm">{room.last_message.timestamp}</p>
                </div>
            </div>
        </div>
    )
}
