'use client';
import UserMedia from "@/app/[userId]/UserMedia";
import UserUpdate from "@/app/[userId]/UserUpdate";
import TextUser from "@/app/[userId]/TextUser";
import {
    CloseSharp,
    FavoriteBorderSharp,
    FavoriteSharp,
    HeightSharp,
    PlaceSharp,
    ScaleSharp,
    ManSharp,
    WomanSharp
} from "@mui/icons-material";
import useTranslation from "next-translate/useTranslation";
import {useState} from "react";
import swipeUser from "@/lib/swipeUser";

export default function MainUser({
                                     session,
                                     prefetchRequestUser,
                                     prefetchUserData,
                                     isAuthor,
                                     userId
                                 }) {
    const {t} = useTranslation('user')
    const [requestUser, setRequestUser] = useState(prefetchRequestUser)
    const [userData, setUserData] = useState(prefetchUserData)

    const isLikedByUser = userData.liked.includes(requestUser.id)
    const isLikedByReqUser = requestUser.liked.includes(userData.id)
    const isDislikedByReqUser = requestUser.disliked.includes(userData.id)
    let canMessage = false
    if (isLikedByReqUser && isLikedByUser) canMessage = true

    async function handleSwipe(action) {
        const userId = userData.id
        await swipeUser(session.access, action, userId)
        const updatedUser = {...requestUser}

        if (!requestUser.liked.includes(userId) && action === "like") {
            updatedUser.liked.push(userId)
            updatedUser.disliked = updatedUser.disliked.filter(item => item !== userId)
        } else if (!requestUser.liked.includes(userId) && action === "dislike") {
            if (isDislikedByReqUser) {
                updatedUser.disliked = updatedUser.disliked.filter(item => item !== userId)
            } else {
                updatedUser.disliked.push(userId)
            }
        } else if (requestUser.liked.includes(userId) && action === "like") {
            updatedUser.liked = updatedUser.liked.filter(item => item !== userId)
        } else if (requestUser.liked.includes(userId) && action === "dislike") {
            updatedUser.liked = updatedUser.liked.filter(item => item !== userId)
            updatedUser.disliked.push(userId)
        }
        setRequestUser(updatedUser)
    }

    return (
        <>
            <div
                className="h-[50vh] sm:h-[70vh] lg:h-[90vh] 2xl:h-[90vh] w-full lg:w-1/2 2xl:w-1/2">
                <UserMedia
                    userData={userData}
                />
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-1/2 h-full">
                <div
                    className="flex flex-row flex-wrap gap-3 items-center p-5 rounded-2xl bg-zinc-100 dark:bg-transparent">
                    <p className="font-medium text-3xl">{userData.username}, {userData.age}</p>
                    {isAuthor ? (
                        <UserUpdate
                            session={session}
                            userData={userData}
                            setUserData={setUserData}
                        />
                    ) : (
                        canMessage ? (
                            <TextUser session={session} userId={userId}/>
                        ) : (
                            <div className="ms-auto flex flex-row flex-wrap items-center gap-5">
                                {userData.compatibility_percentage && userData.compatibility_percentage !== 0 && (
                                    <div className={
                                        `cursor-pointer flex items-center justify-center w-12 h-12 transition-color duration-200 text-center rounded-full ring-4 ring-inset ` +
                                        `${userData.compatibility_percentage > 75 ? 'ring-green-500' : 'ring-orange-400'}`
                                    }>
                                        <p className={`font-medium`}>{userData.compatibility_percentage}</p>
                                    </div>
                                )}
                                <div
                                    className={`cursor-pointer p-2 ring-2 ring-inset ring-green-400 ${isLikedByReqUser ? 'bg-green-400 text-green-600 hover:bg-transparent hover:text-green-400' : 'text-green-400 hover:bg-green-400 hover:text-green-600'} transition-color duration-200 text-center rounded-full`}
                                    onClick={() => handleSwipe("like")}>
                                    {isLikedByReqUser ? (
                                        <FavoriteSharp fontSize={"large"}/>
                                    ) : (
                                        <FavoriteBorderSharp
                                            fontSize={"large"}/>
                                    )}
                                </div>
                                <div
                                    className={`cursor-pointer p-2 ring-2 ring-inset ring-red-400 ${isDislikedByReqUser ? 'bg-red-400 text-red-600 hover:bg-transparent hover:text-red-400' : 'text-red-400 hover:bg-red-400 hover:text-red-600'} transition-color duration-200 text-center rounded-full`}
                                    onClick={() => handleSwipe("dislike")}>
                                    <CloseSharp fontSize={"large"}/>
                                </div>
                            </div>
                        )
                    )}
                </div>
                <div
                    className="relative flex flex-col gap-3 p-5 rounded-2xl font-medium text-lg bg-zinc-100 dark:bg-deep-purple">
                    <div className="flex flex-row gap-3">
                        {userData.country && userData.city && (
                            <>
                                <PlaceSharp/>
                                <p>{userData.country}, {userData.city}</p>
                            </>
                        )}
                        <div className={`absolute flex flex-row items-center gap-3 right-5 top-5 `}>
                            <div className={`flex flex-row gap-3 bg-pink-pastel dark:bg-purple-300 rounded-full p-3`}>
                                <img
                                    src={`/media/defaults/zodiac/${userData.zodiac_sign.title}.svg`}
                                    width="30"
                                    height="30"
                                    alt={''}
                                />
                                <p className={`font-medium text-zinc-100`}>{t(userData.zodiac_sign.title)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-5 flex-wrap">
                        {userData.height && (
                            <div className="flex flex-row gap-3 items-center">
                                <HeightSharp fontSize={"medium"}/>
                                <p className="font-medium text-lg">{userData.height}{t("cm")}</p>
                            </div>
                        )}
                        {userData.weight && (
                            <div className="flex flex-row gap-3 items-center">
                                <ScaleSharp fontSize={"medium"}/>
                                <p className="font-medium text-lg">{userData.weight}{t("kg")}</p>
                            </div>
                        )}
                    </div>
                </div>
                {userData.about != undefined && (
                    <div className="p-5 rounded-2xl font-medium text-lg bg-zinc-100 dark:bg-[#1A1B20]">
                        <p className={`font-medium`}>{userData.about}</p>
                    </div>
                )}

                <div
                    className="p-5 rounded-2xl xl:w-4/6 font-medium text-lg">
                    <div className={`flex flex-row flex-wrap gap-3`}>
                        {userData.tags.map((tag) => (
                            <div
                                key={tag.title}
                                className={
                                    `ring-2 ring-inset ring-pink-pastel rounded-full p-3 cursor-pointer transition-color duration-100 bg-transparent`
                                }
                            >
                                <p className={`font-medium text-sm`}>
                                    {t(tag.title)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}