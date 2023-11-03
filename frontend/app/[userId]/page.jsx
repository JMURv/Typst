import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import Nav from "@/components/Nav/Nav";
import MainUser from "@/app/[userId]/MainUser";
import getRequestUser from "@/lib/getRequestUser";


export async function getUserPageById(userId, accessToken) {
    const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/users/${userId}/`, {
        cache: "no-cache",
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    return await response.json()
}


export async function generateMetadata(props) {
    const {userId} = props.params
    const session = await getServerSession(options)
    const user = await getUserPageById(userId, session.access)
    return {
        title: user.username,
        description: user.about,
    }
}

export default async function Page({params, searchParams}) {
    const {userId} = params
    const session = await getServerSession(options)
    if (!session) {
        return redirect('/')
    }

    const [prefetchUserData, prefetchRequestUser] = await Promise.all([
        getUserPageById(userId, session.access),
        getRequestUser(session.access),
    ])

    const isAuthor = parseInt(userId) === parseInt(session.user.user_id)
    return (
        <div className="w-full overflow-y-hidden">
            <Nav session={session}/>
            <div className="mt-20 px-3 lg:px-10">
                <div className="flex flex-row flex-wrap lg:flex-nowrap gap-5 items-start justify-center">
                    <MainUser
                        session={session}
                        prefetchRequestUser={prefetchRequestUser}
                        prefetchUserData={prefetchUserData}
                        isAuthor={isAuthor}
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    )
}