import {useRouter} from "next/navigation";
import {useState} from "react";
import {BlockSharp, DeleteSharp, SettingsSharp} from "@mui/icons-material";
import ManualDropdown from "@/components/Dropdown/ManualDropdown";

export default function ChatHeader({session, blacklistUser, chatUser, room, removeRoom}) {
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
                        <a onClick={() => router.push(`/${chatUser.id}`)} className="cursor-pointer w-[50px] h-[50px]">
                            <img src={chatUser.media[0]?.relative_path || null} width={50} height={50} className="rounded-full w-[50px] h-[50px] object-cover bg-pink-pastel" alt=""/>
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
