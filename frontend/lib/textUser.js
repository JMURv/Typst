export default async function textUserAPI(sessionToken, userId) {
    try {
        const response = await fetch(`/api/v1/chat/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({recipient: userId})
        })
        if (response.ok) {
            return await response.json()
        } else console.log('Error')
    } catch (e) {
        console.error("Error:", e)
    }
}