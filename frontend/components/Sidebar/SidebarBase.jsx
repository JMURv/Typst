import {Transition} from '@headlessui/react'

export default function SidebarBase({show, children, classes}) {
    return(
        <Transition
            show={show}
            enter="transition-all ease-in-out duration-300"
            enterFrom="transform translate-x-full opacity-0"
            enterTo="transform translate-x-0 opacity-100"
            leave="transition-all ease-in-out duration-300"
            leaveFrom="transform translate-x-0 opacity-100"
            leaveTo="transform translate-x-full opacity-0"
            className={`fixed top-0 bottom-0 right-0 py-2 w-screen bg-zinc-200/50 backdrop-blur-xl dark:bg-[#251832]/80 z-50 overflow-y-auto ${classes}`}
        >
            {children}
        </Transition>
    )
}