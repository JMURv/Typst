'use client';
import {useState, useEffect, useRef} from "react";
import { useReCaptcha } from "next-recaptcha-v3";
import {
    AccountCircle,
    ArrowBackIosNewSharp,
    ArrowForwardIosSharp,
    CalendarTodaySharp,
    EmailSharp, HeightSharp, LocationCitySharp,
    LockSharp,
    Man4Sharp, ScaleSharp,
    Woman2Sharp
} from '@mui/icons-material';
import {useRouter} from "next/navigation";
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
import ScreenSlider from "@/components/Slider/ScreenSlider";
import CodeInput from "@/components/Inputs/CodeInput";


export default function RegisterForm({setIsLoading, setPushNotifications}) {
    const { t } = useTranslation('user')
    const maxPages = 11
    const maxTags = 5
    const router = useRouter()
    const registerKey = useRef()
    const [page, setPage] = useState(1)
    const [username, setUsername] = useState('')
    const [usernameErrors, setUsernameErrors] = useState(true)
    const [usernameErrorText, setUsernameErrorText] = useState('')
    const [emailErrors, setEmailErrors] = useState(true)
    const [emailErrorsText, setEmailErrorsText] = useState('')
    const [email, setEmail] = useState('')
    const [emailConfirmed, setEmailConfirmed] = useState(false)
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

    const [isNextUnavaliable, setIsNextUnavaliable] = useState(true)
    const [isEmailSent, setIsEmailSent] = useState(false)

    const [digits, setDigits] = useState(['', '', '', ''])

    const { executeRecaptcha } = useReCaptcha()

    const sexChoices = [
        {IconComponent: Man4Sharp, value: "m"},
        {IconComponent: Woman2Sharp, value: "w"},
    ]

    const orientationChoices = [
        {IconComponent: Man4Sharp, value: "m"},
        {text: "BI", value: "bi"},
        {IconComponent: Woman2Sharp, value: "w"},
    ]

    useEffect(() => {
        if (page === 1 && (usernameErrors || emailErrors)) {
            setIsNextUnavaliable(true)
            return
        } else if (page === 2 && !emailConfirmed) {
            setIsNextUnavaliable(true)
            return
        } else if (page === 3 && !age) {
            setIsNextUnavaliable(true)
            return
        } else if (page === 4 && !height){
            setIsNextUnavaliable(true)
            return
        } else if (page === 5 && !weight){
            setIsNextUnavaliable(true)
            return
        } else if (page === 6 && (!country || !city)){
            setIsNextUnavaliable(true)
            return
        } else if (page === 7 && sex.length === 0){
            setIsNextUnavaliable(true)
            return
        } else if (page === 8 && !orientation){
            setIsNextUnavaliable(true)
            return
        } else if (page === maxPages) {
            setIsNextUnavaliable(true)
            return
        }
        setIsNextUnavaliable(false)
    }, [page, usernameErrors, emailConfirmed, emailErrors, age, height, weight, country, city, sex, orientation])

    function pageIncrease(dontCheck) {
        if (page === 1 && (usernameErrors || emailErrors)){
            return
        }
        if (page === 3 && !age){
            return
        }
        if (page === 4 && !height){
            return
        }
        if (page === 5 && !weight){
            return
        }
        if (page === 6 && (!country || !city)){
            return
        }
        if (page === 7 && !sex && dontCheck){
            return
        }
        if (page === 8 && !orientation && dontCheck){
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

    async function getActivationCode() {
        setIsLoading(true)
        const recaptchaToken = await executeRecaptcha('email_activate')
        registerKey.current = new Date().toISOString()
        try {
            const response = await fetch(`/api/v1/services/activation/?key=${registerKey.current}&email=${email}&captcha=${recaptchaToken}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })
            if (response.status === 200) {
                setIsLoading(false)
                setIsEmailSent(true)
                setPushNotifications(
                    (prevNoty) => [...prevNoty, {
                        id: new Date().toISOString(),
                        message: `${t("email has been sent")}`
                    }]
                )
            } else {
                setIsLoading(false)
                setPushNotifications(
                    (prevNoty) => [...prevNoty, {
                        id: new Date().toISOString(),
                        message: `${t("reCAPTCHA failed")}`
                    }]
                )
            }
        } catch (e) {
            setIsLoading(false)
            console.error(`Error with the server connection: ${e}`)
            setPushNotifications(
                (prevNoty) => [...prevNoty, {
                    id: new Date().toISOString(),
                    message: `${t("server error")}`
                }]
            )
        }
    }

    async function create(event) {
        event.preventDefault()
        setIsLoading(true)

        const recaptchaToken = await executeRecaptcha('register')
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
        formData.append('captcha', recaptchaToken)

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

        const emailRegex = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/
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

    useEffect(() => {
        if (isEmailSent) {
            setTimeout(() => {
                setIsEmailSent(false)
            }, 15000)
        }
    }, [isEmailSent])

    useEffect(() => {
        const code = digits.join('')
        if (code.length === 4) {
            const checkCode = async () => {
                const response = await fetch(`api/v1/services/activation/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        {
                            code: code,
                            key: registerKey.current
                        }
                    )
                })
                if (response.status === 200){
                    pageIncrease()
                    setEmailConfirmed(true)
                    setPushNotifications(
                        (prevNoty) => [...prevNoty, {
                            id: new Date().toISOString(),
                            message: `${t("success")}`
                        }]
                    )
                } else {
                    setPushNotifications(
                        (prevNoty) => [...prevNoty, {
                            id: new Date().toISOString(),
                            message: `${t("code error")}`
                        }]
                    )
                }
            }
            checkCode()
        }
    }, [digits])

    return (
        <div className="container flex flex-col justify-center items-center mx-auto">

            <div className="w-full h-full">

                <ScreenSlider screenId={1} currScreen={page} bgColor={'bg-purple-200'}>
                    <div className="flex flex-col justify-center items-center mx-auto gap-5 max-w-[500px] w-full h-full">
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
                </ScreenSlider>

                <ScreenSlider screenId={2} currScreen={page} bgColor={'bg-purple-200'}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
                        <p className={`font-medium text-4xl mb-3`}>
                            {t("email code")}
                        </p>
                        <div className={`flex flex-row gap-2 max-w-[400px] max-h-[100px] h-full w-full`}>
                            <CodeInput digits={digits} setDigits={setDigits} />
                        </div>
                        <div className={`max-w-[200px] mt-3 w-full`}>
                            <SecondaryButton
                                text={t("send email")}
                                disabled={isEmailSent}
                                onClickHandler={getActivationCode}
                            />
                        </div>
                    </div>
                </ScreenSlider>


                <ScreenSlider screenId={3} currScreen={page} bgColor={"bg-purple-200"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
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
                </ScreenSlider>

                <ScreenSlider screenId={4} currScreen={page} bgColor={"bg-purple-100"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
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
                </ScreenSlider>

                <ScreenSlider screenId={5} currScreen={page} bgColor={"bg-purple-200"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
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
                </ScreenSlider>

                <ScreenSlider screenId={6} currScreen={page} bgColor={"bg-purple-100"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
                        <p className={`font-medium text-4xl`}>
                            {t("country")}
                        </p>
                        <div className={
                            `bg-pink-pastel/10 justify-center items-center rounded-md p-3`
                        }>
                            <HintsInput
                                currValue={country}
                                setValue={setCountry}
                                placeholder={t("Russian Federation")}
                                hintsData={countriesData}
                            />
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
                </ScreenSlider>

                <ScreenSlider screenId={7} currScreen={page} bgColor={"bg-purple-200"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
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
                </ScreenSlider>

                <ScreenSlider screenId={8} currScreen={page} bgColor={"bg-purple-100"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
                        <p className={`font-medium text-4xl`}>{t("my orientation")}</p>
                        <div className={`max-w-[350px] w-full bg-pink-pastel/10 p-3 rounded-md`}>
                            <RingsInput
                                propValue={orientation}
                                setValue={handleOrientationValue}
                                rangeItems={orientationChoices}
                                name={"orientation"}
                                onChange={pageIncrease}
                            />
                        </div>
                    </div>
                </ScreenSlider>

                <ScreenSlider screenId={9} currScreen={page} bgColor={"bg-purple-200"}>
                    <div className={`flex flex-col justify-center items-center max-w-[350px] mx-auto w-full h-full gap-3`}>
                        <p className="text-4xl font-medium text-center">{t("zodiac")}</p>
                        <div className={`flex flex-row flex-wrap justify-center items-center gap-3`}>
                            {ZodiacSignsData.map((zodiac) => (
                                <div
                                    key={zodiac.value}
                                    onClick={() => zodiacSignSelect(zodiac.value)}
                                    className={
                                        `flex flex-row gap-3 ring-2 ring-inset ring-pink-pastel rounded-full p-3 cursor-pointer transition-color duration-100 ` +
                                        `${zodiacSign === zodiac.value ? 'bg-pink-pastel' : 'bg-transparent'}`
                                    }
                                >
                                    <img
                                        src={`/media/defaults/zodiac/${zodiac.value}.svg`}
                                        width={20}
                                        height={20}
                                        alt=""
                                    />
                                     <p className={`font-medium text-sm`}>
                                        {t(zodiac.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScreenSlider>

                <ScreenSlider screenId={10} currScreen={page} bgColor={"bg-purple-100"}>
                    <div className={`flex flex-col justify-center items-center max-w-[550px] mx-auto w-full h-full gap-3`}>
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
                </ScreenSlider>

                <ScreenSlider screenId={11} currScreen={page} bgColor={"bg-purple-200"}>
                    <div className={`flex flex-col justify-center items-center mx-auto w-full h-full gap-3`}>
                        <StaticMediaGrid files={media} setFiles={setMedia} isAuthor={true} isServer={false} />
                    </div>
                </ScreenSlider>

            </div>
            <div className="fixed bottom-0 flex flex-col gap-5">
                <div className="flex flex-row justify-between items-center gap-5">
                    <div onClick={pageDecrease} className={`w-full`}>
                        <SecondaryButton
                            IconComponent={ArrowBackIosNewSharp}
                            iconSize={"medium"}
                            disabled={page === 1}
                        />
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
                                iconSize={"medium"}
                                disabled={isNextUnavaliable}
                            />
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