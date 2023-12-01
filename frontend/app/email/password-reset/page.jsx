'use client';

import {useRouter} from "next/navigation"
import {useState} from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {CheckSharp, LockSharp} from "@mui/icons-material";
import IconInput from "@/components/Inputs/IconInput";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import useTranslation from "next-translate/useTranslation";
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";


export default function Page({searchParams}) {
    const { t } = useTranslation('user')
    const router = useRouter()
    const uidb64 = searchParams.uidb64
    const token = searchParams.token
    const [newPassword, setNewPassword] = useState('')

    async function changePassword() {
        const formData = new FormData
        formData.append("uidb64", uidb64)
        formData.append("token", token)
        formData.append("newPassword", newPassword)
        try {
            const response = await fetch(`/api/v1/forgot-password/`, {
                method: "POST",
                body: formData
            })
            if (response.status === 200) {
                router.push("/")
            }
        } catch (e) {
            console.log(`Error occurred ${e}`)
        }
    }

    return (
        <div className="flex h-screen overflow-hidden flex-col dark:bg-deep-purple justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-zinc-100 border-solid border-zinc-200 dark:border-pink-pastel border-[2px] dark:bg-purple-200 rounded-xl p-5">
                <div className="">
                    <p className="text-center text-pink-pastel text-4xl font-bold">
                        {t("new password")}
                    </p>
                </div>
                <div className="mt-10 h-full">
                    <div className="relative flex flex-col justify-between gap-5">
                        <UnderlinedInput
                            IconComponent={LockSharp}
                            iconSize={"large"}
                            type="password"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <SecondaryButton
                            IconComponent={CheckSharp}
                            iconSize={"medium"}
                            text={t("change password")}
                            onClickHandler={changePassword}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}
