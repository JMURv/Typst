'use client';
import UsersGrid from "@/app/feed/UsersGrid";
import {useState} from "react";
import UsersSwipe from "@/app/feed/UsersSwipe";
import {SwipeSharp, ViewCompactSharp} from "@mui/icons-material";

export default function FeedPage({session, usersData, usersNextLink, requestUser}) {
    const [reqUser, setReqUser] = useState(requestUser)
    const [users, setUsers] = useState(usersData)
    const [nextFetch, setNextFetch] = useState(usersNextLink)
    const [isFetching, setIsFetching] = useState(false)
    const [isSwipe, setIsSwipe] = useState(false)

    async function handleSwipe(action, userId, isFilterOut) {
        if (isFilterOut) {
            const updatedUsers = users.filter(user => user.id !== userId)
            setUsers(updatedUsers)
        }
        if (!reqUser.liked.includes(userId)) {
            const updatedUser = {...reqUser}
            updatedUser.liked.push(userId)
            setReqUser(updatedUser)
        } else {
            const updatedUser = {...reqUser}
            updatedUser.liked = updatedUser.liked.filter(item => item !== userId)
            setReqUser(updatedUser)
        }
        try {
            const response = await fetch(`/api/v1/users/${userId}/${action}/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${session.access}`
                }
            })
            if (response.ok) console.log('Success')
        } catch (e) {
            console.error("Some error occurred on the server", e)
        }
    }

    async function fetchMoreUsers() {
        if (!nextFetch || isFetching) return
        setIsFetching(true)
        try {
            const response = await fetch(`/api/v1/${nextFetch}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${session.access}`
                }
            })
            if (!response.ok) throw new Error("Failed to fetch more users")
            const data = await response.json()
            setUsers((prevUsers) => [...prevUsers, ...data.results])
            setNextFetch(data.next)
        } catch (error) {
            console.error('An error occurred while fetching more users:', error)
        }
        setIsFetching(false)
    }

    return (
        <div className="w-full h-full">
            {isSwipe ? (
                <div className="flex flex-col gap-3">
                    <div onClick={() => setIsSwipe((value) => !value)} className="cursor-pointer">
                        <ViewCompactSharp fontSize={"large"}/>
                    </div>
                    <UsersSwipe
                        usersData={users}
                        loadMore={fetchMoreUsers}
                        swipe={handleSwipe}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div onClick={() => setIsSwipe((value) => !value)} className="cursor-pointer">
                        <SwipeSharp fontSize={"large"}/>
                    </div>
                    <UsersGrid
                        reqUser={reqUser}
                        session={session}
                        usersData={users}
                        swipe={handleSwipe}
                        loadMore={fetchMoreUsers}
                        isFetching={isFetching}
                    />
                </div>
            )}
        </div>
    )
}