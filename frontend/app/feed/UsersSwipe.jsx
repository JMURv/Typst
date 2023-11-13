import { useState } from "react";
import {
    CloseSharp,
    FavoriteSharp,
    HeightSharp,
    PlaceSharp,
    ScaleSharp,
    UndoSharp,
} from "@mui/icons-material";
import ImageSlider from "@/components/Slider/ImageSlider";
import useTranslation from "next-translate/useTranslation";

export default function UsersSwipe({usersData, swipe, loadMore}) {
    const { t } = useTranslation('user')
    const [isSwipedRight, setIsSwipedRight] = useState(false)
    const [isSwipedLeft, setIsSwipedLeft] = useState(false)
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
    const user = usersData[currentProfileIndex]
    const maxContentLength = 200

    function handleUndo() {
        if (currentProfileIndex - 1 < 0) return
        setCurrentProfileIndex((value) => value - 1)
    }

    const handleSwipe = async (direction) => {
        if (direction === "r") {
            swipe("like", usersData[currentProfileIndex].id, false)
            setIsSwipedRight(true)
            setTimeout(() => {
                setIsSwipedRight(false)
                if (currentProfileIndex + 1 >= usersData.length) return
                setCurrentProfileIndex((value) => value + 1)
            }, 300)
        } else {
            swipe("dislike", usersData[currentProfileIndex].id, false)
            setIsSwipedLeft(true)
            setTimeout(() => {
                setIsSwipedLeft(false)
                if (currentProfileIndex + 1 >= usersData.length) return
                setCurrentProfileIndex((value) => value + 1)
            }, 300)
        }
        if (currentProfileIndex >= usersData.length - 10) {
            await loadMore()
        }
    }

    return (
        <div className="w-full flex flex-row">
            <div className={`mx-auto w-full md:w-[600px]`}>
                <div className={`relative h-[75vh] bg-pink-pastel rounded-3xl opacity-1 transition-all duration-300 ${isSwipedRight ? 'translate-y-32 translate-x-64 rotate-12 opacity-0' : ''} ${isSwipedLeft ? 'translate-y-32 -translate-x-64 -rotate-12 opacity-0' : ''}`}>
                    <div className={`pointer-events-none absolute rounded-3xl inset-0 opacity-0 transition-all duration-100 z-30 ${isSwipedRight ? 'bg-green-500 opacity-75' : ''} ${isSwipedLeft ? 'bg-red-500 opacity-75' : ''}`}/>
                    {user.media.length > 0 && (
                        <ImageSlider currentUser={user} />
                    )}
                    <div className="absolute inset-0 w-full flex flex-col gap-3 justify-end items-start text-white p-5 rounded-3xl bg-gradient-to-t from-[#00000051] via-transparent">
                        <div className="flex flex-row gap-3 mb-auto w-full mt-6">
                            <div className={`flex flex-row w-full items-start`}>
                                {user.country && user.city && (
                                    <>
                                        <PlaceSharp/>
                                        <p className="font-medium">{user.country}, {user.city}</p>
                                    </>
                                )}
                                {user.compatibility_percentage && user.compatibility_percentage !== 0 && (
                                    <div className={
                                        `ms-auto p-3 rounded-full flex items-center justify-center w-12 h-12 rounded-full ring-4 ring-inset ` +
                                        `${user.compatibility_percentage > 75 ? 'ring-green-500' : 'ring-orange-400'}`
                                    }>
                                        <p className="font-medium text-lg">
                                            {user.compatibility_percentage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`flex flex-row items-center w-full`}>
                            <p className="text-3xl font-medium">{user.username}, {user.age}</p>
                            {user.zodiac_sign && (
                                <div className={`flex flex-col items-center justify-center ms-auto`}>
                                    <img src={`/media/defaults/zodiac/${user.zodiac_sign.title}.svg`} width="30" height="30" alt={''}/>
                                    <p className={`font-medium`}>{t(user.zodiac_sign.title)}</p>
                                </div>
                            )}
                        </div>

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
                        <div className="font-medium text-sm">
                            {user.about.length > maxContentLength ? `${user.about.slice(0, maxContentLength)}...` : user.about}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-3 mt-3">
                    <div
                        className="cursor-pointer w-1/3 p-3 text-orange-400 transition-color duration-200 text-center rounded-full shadow-md ring-1 ring-inset ring-gray-200"
                        onClick={() => {
                            handleUndo()
                        }}>
                        <UndoSharp fontSize={"large"}/>
                    </div>
                    <div
                        className="cursor-pointer w-1/3 p-3 text-red-400 transition-color duration-200 text-center rounded-full shadow-md ring-1 ring-inset ring-gray-200"
                        onClick={() => {
                            handleSwipe("l")
                        }}>
                        <CloseSharp fontSize={"large"}/>
                    </div>
                    <div
                        className="cursor-pointer w-1/3 p-3 text-green-400 transition-color duration-200 text-center rounded-full shadow-md ring-1 ring-inset ring-gray-200"
                        onClick={() => {
                            handleSwipe("r")
                        }}>
                        <FavoriteSharp fontSize={"large"}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
