'use client';
import {useState, useEffect} from "react";
import {
    AccountCircle,
    ArrowBackIosNewSharp,
    ArrowForwardIosSharp,
    ArrowLeftSharp,
    ArrowRightSharp,
    CalendarTodaySharp,
    EmailSharp, HeightSharp, LocationCitySharp,
    LockSharp,
    Man4Sharp, ScaleSharp,
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
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";
import ZodiacSignsData from "@/lib/zodiacSigns";
import tagsData from "@/lib/tagsData";
import {Transition} from "@headlessui/react";

export default function RegisterForm({setIsLoading, setPushNotifications}) {
    const { t } = useTranslation('user')
    const maxPages = 10
    const maxTags = 5
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [username, setUsername] = useState('')
    const [usernameErrors, setUsernameErrors] = useState(true)
    const [usernameErrorText, setUsernameErrorText] = useState('')
    const [emailErrors, setEmailErrors] = useState(true)
    const [emailErrorsText, setEmailErrorsText] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [age, setAge] = useState(0)
    const [sex, setSex] = useState('')
    const [orientation, setOrientation] = useState('')
    const [media, setMedia] = useState([])
    const [country, setCountry] = useState('')
    const [city, setCity] = useState('')
    const [zodiacSign, setZodiacSign] = useState('')
    const [selectedTags, setSelectedTags] = useState('')

    const [height, setHeight] = useState(0)
    const [weight, setWeight] = useState(0)

    const sexChoices = [
        {IconComponent: Man4Sharp, value: "m"},
        {IconComponent: Woman2Sharp, value: "w"},
    ]

    function pageIncrease(dontCheck) {
        if (page === 1 && (usernameErrors || emailErrors)){
            return
        }
        if (page === 2 && !age){
            return
        }
        if (page === 3 && !height){
            return
        }
        if (page === 4 && !weight){
            return
        }
        if (page === 5 && (!country || !city)){
            return
        }
        if (page === 6 && !sex && dontCheck){
            return
        }
        if (page === 7 && !orientation && dontCheck){
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
        formData.append('zodiac_sign', zodiacSign)

        selectedTags.forEach((tag, index) => {
            formData.append(`tag-${index}`, tag)
        })

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

    function handleAgeChange(value) {
        setAge(value)
        if (value.length > 1 && value >= 18){
            pageIncrease()
        }
    }

    function handleHeightChange(value) {
        setHeight(value)
        if (value >= 120 && value <= 250){
            pageIncrease()
        }
    }

    function handleWeightChange(value) {
        setWeight(value)
        if (value >= 10 && value <= 250){
            pageIncrease()
        }
    }

    function handleSexValue(value) {
        setSex(value)
        pageIncrease(true)
    }

    function handleOrientationValue(value) {
        setOrientation(value)
        pageIncrease(true)
    }

    function zodiacSignSelect(zodiacValue) {
        if (zodiacSign === zodiacValue){
            setZodiacSign('')
        } else {
            setZodiacSign(zodiacValue)
            pageIncrease()
        }
    }

    function handleSelectedTags(tag) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(
                tags => tags.filter(
                    selectedTag => selectedTag !== tag
                )
            )
        } else {
            const tagsLength = selectedTags.length
            if (tagsLength < maxTags) {
                if (tagsLength === maxTags - 1){
                    pageIncrease()
                }
                setSelectedTags(
                    (tags) => [...tags, tag]
                )
            }
        }
    }

    return (
        <div className="container flex flex-col justify-center items-center mx-auto max-w-[500px]">
            {/*<div className={`fixed top-0 bottom-0 left-0 right-0 bg-deep-purple duration-300 transition-all`}>*/}

            <div className="relative flex flex-col justify-center items-center gap-3 max-w-[500px] min-h-[200px] w-full h-full">
                <div className={`absolute top-0 w-full flex flex-col gap-5 duration-300 ${page === 1 ? 'translate-x-0 opacity-1' : page > 1 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <UnderlinedInput
                        IconComponent={AccountCircle}
                        iconSize="large"
                        isError={usernameErrors}
                        errorText={usernameErrorText}
                        id="username"
                        name="username"
                        type="text"
                        required
                        placeholder={t("username")}
                        value={username}
                        onChange={(e) => validateUsername(e)}
                        />

                    <UnderlinedInput
                        IconComponent={EmailSharp}
                        iconSize="large"
                        isError={emailErrors}
                        errorText={emailErrorsText}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => validateEmail(e)}
                    />

                    <UnderlinedInput
                        IconComponent={LockSharp}
                        iconSize="large"
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
                    <div className={`flex flex-col gap-3`}>
                        <p className={`font-medium text-4xl`}>{t("my age")}</p>
                        <div className={
                            `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                        }>
                        <UnderlinedInput
                            IconComponent={CalendarTodaySharp}
                            iconSize={"large"}
                            type="text"
                            placeholder={"18-60"}
                            onChange={(e) => handleAgeChange(e.target.value)}
                        />
                        </div>
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 3 ? 'translate-x-0 opacity-1' : page > 3 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <div className={`flex flex-col gap-3`}>
                        <p className={`font-medium text-4xl`}>
                            {t("my height")}
                        </p>
                        <div className={
                            `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                        }>
                            <UnderlinedInput
                                IconComponent={HeightSharp}
                                iconSize={"large"}
                                type="text"
                                placeholder={"150-200+"}
                                onChange={(e) => handleHeightChange(e.target.value)}
                        />
                        </div>
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 4 ? 'translate-x-0 opacity-1' : page > 4 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <div className={`flex flex-col gap-3`}>
                        <p className={`font-medium text-4xl`}>
                            {t("my weight")}
                        </p>
                        <div className={
                            `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                        }>
                            <UnderlinedInput
                                IconComponent={ScaleSharp}
                                iconSize={"large"}
                                type="text"
                                placeholder={"10-200+"}
                                onChange={(e) => handleWeightChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 5 ? 'translate-x-0 opacity-1' : page > 5 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className={`font-medium text-4xl`}>
                        {t("country")}
                    </p>
                    <div className={
                            `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                        }>
                    <HintsInput currValue={country} setValue={setCountry} placeholder={t("Russian Federation")} hintsData={countriesData} />
                    </div>

                    <p className={`font-medium text-4xl`}>
                        {t("city")}
                    </p>
                    <div className={
                        `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                    }>
                        <UnderlinedInput
                            IconComponent={LocationCitySharp}
                            iconSize={"large"}
                            type="text"
                            placeholder={t("Moscow")}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col items-center justify-center gap-3 duration-300 ${page === 6 ? 'translate-x-0 opacity-1' : page > 6 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className={`font-medium text-4xl`}>{t("my sex")}</p>
                    <div className={`max-w-[250px] w-full bg-pink-pastel/10 p-3 rounded-md`}>
                        <RingsInput
                            propValue={sex}
                            setValue={handleSexValue}
                            rangeItems={sexChoices}
                            name={"sex"}
                        />
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col items-center justify-center gap-5 duration-300 ${page === 7 ? 'translate-x-0 opacity-1' : page > 7 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className={`font-medium text-4xl`}>{t("my orientation")}</p>
                    <div className={`max-w-[250px] w-full bg-pink-pastel/10 p-3 rounded-md`}>
                        <RingsInput
                            propValue={orientation}
                            setValue={handleOrientationValue}
                            rangeItems={sexChoices}
                            name={"orientation"}
                            onChange={pageIncrease}
                        />
                    </div>
                </div>


                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 8 ? 'translate-x-0 opacity-1' : page > 8 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className="text-4xl font-medium text-center">{t("zodiac")}</p>
                    <div className={`flex flex-row flex-wrap justify-center items-center gap-3`}>
                        {ZodiacSignsData.map((zodiac) => (
                            <div
                                key={zodiac.value}
                                onClick={() => zodiacSignSelect(zodiac.value)}
                                className={
                                    `ring-2 ring-inset ring-pink-pastel rounded-full p-3 cursor-pointer transition-color duration-100 ` +
                                    `${zodiacSign === zodiac.value ? 'bg-pink-pastel' : 'bg-transparent'}`
                                }
                            >
                                 <p className={`font-medium text-sm`}>
                                    {t(zodiac.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`absolute top-0 w-full flex flex-col gap-3 duration-300 ${page === 9 ? 'translate-x-0 opacity-1' : page > 9 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`}>
                    <p className="text-4xl font-medium text-center">{t("tags")}</p>
                    <div className={`flex flex-row flex-wrap justify-center items-center gap-3`}>
                        {tagsData.map((tag) => (
                            <div
                                key={tag.value}
                                onClick={() => handleSelectedTags(tag.value)}
                                className={
                                    `ring-2 ring-inset ring-pink-pastel rounded-full p-3 cursor-pointer transition-color duration-100 ` +
                                    `${selectedTags.includes(tag.value) ? 'bg-pink-pastel' : 'bg-transparent'}`
                                }
                            >
                                <p className={`font-medium text-sm`}>
                                    {t(tag.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={
                    `absolute top-0 w-full flex flex-col justify-center items-center gap-3 duration-300 pointer-events-none
                    ${page === maxPages ? 'translate-x-0 opacity-1 pointer-events-auto' : page > maxPages ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'} transition-all`
                }>
                    <StaticMediaGrid files={media} setFiles={setMedia} isAuthor={true} isServer={false} />
                </div>

            </div>
            <div className="fixed bottom-0 flex flex-col gap-5">
                <div
                    className="flex flex-row justify-between items-center gap-5">
                    <div onClick={pageDecrease} className={`w-full`}>
                        <SecondaryButton
                            IconComponent={ArrowBackIosNewSharp}
                            iconSize={"medium"} disabled={page === 1}/>
                    </div>
                    <div onClick={pageIncrease} className={`w-full`}>
                        {page === maxPages ? (
                            <SecondaryButton
                                text={t("sign up")}
                                disabled={media.length === 0}
                                onClickHandler={(e) => create(e)}
                            />
                        ) : (
                            <SecondaryButton
                                IconComponent={ArrowForwardIosSharp}
                                iconSize={"medium"}/>
                        )}
                    </div>
                </div>
                <p className="mb-3 font-medium text-center text-sm text-zinc-400">
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