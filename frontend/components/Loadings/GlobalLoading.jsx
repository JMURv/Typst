'use client'

import {Transition} from "@headlessui/react";
import {Jelly} from '@uiball/loaders'

export default function GlobalLoading({isLoading}){
    return(
        <Transition
            show={isLoading}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className={`fixed top-0 bottom-0 right-0 left-0 py-2 w-screen bg-zinc-200/50 backdrop-blur-md dark:bg-[#251832]/80 z-50`}
        >
            <div className={`w-full h-full flex flex-col gap-3 mx-auto justify-center items-center`}>
                 <p className={`text-center text-9xl font-bold`}>TYP.ST</p>
                <div className="text-zinc-200">
                    <Jelly color={"#d4d4d8"} size={70} />
                </div>
            </div>
        </Transition>
    )
}