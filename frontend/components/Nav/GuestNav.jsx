'use client';

import {NotificationContainer} from "@/components/Notifications/Notification";

export default function GuestNav() {
    return(
        <nav className="flex justify-center items-center py-4 bg-transparent w-full fixed top-0 left-0 right-0 z-40 px-10">
            <NotificationContainer/>
        </nav>
    )
}
