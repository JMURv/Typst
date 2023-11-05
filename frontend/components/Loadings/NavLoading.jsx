import {AccountCircleSharp, ChatSharp, GroupAddSharp, Notifications, SettingsSharp} from "@mui/icons-material";

export default function SkeletonNav() {
    return (
        <nav className="flex justify-between container mx-auto py-4 bg-transparent backdrop-blur-md w-full fixed top-0 left-0 right-0 z-10 px-10">
            <div className="flex items-center justify-center">
                <a className="cursor-pointer">
                    <h1 className="text-3xl font-bold text-pink-pastel mb-3 dark:text-stone-50">TYP.ST</h1>
                </a>
            </div>
            <div className="items-center hidden space-x-8 md:flex">
                <a className="header-links">
                    <ChatSharp fontSize={"medium"} />
                </a>
                <a className="header-links">
                    <GroupAddSharp fontSize={"medium"} />
                </a>

                <a className="header-links">
                    <AccountCircleSharp fontSize={"medium"} />
                </a>
            </div>
            <div className="flex items-center space-x-5">
                <div className="flex flex-row items-center justify-center gap-5">
                        <div className="cursor-pointer text-pink-pastel dark:text-zinc-100">
                            <Notifications />
                        </div>
                    <SettingsSharp/>
                </div>
            </div>
        </nav>
    )
}