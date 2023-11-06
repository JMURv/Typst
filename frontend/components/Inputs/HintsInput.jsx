'use client';
import {useEffect, useState} from "react";
import {
    ExpandMoreSharp,
    FlagSharp,
} from "@mui/icons-material";
import useTranslation from "next-translate/useTranslation";
import UnderlinedInput from "@/components/Inputs/UnderlinedInput";

export default function HintsInput({currValue, setValue, placeholder, hintsData}) {
    const { t, lang } = useTranslation('user')
    const [inputValue, setInputValue] = useState(currValue || '')
    const [showHints, setShowHints] = useState(false)

    const handleItemSelect = (item) => {
        setInputValue(t(item.value))
        setValue(item.code)
        setShowHints(false)
    }

    const filteredHints = hintsData.filter((item) =>
        t(item.value).toLowerCase().includes(inputValue.toLowerCase())
    )

    useEffect(() => {
        setInputValue(currValue)
    }, [currValue])

    return (
        <div className="relative z-40">
            <div className="relative">
                <UnderlinedInput
                    IconComponent={FlagSharp}
                    iconSize={"large"}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        setInputValue(inputValue)
                        setShowHints(inputValue.length > 0)
                    }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2" onClick={() => setShowHints((value) => !value)}>
                    <ExpandMoreSharp className="h-5 w-5 text-gray-400"/>
                </div>
            </div>
            {showHints && (
                <div className="absolute mt-1 max-h-40 w-full overflow-auto rounded-md bg-zinc-100 ring-[1.5px] ring-inset ring-gray-300 dark:ring-pink-pastel bg-gray-100 dark:bg-purple-100 text-base focus:outline-none sm:text-sm">
                    {filteredHints.length === 0 ? (
                        <div className="py-2 pl-4 text-gray-600 font-medium dark:text-zinc-200">
                            Nothing found
                        </div>
                    ) : (
                        filteredHints.map((item) => (
                            <div
                                key={item.value}
                                className="border-0 outline-none focus:outline-none relative cursor-default select-none p-3 text-gray-900 dark:text-zinc-200 hover:text-zinc-100 hover:bg-pink-pastel hover:dark:text-zinc-200 transition-color duration-200 font-medium"
                                onClick={() => handleItemSelect(item)}
                            >
                                 {t(item.value)}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}