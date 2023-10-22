export default function Switch({label, value, setValue}) {
    return(
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value={value} onChange={() => setValue((currValue) => !currValue)} className="sr-only peer" checked={value}/>
            <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-purple-500/70 dark:peer-focus:ring-purple-500/70 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full
                peer-checked:after:border-white after:content-['']
                after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:border-gray-300 after:border
                after:rounded-full after:h-5 after:w-5 after:transition-all
                dark:border-gray-600 peer-checked:bg-purple-500"/>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {label}
            </span>
        </label>
    )
}