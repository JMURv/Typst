"use client";
import {useTheme} from "next-themes";
import {DarkModeSharp, LightModeSharp} from "@mui/icons-material";
import useTranslation from "next-translate/useTranslation";

export default function ToggleTheme({noText}) {
    const { t } = useTranslation('user')
    const {systemTheme, theme, setTheme} = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;
    return (
        <button
            onClick={() => theme === "dark" ? setTheme('light') : setTheme("dark")}
            className={`flex font-medium gap-3 ${theme === "dark" ? 'text-yellow-500':'text-blue-500'}`}>
            {theme === "dark" ? (
                <LightModeSharp />
            ):(
                <DarkModeSharp />
            )}
            {!noText && (
                <>{t("toggle theme")}</>
            )}
        </button>
    )
}