'use client';
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {EmailSharp} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import textUserAPI from "@/lib/textUser";

export default function TextUser({session, userId}) {
    const router = useRouter()
    async function handleTextUser(){
        const data = await textUserAPI(session.access, userId)
        router.push(`/chat/?r=${data.room_id}`)
    }
    return (
        <div className="ms-auto">
            <PrimaryButton IconComponent={EmailSharp} iconSize={"medium"} onClickHandler={handleTextUser}/>
        </div>
    )
}