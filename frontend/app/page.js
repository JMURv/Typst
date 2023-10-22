import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import LoginAndRegister from "@/components/Login/LoginAndRegister";


export default async function Home() {
    const session = await getServerSession(options)
    if (!session) {
        return (
            <div className="w-full h-full overflow-y-hidden">
                <div className="flex min-h-full flex-col overflow-y-hidden overflow-x-hidden overflow-hidden dark:bg-deep-purple justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm overflow-y-hidden overflow-x-hidden bg-zinc-100 border-solid border-zinc-200 dark:border-pink-pastel border-[2px] dark:bg-purple-200 rounded-xl p-5">
                        <div className="">
                            <p className="text-center text-pink-pastel text-4xl font-bold">TYP.ST</p>
                        </div>
                        <div className="mt-10 h-full">
                            <LoginAndRegister />
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return redirect(session.user.user_id)
    }
}
