export default function IconInput({IconComponent, iconSize, isError, errorText, label, ...inputProps}) {
    return (
        <div className="w-full">
            <label
                htmlFor=""
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                {label && label}
            </label>
            <div className="relative">
                <div
                    className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-pink-pastel dark:text-stone-50">
                    <IconComponent fontSize="medium"/>
                </div>
                {isError !== undefined ? (
                    <>
                        <input
                            {...inputProps}
                            className={`icon-input ${!isError ? 'ring-green-500 dark:ring-green-500' : 'ring-red-400 dark:ring-red-400'}`}
                        />
                        {isError && (
                            <div className="absolute bottom-full left-0 ">
                                <p className="font-medium text-sm text-red-400">{errorText}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <input
                        {...inputProps}
                        className={`icon-input`}
                    />
                )}

            </div>
        </div>
    )
}