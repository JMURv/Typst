import {CloseSharp} from "@mui/icons-material";
import {Transition} from "@headlessui/react";

export default function MessageReply({replyMessage, setReplyMessage, isReply, setIsReply}) {
    return (
        <Transition
            as={"div"}
            show={isReply}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 translate-y-full"
            enterTo="transform opacity-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 translate-y-0"
            leaveTo="transform opacity-0 translate-y-full"
            className="bg-zinc-100 dark:bg-purple-200"
        >
            <div className="flex flex-row items-center border-l-2 border-l-pink-pastel border-l-solid p-2 px-3 flex flex-row gap-1">
                {replyMessage && (
                    <>
                        {replyMessage.media_files.length > 0 && (
                            <img
                                src={replyMessage.media_files[0].relative_path}
                                className="rounded-full"
                                width={25}
                                height={25}
                                alt=""
                            />
                        )}
                        <div className="w-full font-medium text-sm">
                            <p className="truncate">{replyMessage.user.username}</p>
                            <p className="truncate">{replyMessage.content}</p>
                        </div>
                    </>
                )}
                <div onClick={() => {
                    setIsReply(false)
                    setReplyMessage('')
                }} className="ms-auto text-pink-pastel">
                    <CloseSharp/>
                </div>
            </div>
        </Transition>
    )
}