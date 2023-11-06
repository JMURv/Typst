import SidebarBase from "@/components/Sidebar/SidebarBase";
import DangerButton from "@/components/Buttons/DangerButton";
import {
    ArrowLeftSharp,
    ArrowRightSharp,
    CheckSharp,
    CloseSharp, DeleteSharp, LocalOfferSharp,
    LockSharp, LogoutSharp, NotificationsSharp, NotInterestedSharp,
    RoomSharp, SupportSharp, SyncSharp
} from "@mui/icons-material";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {useEffect, useState} from "react";
import HintsInput from "@/components/Inputs/HintsInput";
import countriesData from "@/lib/countries";
import Switch from "@/components/Inputs/Switch";
import ToggleTheme from "@/components/Buttons/ToggleTheme";
import useTranslation from "next-translate/useTranslation";
import {useRouter} from "next/navigation";
import handleBlacklist from "@/lib/handleBlacklist";
import resetPassword from "@/lib/resetPassword";


export default function NavSettings({session, isSettings, setIsSettings, signOut}) {
    const { t } = useTranslation('user')
    const router = useRouter()

    const [currPage, setCurrPage] = useState('main')
    const [isFetching, setIsFetching] = useState(true)
    const [newLike, setNewLike] = useState('')
    const [newMessage, setNewMessage] = useState('')
    const [newMatch, setNewMatch] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [prefCountry, setPrefCountry] = useState('')
    const [recoveryEmail, setRecoveryEmail] = useState('')
    const [blacklist, setBlacklist] = useState([])

    useEffect(() => {
        const fetchReqUser = async () => {
            setIsFetching(true)
            try {
                const response = await fetch(`/api/v1/users/me/settings/`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        "Authorization": `Bearer ${session.access}`
                    }
                })
                if (!response.ok) new Error('Failed to get user data')
                const data = await response.json()
                setNewLike(data.new_like_notification)
                setNewMessage(data.new_message_notification)
                setNewMatch(data.new_match_notification)
                setCity(data.city)
                setCountry(data.country)
                setPrefCountry(data.preferred_country)
                setBlacklist(data.blacklist)
            } catch (error) {
                console.error("An error occurred while fetching user data:", error)
            }
            setIsFetching(false)
        }
        fetchReqUser()
    }, [session.access])

    async function update(){
        const formData = new FormData
        formData.append("new_like_notification", newLike)
        formData.append("new_message_notification", newMessage)
        formData.append("new_match_notification", newMatch)
        formData.append("country", country)
        formData.append("preferred_country", prefCountry)
        formData.append("city", city)
        return await fetch(`/api/v1/users/${session.user.user_id}/settings/`,{
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.access}`
            },
            body: formData
        })
    }

    async function deleteAccountHandler(){
        const response = await fetch(`api/v1/users/${session.user.user_id}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.access}`
            }
        })
        if (response.ok){
            return await signOut()
        }
    }

    async function terminateAllSessions(){
        const response = await fetch("api/v1/token/delete-all/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.access}`
            }
        })
        if (response.status === 200){
            await signOut()
        }
    }

    async function resetPasswordHandler(){
        const response = await resetPassword(recoveryEmail)
        if (response.status === 200){
            await signOut()
            console.log('Code sent successfully')
        }
    }

    async function handleUnBlacklist(userId){
        const updatedBlacklist = blacklist.filter(
            user => user.id !== userId
        )
        setBlacklist(updatedBlacklist)
        await handleBlacklist(session.access, userId)
    }

    function handleSettingsNavigation() {
        if (currPage === 'main') {
            setIsSettings(
                (value) => !value
            )
        } else {
            setCurrPage('main')
        }
    }
    return (
        <SidebarBase show={isSettings} classes={'sm:w-[350px]'}>
            <div className="p-5 flex flex-row items-center gap-5">
                <DangerButton onClickHandler={() => handleSettingsNavigation()}>
                    {currPage === "main" ? (
                        <CloseSharp />
                    ):(
                        <ArrowLeftSharp />
                    )}
                </DangerButton>
                <PrimaryButton
                    iconSize={"medium"}
                    IconComponent={CheckSharp}
                    text={t("save")}
                    onClickHandler={update}
                />
            </div>
            <div className="flex flex-col gap-3 w-full h-full">
                {isFetching ? (
                    <div className="items-center justify-center animate-spin">
                        <SyncSharp />
                    </div>
                ) : (
                    <>
                        {currPage === "main" && (
                            <>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('security')}>
                                    <LockSharp />
                                    <p className="font-medium">{t("security")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('geo')}>
                                    <RoomSharp />
                                    <p className="font-medium">{t("geolocation")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('notifications')}>
                                    <NotificationsSharp />
                                    <p className="font-medium">{t("notifications")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('blackList')}>
                                    <NotInterestedSharp />
                                    <p className="font-medium">{t("blacklist")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('support')}>
                                    <SupportSharp />
                                    <p className="font-medium">{t("support")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('deleteAccount')}>
                                    <DeleteSharp />
                                    <p className="font-medium">{t("delete account")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
                            </>
                        )}
                        {currPage === "security" && (
                            <div className="p-3 flex flex-col h-full gap-5">
                                <p className="font-medium text-xl">{t("forgot password")}?</p>
                                <input
                                    type="text"
                                    className="base-input"
                                    placeholder="Example@email.com"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                />
                                <PrimaryButton
                                    IconComponent={CheckSharp}
                                    iconSize={"medium"}
                                    text={t("reset")}
                                    onClickHandler={resetPasswordHandler}
                                />
                                <div className="mt-auto">
                                    <PrimaryButton
                                        text={t("terminate all sessions")}
                                        onClickHandler={terminateAllSessions}
                                    />
                                </div>
                            </div>
                        )}
                        {currPage === "geo" && (
                            <div className="p-3 flex flex-col gap-5">
                                <p className="font-medium text-xl">
                                    {t("where am i")}?
                                </p>
                                <HintsInput
                                    currValue={country}
                                    setValue={setCountry}
                                    placeholder={t("Russian Federation")}
                                    hintsData={countriesData}
                                />
                                <input
                                    type="text"
                                    className="base-input"
                                    placeholder="Moscow"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                                <p className="font-medium text-xl">
                                    {t("i am looking in")}...
                                </p>
                                <HintsInput
                                    currValue={prefCountry}
                                    setValue={setPrefCountry}
                                    placeholder={t("Russian Federation")}
                                    hintsData={countriesData}
                                />
                            </div>
                        )}
                        {currPage === "notifications" && (
                            <div className="p-3 flex flex-col gap-5">
                                <Switch value={newLike} setValue={setNewLike} label={t("new like")}/>
                                <Switch value={newMessage} setValue={setNewMessage} label={t("new message")}/>
                                <Switch value={newMatch} setValue={setNewMatch} label={t("new match")}/>
                            </div>
                        )}
                        {currPage === "blackList" && (
                            <div className="flex flex-col">
                                {blacklist.length > 0 && (
                                    blacklist.map((user) => (
                                        <div key={user.id} className="flex flex-row items-center p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200">
                                            <div className="flex flex-row gap-3 items-center" onClick={() => router.push(`/${user.id}`)}>
                                                <img src={user.media[0].relative_path} width={50} height={50} loading={"lazy"} className="rounded-full" alt=""/>
                                                <p className="font-medium">{user.username}</p>
                                            </div>
                                            <div className="ms-auto" onClick={() => handleUnBlacklist(user.id)}>
                                                <CloseSharp />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {currPage === "deleteAccount" && (
                            <div className="h-full flex flex-col gap-5 p-3">
                                <p className={`font-medium`}>{t('Are you sure?')}</p>
                                <div className="mt-auto">
                                    <PrimaryButton text={t("delete account")} onClickHandler={deleteAccountHandler}/>
                                </div>
                            </div>
                        )}
                        <div className="mt-auto hidden sm:flex flex-col" >
                            <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200">
                                <ToggleTheme/>
                            </div>
                            <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={signOut}>
                                 <LogoutSharp />
                                <p className="font-medium">{t("logout")}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SidebarBase>
    )
}