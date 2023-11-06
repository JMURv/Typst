import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import LoginAndRegister from "@/components/Login/LoginAndRegister";


export default async function Home() {
    const session = await getServerSession(options)
    if (!session) {
        return (
            <div className="w-full h-screen overflow-hidden dark:bg-deep-purple flex flex-col justify-center items-center">
                <LoginAndRegister/>
            </div>
        )
    } else {
        return redirect(session.user.user_id)
    }
}
