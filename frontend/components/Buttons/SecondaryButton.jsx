'use client';

export default function SecondaryButton({IconComponent, iconSize, text, reversed, disabled, onClickHandler}) {
    return (
        <button
            className={`w-full rounded-md p-3 font-medium ${disabled ? 'bg-transparent ring-2 ring-inset ring-pink-pastel':'bg-pink-pastel hover:bg-pink-pastel/60'} text-stone-100 transition-color duration-300`}
            onClick={onClickHandler}
            disabled={disabled}
        >
            <div className={`flex ${reversed ? 'flex-row-reverse':'flex-row'} gap-3 justify-center items-center`}>
                {IconComponent && <IconComponent fontSize={iconSize}/>}
                {text && text}
            </div>
        </button>
    )
}