import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import ChatApp from "@/app/chat/ChatApp";
import Nav from "@/components/Nav/Nav";

async function getAllRooms(sessionToken) {
    const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/chat/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${sessionToken}`,
                "Content-Type": "application/json"
            },
        }
    )
    if (response.ok) {
        return await response.json()
    } else {
        throw Error('Something went wrong!')
    }
}

export const metadata = {
    title: 'TYP.ST: Chat',
}

export default async function ChatPage(props) {
    const session = await getServerSession(options);
    if (session) {
        const currentRoom = props.searchParams.r
        const [chatsData] = await Promise.all([
            getAllRooms(session.access),
        ])
        const roomsObject = chatsData.reduce((acc, room) => {
            acc[room.id] = room
            return acc
        }, {})
        return (
            <div className="w-full h-screen dark:bg-purple-100 lg:overflow-y-hidden">
                <Nav session={session} />
                <div className="mt-20 container mx-auto">
                    <ChatApp session={session} roomsObject={roomsObject} currentRoom={currentRoom}/>
                </div>
            </div>
        )
    } else {
        redirect(`/login`)
    }
}