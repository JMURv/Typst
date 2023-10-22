import {Transition} from "@headlessui/react";
import {useEffect, useRef} from "react";

export default function MessageDropdown({menuItems, isOpen, setIsOpen, clickPosition }) {
    const manualDropdownRef = useRef(null)

    function handleCloseContext(event) {
        const clickedElement = event.target
        const isInsideManualDropdown = manualDropdownRef.current.contains(clickedElement)
        if (!isInsideManualDropdown) {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleCloseContext)
        return () => {
            document.removeEventListener('mousedown', handleCloseContext)
        }
    }, [])
    return (
        <div ref={manualDropdownRef} style={{ left: clickPosition.x, top: clickPosition.y }} className="fixed z-30 flex justify-start items-center">
            <Transition
                as={"div"}
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                {isOpen && (
                    <div className="relative w-56 origin-top-right rounded-md overflow-hidden bg-zinc-100 dark:bg-gray-700 focus:outline-none">
                        {menuItems.map((menuItem, index) => (
                            <div key={index} className={"cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-gray-900 dark:bg-purple-500 dark:hover:bg-purple-300 dark:text-zinc-100 block px-4 py-2 text-sm font-medium"}>
                                <div
                                    className="flex flex-row gap-2"
                                    onClick={() => {setIsOpen((value) => !value); menuItem.clickHandler(menuItem)}}
                                >
                                    <div className="text-pink-pastel dark:text-zinc-100">
                                        <menuItem.IconComponent />
                                    </div>
                                    {menuItem.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Transition>
        </div>
    )
}