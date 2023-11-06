export default function ScreenSlider({screenId, currScreen, bgColor, children}) {
    return (
        <div className={
            `fixed top-0 bottom-0 left-0 right-0 w-full duration-500 ease-in-out transition-all ${bgColor} ` +
            `${currScreen === screenId ? 'translate-x-0' : currScreen > screenId ? '-translate-x-full' : 'translate-x-full'}`
        }>
            {children}
        </div>
    )
}