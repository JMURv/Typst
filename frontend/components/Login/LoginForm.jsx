'use client';
import {useState} from "react";
import {signIn} from "next-auth/react";
import {
    ArrowBackIosNewSharp, ArrowForwardIosSharp,
    CheckSharp,
    CloseSharp, CodeSharp,
    EmailSharp,
    LockSharp,
    LoginSharp
} from '@mui/icons-material';
import {useRouter} from "next/navigation";
import useTranslation from "next-translate/useTranslation";
import resetPassword from "@/lib/resetPassword";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";


export default function LoginForm({setIsLoading, setPushNotifications}) {
    const { t } = useTranslation('user')
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [recoveryEmail, setRecoveryEmail] = useState('')

    const [isForgotPassword, setForgotPassword] = useState(false)
    const [isCode, setIsCode] = useState(false)

    async function forgotPasswordHandler() {
        const response = await resetPassword(recoveryEmail)
        if (response.status === 200) {
            setForgotPassword(false)
            setPushNotifications(
                (prevNoty) => [...prevNoty, {
                    id: new Date().toISOString(),
                    message: t("email has been sent")
                }]
            )
        }
    }

    async function checkCode(e) {
        e.preventDefault()
        try {
            const response = await fetch('/api/v1/users/code/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    code: code
                }),
            })
            if (response.ok) {
                setIsCode(false)

                return await login()
            } else {
                console.log("Some error happened")
            }
        } catch (e) {
            console.log("Failed to get server", e)
        }
    }

    async function login() {
        setIsLoading(true)
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        if (result.error) {
            setPushNotifications(
                (prevNoty) => [...prevNoty, {
                    id: new Date().toISOString(),
                    message: t("invalid credentials")
                }]
            )
        } else {
            router.refresh()
            console.log('Successfully authenticated.')
        }
        setIsLoading(false)
    }

    async function emailing() {
        try {
            const response = await fetch('/api/v1/users/email/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            })
            if (response.status === 200) {
                setIsCode(true)
                setPushNotifications(
                    (prevNoty) => [...prevNoty, {
                        id: new Date().toISOString(),
                        message: t("email has been sent")
                    }]
                )
            } else {
                setPushNotifications(
                    (prevNoty) => [...prevNoty, {
                        id: new Date().toISOString(),
                        message: t("invalid credentials")
                    }]
                )
            }
        } catch (e) {
            setPushNotifications(
                (prevNoty) => [...prevNoty, {
                    id: new Date().toISOString(),
                    message: t("server error")
                }]
            )
        }
    }

    return (
        <div className="container flex flex-col justify-center items-center mx-auto">
            <div className="w-full h-full">
                <div className={
                    `fixed top-0 bottom-0 left-0 right-0 w-full duration-500 ease-in-out transition-all bg-purple-200`
                }>
                    <div className="flex flex-col justify-center items-center mx-auto gap-5 max-w-[500px] w-full h-full">
                        {!isCode && !isForgotPassword && (
                            <div className={`flex flex-col w-full gap-5`}>
                                <UnderlinedInput
                                    IconComponent={EmailSharp}
                                    iconSize={"large"}
                                    name={"email"}
                                    type={"email"}
                                    placeholder={"example@email.com"}
                                    required
                                    autoComplete={"email"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <p onClick={() => setForgotPassword(true)}
                                               className="font-semibold text-pink-pastel cursor-pointer">
                                                {t("forgot password")}?
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative mt-2">
                                        <UnderlinedInput
                                            IconComponent={LockSharp}
                                            iconSize="large"
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="********"
                                            autoComplete="current-password"
                                            onChange={(e) => setPassword(e.target.value)}
                                            value={password}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCode && (
                            <div className={`flex flex-col gap-5 w-full`}>
                                <UnderlinedInput
                                    IconComponent={CodeSharp}
                                    iconSize={"large"}
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    onChange={(e) => setCode(e.target.value)}
                                    value={code}
                                />
                            </div>
                        )}

                        {isForgotPassword && (
                            <div className={`flex flex-col gap-5 w-full`}>
                                <UnderlinedInput
                                    IconComponent={EmailSharp}
                                    iconSize="large"
                                    id="recoveryEmail"
                                    name="recoveryEmail"
                                    type="email"
                                    required
                                    placeholder="example@email.com"
                                    autoComplete="email"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <div className="fixed bottom-0 flex flex-col gap-5">
                <div className="flex flex-row justify-between items-center gap-5">
                    {!isCode && !isForgotPassword && (
                        <SecondaryButton
                            IconComponent={LoginSharp}
                            iconSize={"medium"}
                            text={t("sign in")}
                            onClickHandler={(e) => emailing(e)}
                        />
                    )}
                    {isCode && (
                        <>
                            <SecondaryButton
                                IconComponent={CloseSharp}
                                iconSize={"medium"}
                                text={t("back")}
                                onClickHandler={() => setIsCode(false)}
                            />
                            <SecondaryButton
                                IconComponent={CheckSharp}
                                iconSize={"medium"}
                                text={t("sent")}
                                onClickHandler={(e) => checkCode(e)}
                            />
                        </>
                    )}
                    {isForgotPassword && (
                        <>
                            <SecondaryButton
                                IconComponent={CloseSharp}
                                iconSize={"medium"}
                                text={t("back")}
                                onClickHandler={() => setForgotPassword(false)}
                            />
                            <SecondaryButton
                                IconComponent={CheckSharp}
                                iconSize={"medium"}
                                text={t("sent")}
                                onClickHandler={forgotPasswordHandler}
                            />
                        </>
                    )}
                </div>
                <p className="mb-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("not a member")}?
                    <a
                        onClick={() => router.push("/?page=register")}
                        className="font-semibold cursor-pointer leading-6 text-pink-pastel ml-3 hover:text-pink-pastel/80">
                        {t("sign up")}
                    </a>
                </p>
            </div>
        </div>
    )
}