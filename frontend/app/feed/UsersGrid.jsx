'use client';
import {useEffect, useRef, useState} from "react";
import {
    CloseSharp, DehazeSharp,
    FavoriteBorderSharp, FavoriteSharp,
    HeightSharp, MessageSharp, PlaceSharp, ScaleSharp,
} from "@mui/icons-material";
import ModalBase from "@/components/Modals/ModalBase";
import ImageSlider from "@/components/Slider/ImageSlider";
import {useRouter} from "next/navigation";
import textUserAPI from "@/lib/textUser";
import useTranslation from "next-translate/useTranslation";

export function UserGrid({user, reqUser, swipe, setIsOpen, setCurrentUser}) {
    const { t } = useTranslation('user')
    const router = useRouter()
    const maxContentLength = 100
    const isLikedByReqUser = reqUser.liked.includes(user.id)

    return(
        <div className="w-[300px] h-[300px] bg-pink-pastel relative group overflow-hidden rounded-md transform transition-all duration-200 hover:scale-110 hover:z-20">
            <div className="w-full h-full" onDoubleClick={() => {setIsOpen(true);setCurrentUser(user)}}>
                {user.media.length > 0 && (
                    <img src={user.media[0].relative_path} className="object-cover w-full h-full" alt=""/>
                )}
                <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-60 transition-opacity duration-300"/>
                <div className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex flex-col gap-3 justify-between items-start p-4 text-white">
                    <div className="flex flex-row w-full justify-between">
                        <div className="flex flex-row gap-3">
                            {user.country && user.city && (
                                <>
                                    <PlaceSharp/>
                                    <p className="font-medium">{user.country}, {user.city}</p>
                                </>
                            )}
                        </div>
                        <div className="text-zinc-100 cursor-pointer ms-auto" onClick={() => {
                            setIsOpen(true)
                            setCurrentUser(user)
                        }}>
                            <DehazeSharp/>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2">
                        <p onClick={() => router.push(`${user.id}/`)} className="text-lg font-medium cursor-pointer transition-color duration-200">{user.username}, {user.age}</p>

                        <div className="flex flex-row gap-5 flex-wrap">
                            {user.height && (
                                <div className="flex flex-row gap-3 items-center">
                                    <HeightSharp fontSize={"medium"}/>
                                    <p className="font-medium text-sm">{user.height}{t("cm")}</p>
                                </div>
                            )}
                            {user.weight && (
                                <div className="flex flex-row gap-3 items-center">
                                    <ScaleSharp fontSize={"medium"}/>
                                    <p className="font-medium text-sm">{user.weight}{t("kg")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="overflow-ellipsis overflow-hidden font-medium text-sm">
                        {user.about?.length || '' > maxContentLength ? `${user.about.slice(0, maxContentLength)}...` : user.about}
                    </p>
                    <div className="w-full flex flex-row justify-between items-center gap-3">
                        <div
                            className="cursor-pointer p-2 text-green-400 hover:text-green-300 transition-color duration-200 text-center rounded-full"
                            onClick={() => swipe("like", user.id, true)}>
                            {isLikedByReqUser ? (
                                <FavoriteSharp fontSize={"large"}/>
                            ):(
                                <FavoriteBorderSharp fontSize={"large"} />
                            )}
                        </div>
                        {user.compatibility_percentage && (
                            <div className={
                                `cursor-pointer flex items-center justify-center w-12 h-12 transition-color duration-200 text-center rounded-full ring-4 ring-inset ` +
                                `${user.compatibility_percentage > 75 ? 'ring-green-500':'ring-orange-400'}`
                            }>
                                <p className={`font-medium`}>{user.compatibility_percentage}</p>
                            </div>
                        )}
                        <div
                            className="cursor-pointer p-2 text-red-400 hover:text-red-300 transition-color duration-200 text-center rounded-full"
                            onClick={() => swipe("dislike", user.id, true)}>
                            <CloseSharp fontSize={"large"}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function UsersGrid({reqUser, usersData, swipe, loadMore}) {
    const {t} = useTranslation('user')
    const [isOpen, setIsOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        function handleScroll() {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
            const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
            const isEndReached = scrollTop + clientHeight >= scrollHeight
            const hasOverflow = scrollHeight > clientHeight

            if (isEndReached && hasOverflow) {
                loadMore()
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [loadMore])
    return (
        <>
            <ModalBase isOpen={isOpen} setIsOpen={setIsOpen}>
                <div className="flex flex-col gap-2">
                    <div className="h-96 relative">
                        <ImageSlider
                            currentUser={currentUser}
                        />
                        {currentUser.country && currentUser.city && (
                            <div className="absolute bottom-5 left-4 flex flex-row gap-3">
                                <PlaceSharp/>
                                <p className="font-medium">{currentUser.country}, {currentUser.city}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-2xl bg-zinc-100 dark:bg-purple-300">
                        <p className="text-2xl font-medium">{currentUser.username}, {currentUser.age} {t("years")}</p>
                        <div className="flex flex-row gap-3 flex-wrap">
                            <p className="font-medium text-sm">{t("sex")}: {currentUser.sex}</p>
                            <p className="font-medium text-sm">{t("orientation")}: {currentUser.orientation}</p>
                        </div>
                        <div className="flex flex-row gap-5 flex-wrap">
                            {currentUser.height && (
                                <div className="flex flex-row gap-3 items-center">
                                    <HeightSharp fontSize={"medium"}/>
                                    <p className="font-medium text-sm">{currentUser.height}{t("cm")}</p>
                                </div>
                            )}
                            {currentUser.weight && (
                                <div className="flex flex-row gap-3 items-center">
                                    <ScaleSharp fontSize={"medium"}/>
                                    <p className="font-medium text-sm">{currentUser.weight}{t("kg")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl font-medium text-sm bg-zinc-100 dark:bg-purple-300">
                        {currentUser.about}
                    </div>
                    <div className="w-full flex flex-row justify-between gap-3">
                        <div
                            className="cursor-pointer p-2 text-green-400 transition-color duration-200 text-center rounded-full"
                            onClick={() => {
                                setIsOpen(false)
                                swipe("like", currentUser.id)
                            }}>
                            <FavoriteSharp fontSize={"large"}/>
                        </div>
                        <div
                            className="cursor-pointer p-2 text-red-400 transition-color duration-200 text-center rounded-full"
                            onClick={() => {
                                setIsOpen(false)
                                swipe("dislike", currentUser.id)
                            }}>
                            <CloseSharp fontSize={"large"}/>
                        </div>
                    </div>
                </div>
            </ModalBase>
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-5">
                {usersData.map((user) => (
                    <UserGrid
                        key={user.id}
                        reqUser={reqUser}
                        user={user}
                        setIsOpen={setIsOpen}
                        setCurrentUser={setCurrentUser}
                        swipe={swipe}
                    />
                ))}
            </div>
        </>
    )
}