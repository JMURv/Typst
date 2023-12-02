import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import getUserPageById from "@/lib/getUserPageById";
import Nav from "@/components/Nav/Nav";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import SubscriptionItem from "@/app/subs/components/SubscriptionItem";


async function getSubscriptionsData(accessToken){
    const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/subscriptions/`, {
        cache: "no-cache",
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    const responseData = await response.json()
    return responseData.results
}


export default async function Page() {
    const session = await getServerSession(options)
    if (!session) {
        return redirect('/')
    }
    // const reqUserData = await getUserPageById(
    //     session.user.user_id,
    //     session.access
    // )
    const subsData = await getSubscriptionsData(session.access)

    return (
        <div className="w-full h-screen bg-purple-100 overflow-y-hidden">
            <Nav session={session}/>
            <div className="h-full w-full container mx-auto my-auto flex justify-center items-center">
                <div className="w-full flex flex-row flex-wrap gap-5 items-start justify-center">
                    {subsData.map((sub) => (
                        <div key={sub.id} className={`w-1/5 aspect-[1/2] bg-pink-pastel grow rounded-lg`}>
                            <SubscriptionItem session={session} sub={sub} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
