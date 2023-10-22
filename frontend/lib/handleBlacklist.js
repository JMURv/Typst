export default async function handleBlacklist(token, userId) {
        try {
            return await fetch(`/api/v1/users/${userId}/blacklist/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
        } catch (e) {
            console.error(`Error while blacklisting or otherwise for user: ${e}`)
        }
    }