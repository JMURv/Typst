export default function RingsInput({
                                       propValue,
                                       setValue,
                                       label,
                                       textSize,
                                       rangeItems,
                                       ...inputProps
                                   }) {
    return (
        <div className={`flex flex-col gap-3`}>
            {label && (
                <label
                    htmlFor=""
                    className="block text-sm text-center font-medium leading-6 text-gray-900 dark:text-gray-200">
                    {label}
                </label>
            )}
            <div
                className="flex flex-row flex-wrap gap-3 justify-between items-center px-5">
                {rangeItems.map((rangeItem, index) => (
                    <div key={index}
                         onClick={() => setValue(rangeItem.value)}
                         className={`cursor-pointer w-[75px] h-[75px] rounded-full ring-4 flex justify-center items-center ring-inset ring-pink-pastel p-3 transition-all duration-300 text-pink-pastel 
                         ${propValue === rangeItem.value ? ('text-stone-50 bg-pink-pastel') : ('hover:text-stone-50 hover:bg-pink-pastel')}`}>

                        {rangeItem.IconComponent ? (
                            <rangeItem.IconComponent sx={{fontSize: 50}}/>
                        ) : (
                            <>
                                <p className={`font-medium text-center ${textSize ? `${textSize}`:'text-5xl'}`}>{rangeItem.text}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input
                type="hidden"
                value={propValue ? propValue : ''}
                {...inputProps}
            />
        </div>
    )
}