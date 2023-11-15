import {useState, useEffect} from 'react';
import {CloseSharp} from "@mui/icons-material";

export default function Notification({notification, onClose}) {
    const [visible, setVisible] = useState(null)

    useEffect(() => {
        const startTimer = setTimeout(() => {
            setVisible(true)
        }, 0)
        return () => clearTimeout(startTimer)
    }, [])

    useEffect(() => {
        const endTimer = setTimeout(() => {
            setVisible(false)
        }, 4000)
        const deletionTimer = setTimeout(() => {
            onClose(notification.id)
        }, 4300)
        return () => {
            clearTimeout(endTimer)
            clearTimeout(deletionTimer)
        }
    }, [])

    return (
        <div
            className={`transform ${visible ? 'translate-x-0 opacity-100':'translate-x-full opacity-0'} flex flex-row items-center z-40 top-40 right-4 w-80 bg-pink-pastel/20 backdrop-blur-md rounded-l-md p-4 transition-all ease-in-out duration-300`}
        >
            <div className={`flex flex-row gap-3 items-center cursor-pointer`}>
                {notification.actor ? (
                    <img loading={"lazy"} className="rounded-full bg-pink-pastel object-cover" width={40} height={40}
                         src={`${notification.actor.media[0].relative_path}`} alt=""/>
                ) : (
                    <div className="w-[40px] h-[40px] rounded-full bg-pink-pastel"/>
                )}
                <p className={`font-medium text-sm`}>{notification.message}</p>
            </div>
            <div onClick={() => setVisible(false)} className={`ms-auto cursor-pointer text-zinc-200`}>
                <CloseSharp />
            </div>
        </div>
    )
}


export function NotificationContainer({pushNotifications, setPushNotifications}) {

    const removeNotification = (id) => {
        setPushNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id))
    }

    return (
        <div className="fixed z-40 top-40 right-0 w-0 h-full flex flex-col gap-3 items-end">
            {pushNotifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    )
}


