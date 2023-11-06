
export default function UnderlinedInput({
                                      IconComponent,
                                      iconSize,
                                      isError,
                                      errorText,
                                      label,
                                      ...inputProps
                                  }) {
    return (
        <div className={
            `relative flex flex-row items-center justify-center border-pink-pastel border-b-2 ps-3 rounded-t-md py-2 `+
            `${isError !== undefined && (!isError ? 'border-green-500 dark:border-green-500': 'border-red-400 dark:border-red-400')}`
        }>
            {IconComponent && (
                <IconComponent fontSize={iconSize}/>
            )}
            <input
                className={`mr-3 p-3 pb-0 pt-0 text-xl appearance-none bg-transparent border-none w-full text-zinc-100 font-medium placeholder:text-gray-400 placeholder:font-medium leading-tight focus:outline-none`}
                {...inputProps}
            />
            {isError && (
                <div className="absolute bottom-full left-0 ">
                    <p className="font-medium text-sm text-red-400">{errorText}</p>
                </div>
            )}
        </div>
    )
}