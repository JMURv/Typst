export default async function getRequestUser(token) {
    const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/users/me/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (!response.ok) {
        throw Error('Something went wrong!')
    }
    return await response.json()
}