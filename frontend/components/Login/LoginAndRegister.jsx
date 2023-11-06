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
            {page === "register" ? (
                <RegisterForm setIsLoading={setIsLoading} setPushNotifications={setPushNotifications}/>
            ):(
                <div className={`container mx-auto max-w-[500px] bg-pink-pastel/10`}>
                    <div className={`flex items-center justify-center bg-pink-pastel p-3 mb-5`}>
                        <p className="text-center selection:bg-pink-pastel selection:text-deep-purple text-deep-purple text-7xl font-bold">
                            TYP.ST
                        </p>
                    </div>
                    <div className="h-full px-3">
                        <LoginForm
                            setIsLoading={setIsLoading}
                            setPushNotifications={setPushNotifications}
                        />
                    </div>
                </div>
            )}
        </>
    )
}