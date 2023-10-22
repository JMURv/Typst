export default function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'))
            return
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const {latitude, longitude} = position.coords
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    )
                    const locationData = await response.json()
                    resolve(locationData)
                } catch (error) {
                    reject(error)
                }
            },
            (error) => {
                reject(error)
            }
        )
    })
}