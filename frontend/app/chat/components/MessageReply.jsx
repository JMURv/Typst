import {CloseSharp} from "@mui/icons-material";
import {Transition} from "@headlessui/react";

export default function MessageReply({isReply, children}) {
    return (
        <Transition
            as={"div"}
            show={isReply}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
            className="bg-zinc-100 dark:bg-purple-200"
        >
            {children}
        </Transition>
    )
}