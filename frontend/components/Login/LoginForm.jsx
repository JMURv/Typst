'use client';
import {useState} from "react";
import {signIn} from "next-auth/react";
import IconInput from "@/components/Inputs/IconInput";
import {CheckSharp, EmailSharp, LockSharp, LoginSharp} from '@mui/icons-material';
import {useRouter} from "next/navigation";
import useTranslation from "next-translate/useTranslation";
import resetPassword from "@/lib/resetPassword";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";


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
            console.log('Email has been sent successfully')
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
                setIsCode(true)
                return await login()
            } else {
                console.log("Some error happened")
            }
        } catch (e) {
            console.log("Failed to get server")
        }
    }

    async function login(e) {
        e.preventDefault()
        setIsLoading(true)
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        if (result.error) {
            setPushNotifications(
                (prevNoty) => [...prevNoty, {id: new Date().toISOString(), message: t("invalid credentials")}]
            )
        } else {
            router.refresh()
            console.log('Successfully authenticated.')
        }
        setIsLoading(false)
    }

    async function emailing(e) {
        e.preventDefault()
        // TODO: Добавлять айпи сессии и сверять. Если айпи нет - отправлять письмо при логине
        try {
            const response = await fetch('/api/v1/users/email/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            })
            if (response.ok) {
                setIsCode(true)
                console.log("Email has been sent!")
            } else {
                console.log("Some error happened")
            }
        } catch (e) {
            console.log("Failed to get server")
        }
    }

    return (
        <div className="flex flex-col justify-between gap-5">
            {isCode && (
                <>
                    <p className="block text-sm font-medium leading-6 text-gray-900">{t("please, enter the code")}:</p>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        required
                        className="base-input"
                        onChange={(e) => setCode(e.target.value)}
                        value={code}
                    />
                    <small/>
                    <button type="submit"
                            onClick={(e) => checkCode(e)}
                            className="flex w-full justify-center rounded-md bg-pink-pastel px-3 py-1.5 mt-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {t("sent")}
                    </button>
                </>
            )}
            {isForgotPassword && (
                <div className={`flex flex-col gap-3`}>
                    <p className="block text-sm font-medium leading-6 text-gray-900 dark:text-zinc-200">{t("please, enter recovery email")}:</p>
                     <IconInput
                        IconComponent={EmailSharp}
                        iconSize="medium"
                        id="recoveryEmail"
                        name="recoveryEmail"
                        type="email"
                        required
                        placeholder="Example@email.com"
                        autoComplete="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                    <PrimaryButton IconComponent={CheckSharp} iconSize={"medium"} text={t("sent")} onClickHandler={forgotPasswordHandler} />
                </div>
            )}
            {!isCode && !isForgotPassword && (
                <>
                    <div>
                        <div className="mt-2">
                            <IconInput
                                IconComponent={EmailSharp}
                                iconSize="medium"
                                id="username"
                                name="email"
                                type="email"
                                required
                                placeholder="Example@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <p onClick={() => setForgotPassword(true)} className="font-semibold text-pink-pastel cursor-pointer">
                                    {t("forgot password")}?
                                </p>
                            </div>
                        </div>
                        <div className="relative mt-2">
                            <IconInput
                                IconComponent={LockSharp}
                                iconSize="medium"
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

                    <SecondaryButton IconComponent={LoginSharp} iconSize={"medium"} text={t("sign in")} onClickHandler={(e) => login(e)}/>
                </>
            )}
            <p className="mt-10 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("not a member")}?
                <a
                    onClick={() => router.push("/?page=register")}
                    className="font-semibold cursor-pointer leading-6 text-pink-pastel ml-3 hover:text-pink-pastel/80">
                    {t("sign up")}
                </a>
            </p>
        </div>
    )
}