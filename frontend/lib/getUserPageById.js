export default async function getUserPageById(userId, accessToken) {
    const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/users/${userId}/`, {
        cache: "no-cache",
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    return await response.json()
}
