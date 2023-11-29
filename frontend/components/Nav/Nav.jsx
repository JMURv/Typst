'use client';
import {
    AccountCircleSharp,
    ChatSharp, CloseSharp, DehazeSharp,
    GroupAddSharp, LoginSharp, LogoutSharp, Notifications, PersonSharp,
    SettingsSharp
} from "@mui/icons-material";
import {signOut} from "next-auth/react";
import {useRouter} from "next/navigation";
import ToggleTheme from "@/components/Buttons/ToggleTheme";
import {useEffect, useState} from "react";
import NavNotifications from "@/components/Nav/NavNotifications";
import {Transition} from '@headlessui/react'
import NavSettings from "@/components/Nav/NavSettings";
import useTranslation from "next-translate/useTranslation";
import {NotificationContainer} from "@/components/Notifications/Notification";
import {useNotification} from "@/providers/NotificationContext";

export async function readAllNotifications(token) {
    return await fetch(`api/v1/services/notifications/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}

export default function Nav({session}) {
    const router = useRouter()
    const { t } = useTranslation('user')
    const { addNotification } = useNotification()

    const [isSettings, setIsSettings] = useState(false)
    const [mobileMenu, setMobileMenu] = useState(false)

    const [isAllRead, setIsAllRead] = useState(false)
    const [isNotifications, setIsNotifications] = useState(false)
    const [userNotifications, setUserNotifications] = useState([])

    async function signOutHandler() {
        await fetch(`/api/v1/logout/`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${session.access}`
            },
            body: JSON.stringify({"refresh_token": session.refresh}),
        })
        return signOut({ callbackUrl: '/?isSessionExp=exp' })
    }

    async function removeNotification(param) {
        const response = await fetch(`/api/v1/services/notifications/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.access}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ param: param })
        })
        if (response.ok) {
            if (param === "all") {
                setUserNotifications([])
            } else {
                setUserNotifications(
                    (prevNotifications) => prevNotifications.filter((notify) => notify.id !== param)
                )
            }
        }
    }

    useEffect(() => {
        const readNotifications = async () => {
            if (isNotifications === true) {
                setIsAllRead(true)
                return await readAllNotifications(session.access)
            }
        }
        readNotifications()
    }, [isNotifications, session.access])

    useEffect(() => {
        const wsStart = window.location.protocol === "https:" ? "wss://" : "ws://"
        const webSocket = new WebSocket(
            `${wsStart}${window.location.host}/ws/notifications/${session.user.user_id}/`
        )
        webSocket.onmessage = async function (event) {
            const data = JSON.parse(event.data)
            if (data.type === "send_notification"){
                setUserNotifications((prevNotifications) => [data.notification, ...prevNotifications])
                addNotification(data.notification)
                setIsAllRead(false)
            }
        }
        return () => {
            webSocket.close()
        }
    }, [session.user.user_id])

    return (
        <>
            <Transition
                show={mobileMenu}
                enter="transition-all ease-in-out duration-300"
                enterFrom="transform translate-x-full"
                enterTo="transform translate-x-0"
                leave="transition-all ease-in-out duration-300"
                leaveFrom="transform translate-x-0"
                leaveTo="transform translate-x-full"
                className="fixed top-0 bottom-0 right-0 flex flex-col w-screen h-screen bg-zinc-100/70 dark:bg-purple-100/70 backdrop-blur-xl z-30"
            >
                <div className="p-5 px-10 ms-auto" onClick={() => setMobileMenu((value) => !value)}>
                    <div className="cursor-pointer">
                        <CloseSharp />
                    </div>
                </div>

                <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color"
                     onClick={() => router.push(`/${session.user.user_id}`)}>
                    <AccountCircleSharp fontSize={"medium"}/>
                    <p className="font-medium">{t("my profile")}</p>
                </div>

                <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color" onClick={() => router.push("/chat")}>
                    <ChatSharp fontSize={"medium"}/>
                    <p className="font-medium">{t("chat")}</p>
                </div>

                <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color" onClick={() => router.push("/feed")}>
                    <GroupAddSharp fontSize={"medium"}/>
                    <p className="font-medium">{t("feed")}</p>
                </div>

                <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color" onClick={() => setIsNotifications((value) => !value)}>
                    <Notifications/>
                    <p className="font-medium">{t("notifications")}</p>
                </div>

                <div className="mt-auto">
                    <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color">
                        <ToggleTheme/>
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color" onClick={() => setIsSettings((value) => !value)}>
                        <SettingsSharp />
                        <p className="font-medium">{t("settings")}</p>
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-200 p-5 px-10 flex flex-row gap-3 hover:bg-zinc-200/70 dark:hover:bg-pink-pastel/40 cursor-pointer duration-200 transition-color" onClick={() => signOutHandler()}>
                        <LogoutSharp />
                        <p className="font-medium">{t("logout")}</p>
                    </div>
                </div>
            </Transition>

            <NotificationContainer/>
            <NavNotifications
                session={session}
                isNotifications={isNotifications} setIsNotifications={setIsNotifications}
                userNotifications={userNotifications} setUserNotifications={setUserNotifications}
                removeNotification={removeNotification}
            />
            <NavSettings
                session={session}
                isSettings={isSettings}
                setIsSettings={setIsSettings}
                signOut={signOutHandler}
            />

            <nav className="flex justify-between container mx-auto items-center py-4 bg-transparent backdrop-blur-md w-full fixed top-0 left-0 right-0 z-30">

                <div className="flex items-center justify-center">
                    <a className="cursor-pointer">
                        <h1 className="text-3xl font-bold text-pink-pastel mb-3 dark:text-stone-50">TYP.ST</h1>
                    </a>
                </div>
                <div className="hidden sm:flex items-center justify-center gap-8">
                    {session && (
                        <>
                            <a className="header-links" onClick={() => router.push("/chat")}>
                                <ChatSharp fontSize={"medium"} />
                            </a>
                            <a className="header-links" onClick={() => router.push("/feed")}>
                                <GroupAddSharp fontSize={"medium"} />
                            </a>

                            <a className="header-links" onClick={() => router.push(`/${session.user.user_id}`)}>
                                <AccountCircleSharp fontSize={"medium"} />
                            </a>
                        </>
                    )}
                </div>
                <div className="flex sm:hidden">
                    <div onClick={() => setMobileMenu((value) => !value)}>
                        <DehazeSharp />
                    </div>
                </div>
                <div className="hidden sm:flex items-center space-x-5">
                    {session ? (
                        <div className="flex flex-row items-center justify-center gap-5">
                            <div className="relative">
                                <div className={`cursor-pointer ${isAllRead ? 'text-pink-pastel dark:text-zinc-100':'text-yellow-400'}`}
                                     onClick={() => setIsNotifications((value) => !value)}>
                                    <Notifications/>
                                </div>
                            </div>
                            <div className="cursor-pointer text-pink-pastel dark:text-zinc-100"
                                 onClick={() => setIsSettings((value) => !value)}>
                                <SettingsSharp/>
                            </div>
                        </div>
                    ) : (
                        <>
                            <a className="header-links">
                                <PersonSharp className="h-5 w-5 mr-2 mt-0.5"/>
                                {t("register")}
                            </a>

                            <a className="header-links">
                                <LoginSharp className="h-5 w-5 mr-2 mt-0.5"/>
                                {t("login")}
                            </a>
                        </>
                    )}
                </div>
            </nav>
        </>
    )
}
