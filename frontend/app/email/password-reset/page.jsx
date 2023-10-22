'use client';

import {useRouter} from "next/navigation"
import {useState} from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {CheckSharp, LockSharp} from "@mui/icons-material";
import IconInput from "@/components/Inputs/IconInput";


export default function Page({searchParams}) {
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
            const response = await fetch(`/api/v1/users/forgot-password/`, {
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
        <div className="flex min-h-full flex-col dark:bg-deep-purple justify-center px-6 py-12 lg:px-8 mt-20">
            <div
                className="sm:mx-auto sm:w-full sm:max-w-sm bg-zinc-100 border-solid border-zinc-200 dark:border-pink-pastel border-[2px] dark:bg-purple-200 rounded-xl p-5">
                <div className="">
                    <p className="text-center text-pink-pastel text-4xl font-bold">New password</p>
                </div>
                <div className="mt-10 h-full">
                    <div className="relative flex flex-col justify-between min-h-[350px] gap-5">
                        <IconInput
                            IconComponent={LockSharp}
                            label={"New password"}
                            type="password"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <PrimaryButton
                            IconComponent={CheckSharp}
                            iconSize={"medium"}
                            text={"Change password"}
                            onClickHandler={changePassword}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}