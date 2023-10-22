export default function DangerButton({onClickHandler, children}) {
    return (
        <div onClick={onClickHandler} className="
        rounded-full
        bg-red-400
        text-stone-100 p-2
        hover:bg-red-500
        dark:ring-2 dark:ring-inset-1 dark:ring-red-400 dark:bg-transparent dark:hover:bg-red-400
        transition-color duration-300
        ">
            {children}
        </div>
    )
}