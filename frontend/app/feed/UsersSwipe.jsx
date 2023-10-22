import {useState} from "react";
import {
    CloseSharp,
    FavoriteSharp,
    HeightSharp,
    ManSharp,
    PlaceSharp,
    ScaleSharp,
    UndoSharp,
    WomanSharp
} from "@mui/icons-material";
import ImageSlider from "@/components/Slider/ImageSlider";
import useTranslation from "next-translate/useTranslation";

export default function UsersSwipe({usersData, swipe}) {
    const { t, lang } = useTranslation('user')
    const [isSwipedRight, setIsSwipedRight] = useState(false)
    const [isSwipedLeft, setIsSwipedLeft] = useState(false)
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
    const [currentSlide, setCurrentSlide] = useState(0)
    const user = usersData[currentProfileIndex]
    const maxContentLength = 200

    function handleUndo() {
        if (currentProfileIndex - 1 < 0) return
        setCurrentSlide(0)
        setCurrentProfileIndex((value) => value - 1)
    }

    const handleSwipe = (direction) => {
        if (direction === "r") {
            swipe("like", usersData[currentProfileIndex].id, false)
            setIsSwipedRight(true)
            setTimeout(() => {
                setIsSwipedRight(false)
                if (currentProfileIndex + 1 >= usersData.length) return
                setCurrentSlide(0)
                setCurrentProfileIndex((value) => value + 1)
            }, 300)
        } else {
            swipe("dislike", usersData[currentProfileIndex].id, false)
            setIsSwipedLeft(true)
            setTimeout(() => {
                setIsSwipedLeft(false)
                if (currentProfileIndex + 1 >= usersData.length) return
                setCurrentSlide(0)
                setCurrentProfileIndex((value) => value + 1)
            }, 300)
        }
    }

    return (
        <div className="w-full flex flex-row">
            <div className={`mx-auto w-full md:w-[600px]`}>
                <div className={`relative h-[75vh] bg-pink-pastel rounded-3xl opacity-1 transition-all duration-300 ${isSwipedRight ? 'translate-y-32 translate-x-64 rotate-12 opacity-0' : ''} ${isSwipedLeft ? 'translate-y-32 -translate-x-64 -rotate-12 opacity-0' : ''}`}>
                    <div className={`pointer-events-none absolute rounded-3xl inset-0 opacity-0 transition-all duration-100 z-30 ${isSwipedRight ? 'bg-green-500 opacity-75' : ''} ${isSwipedLeft ? 'bg-red-500 opacity-75' : ''}`}/>
                    {user.media.length > 0 && (
                        <ImageSlider currentUser={user} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide}/>
                    )}
                    <div className="absolute inset-0 w-full flex flex-col gap-3 justify-end items-start text-white p-5 rounded-3xl bg-gradient-to-t from-[#00000051] via-transparent">
                        <div className="flex flex-row gap-3 mb-auto mt-4">
                            {user.country && user.city && (
                                <>
                                    <PlaceSharp/>
                                    <p className="font-medium">{user.country}, {user.city}</p>
                                </>
                            )}
                        </div>
                        <p className="text-3xl font-medium">{user.username}, {user.age} {t("years")}</p>
                        <div className="flex flex-row gap-3 flex-wrap">
                            <p className="font-medium text-sm">{t("sex")}: {user.sex}</p>
                            <p className="font-medium text-sm">{t("orientation")}: {user.orientation}</p>
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
