import SkeletonNav from "@/components/Loadings/NavLoading";

export default function Loading() {
    return (
        <div className="w-full h-screen overflow-y-hidden">
            <SkeletonNav />
            <div className="h-full w-full mt-20 container mx-auto">
                <div className="h-full w-full flex flex-row flex-wrap md:flex-nowrap gap-5 items-start justify-center">
                    <div className="h-[50vh] lg:h-[65vh] 2xl:h-[90vh] w-full lg:w-1/2 2xl:w-1/2">
                        <div className={`animate-pulse h-full w-full bg-pink-pastel`}/>
                    </div>
                    <div className="flex flex-col gap-3 w-full lg:w-1/2 h-full">
                        <div className="flex flex-row gap-3 items-center py-5 rounded-2xl bg-zinc-100 dark:bg-transparent">
                            <div className="h-10 w-full bg-pink-pastel rounded-full"/>
                            <div className="h-10 ms-auto w-1/2 lg:w-1/3 bg-pink-pastel rounded-full"/>
                        </div>
                        <div className="flex flex-col gap-3 p-5 rounded-2xl font-medium text-lg bg-zinc-100 dark:bg-deep-purple">
                            <div className="flex w-1/3 flex-row gap-3">
                                <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            </div>
                            <div className="flex w-1/3 flex-row gap-5 flex-wrap">
                                <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            </div>
                            <div className="flex w-1/3 flex-row gap-3 flex-wrap">
                                <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 p-5 rounded-2xl w-full font-medium text-lg bg-zinc-100 dark:bg-[#1A1B20]">
                            <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                            <div className="h-5 w-full bg-pink-pastel rounded-full animate-pulse"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}