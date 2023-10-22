'use client';
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import {NotificationContainer} from "@/components/Notifications/Notification";
import GlobalLoading from "@/components/Loadings/GlobalLoading";
import {useEffect, useState} from "react";
import useTranslation from "next-translate/useTranslation";
import {useSearchParams} from "next/navigation";
import GuestNav from "@/components/Nav/GuestNav";

export default function LoginAndRegister() {
    const {t} = useTranslation('user')
    const searchParams = useSearchParams()
    const page = searchParams.get("page")
    const isSessionExp = searchParams.get("isSessionExp")

    const [isLoading, setIsLoading] = useState(false)
    const [pushNotifications, setPushNotifications] = useState([])

    useEffect(() => {
        if (isSessionExp === 'exp') {
            setPushNotifications((prevNoty) => [
                ...prevNoty,
                {id: new Date().toISOString(), message: t('session has been expired')},
            ])
        }
    }, [])

    return (
        <>
            <GuestNav/>
            <GlobalLoading isLoading={isLoading}/>
            <NotificationContainer
                pushNotifications={pushNotifications}
                setPushNotifications={setPushNotifications}
            />
            {page === 'register' ? (
                <RegisterForm setIsLoading={setIsLoading} setPushNotifications={setPushNotifications}/>
            ) : (
                <LoginForm setIsLoading={setIsLoading} setPushNotifications={setPushNotifications}/>
            )}
        </>
    )
}