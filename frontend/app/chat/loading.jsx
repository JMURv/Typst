import SkeletonNav from "@/components/Loadings/NavLoading";
import ChatRoomsLoadingSkeleton from "@/components/Loadings/Chat/ChatRoomsLoadingSkeleton";
import ChatContainerLoadingSkeleton from "@/components/Loadings/Chat/ChatContainerLoadingSkeleton";

export default function Loading() {
    return (
        <div className="w-full h-screen overflow-y-hidden">
            <SkeletonNav/>
            <div className="mt-20 container mx-auto">
                <div className="flex flex-row flex-wrap xl:flex-nowrap w-full gap-3 h-[75vh]">
                    <ChatRoomsLoadingSkeleton />
                    <ChatContainerLoadingSkeleton />
                </div>
            </div>
        </div>
    )
}