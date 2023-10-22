import {AddSharp, SendSharp, SettingsSharp} from "@mui/icons-material";

export function ChatHeaderLoadingSkeleton(){
    return(
        <div className="relative flex flex-row p-3 items-center bg-zinc-100 dark:bg-slate-700 justify-between rounded-t-xl">
            <div className="animate-pulse mx-auto">
                <p className="font-medium tracking-wide text-lg">
                     <div className="h-5 w-40 bg-pink-pastel rounded-full"/>
                </p>
            </div>
            <div className="text-pink-pastel">
                <div className="flex flex-row gap-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-pink-pastel"/>
                    <div className="cursor-pointer">
                        <SettingsSharp fontSize={"small"}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ChatContainerLoadingSkeleton() {
    return(
        <div className="relative w-full h-full flex flex-col justify-between shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-slate-500 rounded-xl">
            <ChatHeaderLoadingSkeleton />
            <div className="bg-zinc-200 dark:bg-slate-800 h-full overflow-y-auto px-3"/>

            <div className="flex flex-col">
                <div className="flex flex-row p-3 gap-3 bg-zinc-100 dark:bg-slate-700 rounded-b-xl items-center">
                    <label htmlFor="file-input" className="flex justify-center items-center bg-pink-pastel hover:bg-pink-pastel/90 transition-color duration-200 h-full rounded-xl text-slate-200 p-2 cursor-pointer">
                        <AddSharp fontSize={"medium"}/>
                    </label>
                    <input type="text"
                       className="w-full rounded-full border-0 p-2.5 ring-1 ring-inset ring-gray-300 bg-zinc-200 outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-pastel text-gray-900 font-medium dark:bg-gray-700 dark:ring-gray-500 dark:text-gray-400 placeholder:text-gray-400 placeholder:font-medium sm:text-sm sm:leading-6 transition-all duration-300"
                       placeholder="Type your message here..."
                    />
                    <div className="text-pink-pastel">
                        <SendSharp fontSize={"large"}/>
                    </div>
                </div>
            </div>
        </div>
    )
}