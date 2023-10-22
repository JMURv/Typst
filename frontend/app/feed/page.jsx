import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {redirect} from "next/navigation";
import Nav from "@/components/Nav/Nav";
import FeedPage from "@/app/feed/FeedPage";
import getRequestUser from "@/lib/getRequestUser";

export async function getFeedUsers(sessionToken) {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/users/?page=1`, {
            cache: "no-cache",
            method: 'GET',
            credentials: 'include',
            headers: {
                "Authorization": `Bearer ${sessionToken}`
            }
        })
        if (!response.ok) {
            console.error("Something went wrong!")
            return []
        }
        return await response.json()
    } catch (e) {
        console.error(`Error while fetching users: ${e}`)
        return []
    }
}

export const metadata = {
    title: 'Feed'
}

export default async function Page() {
    const session = await getServerSession(options)
    if (!session) {
        return redirect('/')
    }
    const [usersPaginatedData, requestUser] = await Promise.all([
        getFeedUsers(session.access),
        getRequestUser(session.access),
    ])
    const usersData = usersPaginatedData.results || []
    const usersNextLink = usersPaginatedData.next || null
    return (
        <div className="w-full">
            <Nav session={session}/>
            <div className="mt-20 px-3 lg:px-10">
                <FeedPage
                    session={session}
                    usersData={usersData}
                    usersNextLink={usersNextLink}
                    requestUser={requestUser}
                />
            </div>
        </div>
    )
}