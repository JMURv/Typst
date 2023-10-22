import {getServerSession} from "next-auth";
import {options} from "@/app/options";
import {GeolocationComponent} from "@/components/Geo/GeolocationComponent";

export default async function GeolocationServerComponent(){
    const session = await getServerSession(options)
    if (session) return <GeolocationComponent session={session} />
}


