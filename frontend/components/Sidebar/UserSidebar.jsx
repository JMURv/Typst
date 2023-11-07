'use client';
import {
    AccountCircle,
    ArrowLeftSharp, ArrowRightSharp,
    Check,
    CloseSharp, DeleteSharp, FavoriteSharp,
    Man4Sharp, MoreSharp,
    Woman2Sharp
} from "@mui/icons-material";
import IconInput from "@/components/Inputs/IconInput";
import {useEffect, useState} from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import RangeInput from "@/components/Inputs/RangeInput";
import RingsInput from "@/components/Inputs/RingsInput";
import SidebarBase from "@/components/Sidebar/SidebarBase";
import DangerButton from "@/components/Buttons/DangerButton";
import StaticMediaGrid, {UserPageStaticMediaGrid} from "@/components/Media/StaticMediaGrid";
import useTranslation from "next-translate/useTranslation";
import ZodiacSignsData from "@/lib/zodiacSigns";
import tagsData from "@/lib/tagsData";

export default function UserSidebar({session, userData, setUserData, isShowing, setIsShowing}) {
    const { t } = useTranslation('user')
    const maxTags = 5

    const [currPage, setCurrPage] = useState('main')
    const [username, setUsername] = useState(userData.username)
    const [age, setAge] = useState(userData.age)
    const [height, setHeight] = useState(userData.height)
    const [weight, setWeight] = useState(userData.weight)
    const [prefAge, setPrefAge] = useState(userData.preferred_age || "sm")
    const [prefHeight, setPrefHeight] = useState(userData.preferred_height || "sm")
    const [prefWeight, setPrefWeight] = useState(userData.preferred_weight || "sm")
    const [sex, setSex] = useState(userData.sex)
    const [about, setAbout] = useState(userData.about || '')
    const [orientation, setOrientation] = useState(userData.orientation)

    const [zodiacSign, setZodiacSign] = useState(userData.zodiac_sign.title || "")
    const [selectedTags, setSelectedTags] = useState(userData.tags.map(obj => obj.title))

    const sexChoices = [
        {IconComponent: Man4Sharp, value: "m"},
        {IconComponent: Woman2Sharp, value: "w"},
    ]

    const ageChoices = [
        {text: "18-25", value: "sm"},
        {text: "25-35", value: "md"},
        {text: "35-45", value: "lg"},
        {text: "> 45", value: "xl"},
    ]

    const heightChoices = [
        {text: "< 160", value: "sm"},
        {text: "160-175", value: "md"},
        {text: "175-185", value: "lg"},
        {text: "> 185", value: "xl"},
    ]

    const weightChoices = [
        {text: "< 50", value: "sm"},
        {text: "50-65", value: "md"},
        {text: "65-75", value: "lg"},
        {text: "> 75", value: "xl"},
    ]

    async function update(e) {
        e.preventDefault()
        const formData = new FormData()
        formData.append("username", username)
        formData.append("about", about)
        formData.append("age", age)
        formData.append("height", height)
        formData.append("weight", weight)
        formData.append("sex", sex)
        formData.append("orientation", orientation)
        formData.append("preferred_age", prefAge)
        formData.append("preferred_height", prefHeight)
        formData.append("preferred_weight", prefWeight)
        formData.append("zodiac_sign", zodiacSign)
        selectedTags.forEach((tag, index) => {
            formData.append(`tag-${index}`, tag)
        })
        const response = await fetch(`/api/v1/users/${session.user.user_id}/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${session.access}`
            },
            body: formData
        })
        if (response.ok) {
            const data = await response.json()
            setUserData(data)
        }
    }

    function handleNavigation() {
        if (currPage === 'main') {
            setIsShowing(
                (value) => !value
            )
        } else {
            setCurrPage('main')
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
            if (selectedTags.length < maxTags) {
                setSelectedTags(
                    (tags) => [...tags, tag]
                )
            }
        }
    }

    function zodiacSignSelect(zodiacValue) {
        if (zodiacSign !== zodiacValue) {
            setZodiacSign(zodiacValue)
        }
    }

    return (
        <SidebarBase show={isShowing} classes={'sm:w-[500px]'}>
            <form onSubmit={(e) => update(e)} className="">
                <div className="p-3 px-2 sm:px-10 flex items-center gap-5">
                    <DangerButton onClickHandler={handleNavigation}>
                        {currPage === "main" ? (
                            <CloseSharp/>
                        ) : (
                            <ArrowLeftSharp/>
                        )}
                    </DangerButton>
                    <PrimaryButton IconComponent={Check} iconSize={"medium"} text={t("save")}/>
                </div>
                {currPage === "main" && (
                    <div className="flex flex-col">
                        <div className="flex flex-col gap-5 px-2 sm:px-10">
                            <UserPageStaticMediaGrid
                                session={session}
                                userData={userData}
                                setUserData={setUserData}
                                isAuthor={true}
                            />
                            <IconInput
                                IconComponent={AccountCircle}
                                iconSize="medium"
                                label={t("first name")}
                                id="username"
                                name="username"
                                type="username"
                                required
                                placeholder={t("first name placeholder")}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <div>
                                <label
                                    htmlFor=""
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    {t("about")}
                                </label>
                                <textarea
                                    name="about"
                                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                                    ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                                    in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                                    rows={8}
                                    cols={1}
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    className="textarea"
                                />
                            </div>

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

                            <RingsInput
                                propValue={sex}
                                setValue={setSex}
                                label={t("my sex")}
                                rangeItems={sexChoices}
                                name={"sex"}
                            />

                            <RingsInput
                                propValue={orientation}
                                setValue={setOrientation}
                                label={t("my orientation")}
                                rangeItems={sexChoices}
                                name={"orientation"}
                            />
                        </div>

                        <div className={`mt-5 h-1 w-full bg-pink-pastel`}/>

                        <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('preferences')}>
                            <FavoriteSharp />
                            <p className="font-medium">{t("preferences")}</p>
                            <div className="ms-auto">
                                <ArrowRightSharp/>
                            </div>
                        </div>

                        <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('zodiac')}>
                            <img
                                src={`/media/defaults/zodiac/aquarius.svg`}
                                width={30}
                                height={30}
                                alt=""
                            />
                            <p className="font-medium">{t("zodiac")}</p>
                            <div className="ms-auto">
                                <ArrowRightSharp/>
                            </div>
                        </div>

                        <div className="flex flex-row p-5 gap-3 cursor-pointer hover:bg-pink-pastel/40 transition-color duration-200" onClick={() => setCurrPage('tags')}>
                            <MoreSharp />
                            <p className="font-medium">{t("tags")}</p>
                            <div className="ms-auto">
                                <ArrowRightSharp/>
                            </div>
                        </div>
                </div>
                )}

                {currPage === "preferences" && (
                    <div className={`flex flex-col gap-5 mt-5 px-2 sm:px-10`}>
                        <RingsInput
                            propValue={prefAge}
                            setValue={setPrefAge}
                            label={t("preferred age")}
                            rangeItems={ageChoices}
                            name={"preferred_age"}
                        />

                        <RingsInput
                            propValue={prefHeight}
                            setValue={setPrefHeight}
                            label={t("preferred height")}
                            rangeItems={heightChoices}
                            name={"preferred_height"}
                        />

                        <RingsInput
                            propValue={prefWeight}
                            setValue={setPrefWeight}
                            label={t("preferred weight")}
                            rangeItems={weightChoices}
                            name={"preferred_weight"}
                        />
                    </div>
                )}

                {currPage === "tags" && (
                    <div className={`flex flex-col items-center justify-center mt-5 px-2 sm:px-10`}>
                        <div className={`p-3 flex flex-row flex-wrap justify-center gap-3`}>
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
                )}

                {currPage === "zodiac" && (
                    <div className={`flex flex-col items-center justify-center mt-5 px-2 sm:px-10`}>
                        <div className={`p-3 flex flex-row flex-wrap justify-center gap-3`}>
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
                )}
            </form>
        </SidebarBase>
    )
}