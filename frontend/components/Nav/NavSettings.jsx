import SidebarBase from "@/components/Sidebar/SidebarBase";
import DangerButton from "@/components/Buttons/DangerButton";
import {
    ArrowLeftSharp,
    ArrowRightSharp,
    CheckSharp,
    CloseSharp, DeleteSharp, DownloadSharp, EmailSharp, LocalOfferSharp, LocationCitySharp,
    LockSharp, LogoutSharp, NotificationsSharp, NotInterestedSharp,
    RoomSharp, SupportSharp, SyncSharp, Telegram
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
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";


export default function NavSettings({session, isSettings, setIsSettings, signOut}) {
    const fileSizeLimit = 10 * 1024 * 1024 // 10MB
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

    const [file, setFile] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)

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
                setBlacklist(data.blacklist)
                if (data.preferred_country) {
                    setPrefCountry(data.preferred_country)
                }
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

    const sentVerificationRequest = async () => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch(`api/v1/users/${session.user.user_id}/verify/`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${session.access}`
            }
        })
        if (response.status === 200) {
            return
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile.type.startsWith('image/')) {
            console.error('Selected file is not an image.')
            return
        }

        if (selectedFile.size > fileSizeLimit) {
            console.error(`File size exceeds the ${fileSizeLimit}MB limit.`)
            return
        }

        if (selectedFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFile(selectedFile)
                setImageUrl(reader.result)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    return (
        <SidebarBase show={isSettings} classes={'sm:w-[450px]'}>
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
                                <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('verify')}>
                                    <CheckSharp />
                                    <p className="font-medium">{t("verify")}</p>
                                    <div className="ms-auto">
                                        <ArrowRightSharp/>
                                    </div>
                                </div>
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

                                <div className="mt-auto hidden sm:flex flex-col">
                                    <div
                                        className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200">
                                        <ToggleTheme/>
                                    </div>
                                    <div
                                        className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200"
                                        onClick={signOut}>
                                        <LogoutSharp/>
                                        <p className="font-medium">{t("logout")}</p>
                                    </div>
                                </div>
                            </>
                        )}
                        {currPage === "verify" && (
                            <div className={`flex flex-col w-full p-5`}>
                                <label htmlFor={`verifyUser`} className={`w-full h-full`}>
                                    <div className={`bg-pink-pastel/10 hover:bg-pink-pastel/30 transition-colors duration-200 border-t-4 border-l-4 border-r-4 border-dashed rounded-t-lg border-pink-pastel min-w-full aspect-square cursor-pointer`}>
                                        {imageUrl && <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover rounded-t-lg" />}
                                    </div>
                                </label>
                                <div
                                    onClick={sentVerificationRequest}
                                    className={`flex flex-row w-full h-full p-3 items-center bg-pink-pastel rounded-b-lg cursor-pointer`}
                                >
                                    <DownloadSharp/>
                                    <p className={`font-medium`}>
                                        Submit request
                                    </p>
                                </div>
                                <p className={`mt-3 font-medium text-sm text-pastel-100`}>
                                    Only one image accepted
                                </p>
                                 <p className={`mt-3 font-medium text-sm text-pastel-100`}>
                                    Max file size - 10MB
                                </p>
                                <p className={`mt-3 font-medium`}>
                                    Lorem ipsum dolor sit amet sed tincidunt takimata nulla delenit sit tation nonummy stet.
                                    At duo consetetur sea sed duo vero ea rebum feugiat iriure sed duis sed labore eos.
                                    Et iriure sanctus nulla dolor et accusam erat nonummy sed elitr. Dolores stet sadipscing.
                                    Duo nisl eum dolor duis accumsan et dolore vero labore duo lorem. Sed erat iriure amet laoreet.
                                </p>
                                <input id={`verifyUser`} type="file" onChange={handleFileChange} />
                            </div>
                        )}
                        {currPage === "security" && (
                            <div className="p-3 flex flex-col h-full gap-5">
                                <p className="font-medium text-xl">{t("forgot password")}?</p>
                                <UnderlinedInput
                                    IconComponent={EmailSharp}
                                    iconSize={"large"}
                                    type="text"
                                    placeholder="example@email.com"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                />
                                <SecondaryButton
                                    IconComponent={CheckSharp}
                                    iconSize={"medium"}
                                    text={t("reset")}
                                    onClickHandler={resetPasswordHandler}
                                />
                                <SecondaryButton
                                    text={t("terminate all sessions")}
                                    onClickHandler={terminateAllSessions}
                                />
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
                                <UnderlinedInput
                                    IconComponent={LocationCitySharp}
                                    iconSize={"large"}
                                    type="text"
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
                            <div className="flex flex-col h-full w-full">
                                {blacklist.length > 0 ? (
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
                                ) : (
                                    <div className={`flex flex-row items-center justify-center h-full w-full`}>
                                        <p className={`font-medium text-xl`}>Тут пусто!</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {currPage === "support" && (
                            <div className="flex flex-col p-3 gap-3 font-medium">
                                <p className={`font-medium`}>Contacts: </p>
                                <div className={`flex flex-row gap-3 items-center`}>
                                    <EmailSharp fontSize={"large"} />
                                    architect.lock@outlook.com
                                </div>
                                <div className={`flex flex-row gap-3 items-center`}>
                                    <Telegram fontSize={"large"} />
                                    @JMURv
                                </div>
                            </div>
                        )}
                        {currPage === "deleteAccount" && (
                            <div className="h-full flex flex-col gap-2 p-3">
                                <p className={`font-medium`}>{t('Are you sure?')}</p>
                                <SecondaryButton text={t("delete account")} onClickHandler={deleteAccountHandler}/>
                            </div>
                        )}
                    </>
                )}
            </div>
        </SidebarBase>
    )
}
