'use client';
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import GlobalLoading from "@/components/Loadings/GlobalLoading";
import { useState} from "react";
import useTranslation from "next-translate/useTranslation";
import {useSearchParams} from "next/navigation";
import GuestNav from "@/components/Nav/GuestNav";

export default function LoginAndRegister() {
    const {t} = useTranslation('user')
    const searchParams = useSearchParams()
    const page = searchParams.get("page")
    const isSessionExp = searchParams.get("isSessionExp")
    const [isLoading, setIsLoading] = useState(false)

    let defaultNotificationsState = [
        {id: new Date().toISOString(), message: t('session has been expired')}
    ]
    if (isSessionExp){
        defaultNotificationsState.push()
    }

    return (
        <>
            <GuestNav/>
            <GlobalLoading isLoading={isLoading}/>
            {page === "register" ? (
                <RegisterForm
                    setIsLoading={setIsLoading}
                />
            ):(
                <LoginForm
                    setIsLoading={setIsLoading}
                />
            )}
        </>
    )
}
