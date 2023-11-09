'use client';

import {useRouter} from "next/navigation"
import {useEffect, useState} from "react";
import {CheckSharp, LockSharp} from "@mui/icons-material";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import useTranslation from "next-translate/useTranslation";
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";
import GlobalLoading from "@/components/Loadings/GlobalLoading";


export default function Page({searchParams}) {
    const { t } = useTranslation('user')
    const router = useRouter()
    const uidb64 = searchParams.uidb64
    const token = searchParams.token

    useEffect(() => {

    }, [])

    return (
        <GlobalLoading isLoading={true} />
    )
}