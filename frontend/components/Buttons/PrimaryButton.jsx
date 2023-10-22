'use client';

export default function PrimaryButton({IconComponent, iconSize, text, onClickHandler}) {
    return (
        <button
            className="w-full dark:ring-2 dark:ring-inset-1 dark:ring-light-purple dark:bg-transparent rounded-full px-10 py-2 font-medium bg-pink-pastel hover:bg-light-purple dark:hover:bg-light-purple text-stone-100 transition-color duration-300"
            onClick={onClickHandler}
        >
            <div className="flex flex-row gap-3 justify-center items-center">
                {IconComponent && <IconComponent fontSize={iconSize}/>}
                {text && text}
            </div>
        </button>
    )
}