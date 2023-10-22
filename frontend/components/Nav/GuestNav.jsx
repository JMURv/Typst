'use client';
import ToggleTheme from "@/components/Buttons/ToggleTheme";

export default function GuestNav() {
    return(
        <nav className="flex justify-between items-center py-4 bg-transparent backdrop-blur-md w-full fixed top-0 left-0 right-0 z-40 px-10">
            <div className="flex items-center justify-center">
                <a className="cursor-pointer">
                    <h1 className="text-3xl font-bold text-pink-pastel mb-3 dark:text-stone-50">TYP.ST</h1>
                </a>
            </div>
            <div className="flex items-center space-x-5">
                <div className="header-links">
                    <ToggleTheme noText={true}/>
                </div>
            </div>
        </nav>
    )
}