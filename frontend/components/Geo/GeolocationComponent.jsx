'use client';
import {useEffect} from "react";


export function GeolocationComponent({session}) {
    useEffect(() => {
        const getLastSentTime = () => {
            return localStorage.getItem('lastGeolocationSentTime');
        }

        const setLastSentTime = (timestamp) => {
            localStorage.setItem('lastGeolocationSentTime', timestamp);
        }

        const currentTime = Date.now()
        const lastSentTime = parseInt(getLastSentTime(), 10) || 0
        const elapsedTime = currentTime - lastSentTime

        if (elapsedTime >= 300000) {
            const getUserGeolocation = () => {
                return new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error('Geolocation is not supported by your browser'))
                    }
                    const options = {
                        maximumAge: 300000,
                    }
                    navigator.geolocation.getCurrentPosition(resolve, reject, options)
                })
            }


            const sendGeolocationToBackend = async (latitude, longitude) => {
                try {
                    const response = await fetch('/api/v1/services/geolocation/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access}`
                        },
                        body: JSON.stringify({latitude, longitude}),
                    })

                    if (response.ok) {
                        setLastSentTime(currentTime)
                        console.log('Geolocation sent successfully')
                    } else {
                        console.error('Failed to send geolocation')
                    }
                } catch (error) {
                    console.error('Error sending geolocation:', error)
                }
            }

            getUserGeolocation().then((position) => {
                const {latitude, longitude} = position.coords
                sendGeolocationToBackend(latitude, longitude)
            }).catch((error) => {
                console.error('Error getting geolocation:', error.message)
            })
        }
    }, [session])
}
