import {SearchSharp} from "@mui/icons-material";

export function ChatRoomLoadingSkeleton(){
    return(
        <div className="w-full flex flex-row p-3 bg-zinc-100 dark:bg-purple-200 hover:bg-zinc-200 dark:hover:bg-purple-300 cursor-pointer justify-between transition-color duration-200">
            <div className="flex flex-row gap-3 justify-start">
                <div className="w-[50px] h-[50px] rounded-full bg-pink-pastel"/>
                <div className="animate-pulse chat-info">
                     <div className="h-3 w-24 bg-pink-pastel rounded-full mb-3"/>
                     <div className="h-3 w-24 bg-pink-pastel rounded-full"/>
                </div>
            </div>
            <div className="flex flex-col text-right">
                <div className="chat-time animate-pulse">
                     <div className="h-3 w-10 bg-pink-pastel rounded-full"/>
                </div>
            </div>
        </div>
    )
}

export default function ChatRoomsLoadingSkeleton() {
    return(
        <div className="w-full lg:w-1/4 bg-zinc-100 rounded-xl shadow-sm border-[1.5px] border-zinc-200 border-solid dark:border-pink-pastel dark:bg-purple-200">
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
                        dark:bg-gray-700 dark:ring-gray-500 dark:text-gray-400
                        placeholder:text-gray-400 placeholder:font-medium
                        sm:text-sm sm:leading-6
                        transition-all duration-300"
                        placeholder="Search"
                    />
                </div>
            </div>
            <div className="flex flex-col w-full h-full divide-y dark:divide-pink-pastel">
                <ChatRoomLoadingSkeleton />
                <ChatRoomLoadingSkeleton />
                <ChatRoomLoadingSkeleton />
                <ChatRoomLoadingSkeleton />
                <ChatRoomLoadingSkeleton />
                <ChatRoomLoadingSkeleton />
            </div>
        </div>
    )
}