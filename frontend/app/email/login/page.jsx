'use client';

import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation"
import {useEffect, useState} from "react";

export default function Page({searchParams}) {
    const uidb64 = searchParams.uidb64
    const token = searchParams.token
    const [isFetching, setIsFetching] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function login() {
            const result = await signIn('credentials', {
                uidb64,
                token,
                redirect: false,
            })
            if (result.error) {
                console.log('Authentication failed:', result.error)
            } else {
                router.push('/')
            }
            setIsFetching(false)
        }
        login()
    }, [])

    return (
        <div className="container mx-auto">
            {isFetching &&(
                <p>LOADING</p>
            )}
        </div>
    )
}