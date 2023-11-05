import {SwipeSharp} from "@mui/icons-material";
import SkeletonNav from "@/components/Loadings/NavLoading";

export default function Loading() {
    return (
        <div className="w-full h-screen">
            <SkeletonNav />
            <div className="mt-20 container mx-auto">
                <div className="w-full h-full flex flex-col gap-3 animate-pulse">
                    <div className="cursor-pointer text-pink-pastel dark:text-zinc-100">
                        <SwipeSharp fontSize={"large"}/>
                    </div>
                    <div className="w-full h-full flex flex-row flex-wrap items-center justify-center gap-3">
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                        <div className="w-[370px] h-[370px] bg-pink-pastel rounded-md"/>
                    </div>
                </div>
            </div>
        </div>
    )
}