'use client';
import UserSidebar from "@/components/Sidebar/UserSidebar";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {EditSharp} from "@mui/icons-material";
import {useState} from "react";
import useTranslation from "next-translate/useTranslation";

export default function UserUpdate({session, userData, setUserData}) {
    const { t } = useTranslation('user')
    const [isShowing, setIsShowing] = useState(false)
    return (
        <>
            <UserSidebar
                session={session}
                userData={userData}
                setUserData={setUserData}
                isShowing={isShowing}
                setIsShowing={setIsShowing}
            />
            <div className="ms-auto w-1/2 lg:w-1/3">
                <PrimaryButton
                    IconComponent={EditSharp}
                    iconSize={"medium"}
                    text={t("change profile")}
                    onClickHandler={() => setIsShowing((isShowing) => !isShowing)}
                />
            </div>
        </>
    )
}