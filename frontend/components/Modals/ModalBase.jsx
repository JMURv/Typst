import {Dialog, Transition} from '@headlessui/react'
import {Fragment} from "react";
import {CloseSharp} from "@mui/icons-material";

export default function ModalBase({isOpen, setIsOpen, label, children}) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25"/>
                </Transition.Child>

                <div className="fixed inset-0">
                    <div className="flex min-h-full items-center justify-center text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-deep-purple dark:border-[1.5px] dark:border-solid dark:border-pink-pastel p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    <div className="flex md:hidden flex-row justify-between mb-3">
                                        {label && label}
                                        <div className="ms-auto cursor-pointer" onClick={() => setIsOpen(false)}>
                                            <CloseSharp />
                                        </div>
                                    </div>
                                </Dialog.Title>
                                {children}
                            </Dialog.Panel>

                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}