import React, {createContext, useContext, useState} from 'react';

const NotificationContext = createContext()

export const useNotification = () => {
    return useContext(NotificationContext)
}

export const NotificationProvider = ({children}) => {
    const [pushNotifications, setPushNotifications] = useState([])

    const addNotification = (notification) => {
        setPushNotifications((prevNotifications) => [...prevNotifications, notification])
    }

    const removeNotification = (id) => {
        setPushNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{pushNotifications, addNotification, removeNotification}}>
            {children}
        </NotificationContext.Provider>
    )
}
