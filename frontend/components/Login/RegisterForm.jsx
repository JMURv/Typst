'use client';
import {useState, useEffect} from "react";
import {
    AccountCircle, ArrowBackIosNewSharp, ArrowForwardIosSharp, ArrowLeftSharp, ArrowRightSharp,
    EmailSharp,
    LockSharp,
    Man4Sharp,
    Woman2Sharp
} from '@mui/icons-material';
import IconInput from "@/components/Inputs/IconInput";
import {useRouter} from "next/navigation";
import RangeInput from "@/components/Inputs/RangeInput";
import RingsInput from "@/components/Inputs/RingsInput";
import getUserLocation from "@/lib/getUserLocation";
import StaticMediaGrid from "@/components/Media/StaticMediaGrid";
import countriesData from "@/lib/countries";
import HintsInput from "@/components/Inputs/HintsInput";
import useTranslation from "next-translate/useTranslation";
import {signIn} from "next-auth/react";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export default function RegisterForm({setIsLoading, setPushNotifications}) {
    const { t } = useTranslation('user')
    const maxPages = 6
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [username, setUsername] = useState('')
    const [usernameErrors, setUsernameErrors] = useState(false)
    const [usernameErrorText, setUsernameErrorText] = useState('')
    const [emailErrors, setEmailErrors] = useState(false)
    const [emailErrorsText, setEmailErrorsText] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [age, setAge] = useState(18)
    const [sex, setSex] = useState('')
    const [orientation, setOrientation] = useState('')
    const [media, setMedia] = useState([])
    const [country, setCountry] = useState('')
    const [city, setCity] = useState('')

    const [height, setHeight] = useState(160)
    const [weight, setWeight] = useState(40)

    const sexChoices = [
        {IconComponent: Man4Sharp, value: "m"},
        {IconComponent: Woman2Sharp, value: "w"},
    ]

    function pageIncrease() {
        if (page === 1 && (usernameErrors || emailErrors)){
            return
        }
        if (page === 2 && (!height || !weight)){
            return
        }
        if (page === 3 && (!country || !city)){
            return
        }
        if (page === 4 && !sex){
            return
        }
        if (page === 5 && !orientation){
            return
        }
        if (page === maxPages) {
            return
        }
        setPage((prevState) => prevState + 1)
    }

    function pageDecrease() {
        if (page === 1) {
            return
        }
        setPage((prevState) => prevState - 1)
    }

    async function create(event) {
        event.preventDefault()
        setIsLoading(true)
        // TODO: Добавлять айпи сессии
        const formData = new FormData()
        formData.append('username', username)
        formData.append('email', email)
        formData.append('password', password)
        formData.append('age', age)
        formData.append('sex', sex)
        formData.append('orientation', orientation)
        formData.append('country', country)
        formData.append('city', city)
        formData.append('height', height)
        formData.append('weight', weight)
        media.forEach((file, index) => {
            formData.append(`media-${index}`, file)
        })
        try {
            const response = await fetch('/api/v1/users/', {
                method: "POST",
                body: formData
            })
            if (response.status === 201) {
                const data = await response.json()
                await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                })
                return router.push(`/${data.user_id}`)
            }
            else {
                const errors = await response.json()
                for (const key in errors) {
                    if (errors.hasOwnProperty(key)) {
                        for (const error of errors[key]) {
                            setPushNotifications(
                                (prevNoty) => [...prevNoty, {
                                    id: new Date().toISOString(),
                                    message: `${t("Error for")} ${key}: ${error}`
                                }]
                            )
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error with the server connection: ${e}`)
            setPushNotifications(
                (prevNoty) => [...prevNoty, {
                    id: new Date().toISOString(),
                    message: `${t("Error with the server connection")}`
                }]
            )
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getUserLocation()
            .then((locationData) => {
                setCountry(locationData.countryCode)
                setCity(locationData.city)
            })
            .catch((error) => {
                console.error('Error getting user location:', error)
            })
    }, [])

    async function validateUsername(e){
        const inputValue = e.target.value
        setUsername(inputValue)

        if (inputValue.length <= 3) {
            setUsernameErrors(true)
            setUsernameErrorText(t("Minimum 4 characters"))
            return
        }

        const usernameRegex = /^[\wа-яА-Я]+$/
        if (!usernameRegex.test(inputValue)) {
            setUsernameErrors(true)
            setUsernameErrorText(t("Username must contain only one word"))
            return
        }

        const formData = new FormData
        formData.append("username", inputValue)
        const response = await fetch('/api/v1/users/check-username/', {
            method: "POST",
            body: formData
        })
        const {username_exists} = await response.json()
        if (username_exists){
            setUsernameErrors(true)
            setUsernameErrorText(t("Username already taken"))
            return
        }
        setUsernameErrorText('')
        setUsernameErrors(false)
    }

    async function validateEmail(e){
        const inputValue = e.target.value
        setEmail(inputValue)

        if (inputValue.length <= 3) {
            setEmailErrors(true)
            setEmailErrorsText("")
            return
        }

        const emailRegex = /^[a-zA-Z0-9а-яА-Я._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            setEmailErrors(true)
            setEmailErrorsText(t("E-mail is not valid"))
            return
        }

        const formData = new FormData
        formData.append("email", inputValue)
        const response = await fetch('/api/v1/users/check-email/', {
            method: "POST",
            body: formData
        })
        const {email_exists} = await response.json()
        if (email_exists){
            setEmailErrors(true)
            setEmailErrorsText(t("E-mail is already taken"))
            return
        }
        setEmailErrors(false)
        setEmailErrorsText("")
    }

    return (
        <div className="relative flex flex-col justify-between min-h-[350px] gap-5">
            <form onSubmit={(e) => create(e)} className="flex flex-col gap-3">
                <div className={`absolute top-0 w-full flex flex-col gap-5 duration-300 ${page === 1 ? 'translate-x-0 opacity-1' : page > 1 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <IconInput
                        IconComponent={AccountCircle}
                        iconSize="medium"
                        isError={usernameErrors}
                        errorText={usernameErrorText}
                        id="username"
                        name="username"
                        type="username"
                        required
                        placeholder={t("username")}
                        value={username}
                        onChange={(e) => validateUsername(e)}
                    />
                    <IconInput
                        IconComponent={EmailSharp}
                        iconSize="medium"
                        isError={emailErrors}
                        errorText={emailErrorsText}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Example@email.com"
                        value={email}
                        onChange={(e) => validateEmail(e)}
                    />
                    <IconInput
                        IconComponent={LockSharp}
                        iconSize="medium"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 2 ? 'translate-x-0 opacity-1' : page > 2 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <RangeInput
                        value={age}
                        label={t("my age")}
                        name="age"
                        min={18} max={60} step={1}
                        onChange={(e) => setAge(e.target.value)}
                    />

                    <RangeInput
                        value={height}
                        label={t("my height")}
                        name="height"
                        min={160} max={200} step={1}
                        onChange={(e) => setHeight(e.target.value)}
                    />

                    <RangeInput
                        value={weight}
                        label={t("my weight")}
                        name="weight"
                        min={40} max={100} step={1}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 3 ? 'translate-x-0 opacity-1' : page > 3 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className="text-sm font-medium">{t("country")}</p>
                    <HintsInput currValue={country} setValue={setCountry} hintsData={countriesData} />
                    <p className="text-sm font-medium">{t("city")}</p>
                    <input type="text" className="base-input" placeholder="Moscow" value={city} onChange={(e) => setCity(e.target.value)}/>
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 4 ? 'translate-x-0 opacity-1' : page > 4 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <RingsInput
                        propValue={sex}
                        setValue={setSex}
                        label={t("my sex")}
                        rangeItems={sexChoices}
                        name={"sex"}
                        onChange={pageIncrease}
                    />
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 5 ? 'translate-x-0 opacity-1' : page > 5 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <RingsInput
                        propValue={orientation}
                        setValue={setOrientation}
                        label={t("my orientation")}
                        rangeItems={sexChoices}
                        name={"orientation"}
                        onChange={pageIncrease}
                    />
                </div>

                {page === maxPages &&(
                    <div className="">
                        <StaticMediaGrid files={media} setFiles={setMedia} isAuthor={true} isServer={false} />
                    </div>
                )}
            </form>

            <div className="flex flex-col gap-5">
                <div className="flex flex-row justify-between items-center gap-5">
                    <div onClick={pageDecrease} className={`w-full`}>
                        <SecondaryButton IconComponent={ArrowBackIosNewSharp} iconSize={"medium"} disabled={page === 1} />
                    </div>
                    <div onClick={pageIncrease} className={`w-full`}>
                        {page === maxPages ? (
                            <SecondaryButton
                                text={t("sign up")}
                                disabled={media.length === 0}
                                onClickHandler={(e) => create(e)}
                            />
                        ):(
                            <SecondaryButton IconComponent={ArrowForwardIosSharp} iconSize={"medium"} />
                        )}
                    </div>
                </div>
                <p className="font-medium text-center text-sm text-zinc-400">
                    {t("have an account")}?
                    <a
                        onClick={() => router.push('/')}
                        className="font-medium cursor-pointer leading-6 text-pink-pastel ml-3 hover:text-pink-pastel/80">
                        {t("login")}
                    </a>
                </p>
            </div>
        </div>

    )
}