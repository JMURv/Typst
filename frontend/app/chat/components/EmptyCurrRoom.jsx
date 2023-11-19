import ChatHeader from "@/app/chat/components/ChatHeader";
import {MessagesList} from "@/app/chat/components/Message";
import {AddSharp, SendSharp} from "@mui/icons-material";
import useTranslation from "next-translate/useTranslation";

export default function EmptyCurrRoom({session}) {
    const { t } = useTranslation('chat')
    return (
        <div className={`relative w-full h-full flex flex-col justify-between shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel rounded-xl`}>
            <ChatHeader session={session} />
            <MessagesList messages={[]} />
            <div className="flex flex-col">
                <div className="flex flex-row p-3 gap-3 bg-zinc-100 dark:bg-purple-200 rounded-b-xl items-center">
                    <label className="flex justify-center items-center bg-pink-pastel hover:bg-pink-pastel/90 transition-color duration-200 h-full rounded-xl text-slate-200 p-2 cursor-pointer">
                        <AddSharp fontSize={"medium"}/>
                    </label>
                    <input type="text"
                           className="w-full rounded-full border-0 p-2.5 ring-1 ring-inset ring-gray-300 bg-zinc-200 outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel text-gray-900 font-medium dark:bg-purple-100 dark:ring-pink-pastel dark:text-gray-400 placeholder:text-gray-400 placeholder:font-medium sm:text-sm sm:leading-6 transition-all duration-300"
                           placeholder={`${t("choose a chat room")}!`}
                           disabled={true}
                    />
                    <div className="text-pink-pastel">
                        <SendSharp fontSize={"large"}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
