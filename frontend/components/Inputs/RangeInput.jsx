export default function RangeInput({value, label, ...inputProps}) {
    return (
        <div>
            <label
                htmlFor=""
                className="block text-sm text-center font-medium leading-6 text-gray-900 dark:text-gray-200">
                {label}
            </label>
            <div className="flex flex-row items-center justify-center gap-3">
                <div>
                    <p className="font-medium">{value}</p>
                </div>
                <div className="w-full">
                    <input
                        type="range"
                        className="range-input"
                        defaultValue={value}
                        {...inputProps}
                    />
                </div>
            </div>
        </div>
    )
}