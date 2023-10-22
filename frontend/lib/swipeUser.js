export default async function swipeUser(token, action, userId) {
    try {
        return await fetch(`/api/v1/users/${userId}/${action}/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
    } catch (e) {
        console.error("Some error occurred on the server", e)
    }
}