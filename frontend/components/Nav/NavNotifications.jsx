import {Fragment, useEffect, useRef, useState} from "react";
import {CloseSharp, SyncSharp} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import SidebarBase from "@/components/Sidebar/SidebarBase";
import DangerButton from "@/components/Buttons/DangerButton";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import useTranslation from "next-translate/useTranslation";
import {signOut} from "next-auth/react";
import {Transition} from '@headlessui/react'

export async function getUserNotifications(token) {
    return await fetch(`/api/v1/services/notifications/?page=1`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}

export default function NavNotifications({session, isNotifications, setIsNotifications, userNotifications, setUserNotifications, removeNotification}) {
    const { t } = useTranslation('user')

    const [nextFetchLink, setNextFetchLink] = useState(null)
    const [isFetching, setIsFetching] = useState(true)
    const notificationsRef = useRef(null)

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsFetching(true)
            try {
                const response = await getUserNotifications(session.access)
                if (response.status === 401) {
                    return await signOut({ callbackUrl: '/?isSessionExp=exp' })
                }
                if (!response.ok) throw new Error("Failed to fetch notifications")

                const data = await response.json()
                setUserNotifications(data.results)
                setNextFetchLink(data.next)
                setIsFetching(false)
            } catch (error) {
                console.error("An error occurred while fetching notifications:", error)
            }
        }
        fetchNotifications()
    }, [session.access])

    useEffect(() => {
        const handleScroll = () => {
            const notificationsDiv = notificationsRef.current
            if (!notificationsDiv) return

            const isEndReached = notificationsDiv.scrollHeight - notificationsDiv.scrollTop === notificationsDiv.clientHeight
            const hasOverflow = notificationsDiv.scrollHeight > notificationsDiv.clientHeight

            if (isEndReached && hasOverflow && nextFetchLink && !isFetching) {
                fetchMoreNotifications()
            }
        }

        const fetchMoreNotifications = async () => {
            setIsFetching(true)
            try {
                const response = await fetch(nextFetchLink, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${session.access}`
                    }
                })
                if (!response.ok) throw new Error("Failed to fetch more notifications")

                const data = await response.json()
                setUserNotifications((prevNotifications) => [...prevNotifications, ...data.results])
                setNextFetchLink(data.next)
                setIsFetching(false)
            } catch (error) {
                console.error('An error occurred while fetching more notifications:', error)
            }
        }

        if (notificationsRef.current) {
            notificationsRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (notificationsRef.current) {
                notificationsRef.current.removeEventListener('scroll', handleScroll);
            }
        }
    }, [nextFetchLink, isFetching, session.access, isNotifications])

    return (
            <div
                ref={notificationsRef}
                className={`fixed top-0 bottom-0 right-0 w-screen bg-zinc-200/50 backdrop-blur-xl dark:bg-[#251832]/80 z-50 sm:w-[350px] overflow-y-auto transform ${isNotifications ? 'translate-x-0 opacity-100':'translate-x-full opacity-0'} transition-all ease-in-out duration-300`}
            >
                <div className="p-5 flex flex-row items-center gap-5">
                    <DangerButton onClickHandler={() => setIsNotifications((value) => !value)}>
                        <CloseSharp/>
                    </DangerButton>
                    <div className="ms-auto" onClick={() => removeNotification("all")}>
                        <p className="cursor-pointer text-base font-medium">{t("delete all")}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col w-full h-full justify-center items-center">
                        {userNotifications.length > 0 ? (
                            <TransitionGroup component={Fragment}>
                                {userNotifications.map((notification) => (
                                    <CSSTransition key={notification.id} timeout={500} classNames="notifications">
                                        <NotificationCard
                                            remove={removeNotification}
                                            notification={notification}
                                        />
                                    </CSSTransition>
                                ))}
                            </TransitionGroup>
                        ) : (
                            <p className="font-medium h-full">{t("no notifications")}</p>
                        )}
                        {isFetching && (
                            <div className="animate-spin">
                                <SyncSharp/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    )
}

function NotificationCard({remove, notification}) {
    const router = useRouter()
    return (
        <div className="flex flex-row w-full h-25 p-5 bg-pink-pastel/20 hover:bg-pink-pastel/40 transition-color duration-200">
            <div className="flex flex-row gap-3 items-center cursor-pointer" onClick={() => router.push(`/${notification.actor.id}`)}>
                <img loading={"lazy"} className="rounded-full" width={40} height={40} src={`${notification.actor.media[0].relative_path}`} alt=""/>
                <p className="w-[75%] font-medium text-sm ">{notification.message}</p>
            </div>
            <div className="ms-auto" onClick={() => remove(notification.id)}>
                <div className="cursor-pointer">
                    <CloseSharp fontSize={"small"} />
                </div>
            </div>
        </div>
    )
}