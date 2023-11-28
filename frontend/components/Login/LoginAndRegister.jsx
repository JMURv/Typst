'use client';
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import GlobalLoading from "@/components/Loadings/GlobalLoading";
import {useState} from "react";
import {useSearchParams} from "next/navigation";

export default function LoginAndRegister({}) {
    const searchParams = useSearchParams()
    const page = searchParams.get("page")
    const [isLoading, setIsLoading] = useState(false)
    return (
        <>
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
