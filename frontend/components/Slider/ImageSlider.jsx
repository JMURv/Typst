import {
    KeyboardArrowLeftSharp,
    KeyboardArrowRightSharp
} from "@mui/icons-material";
import {useEffect, useState} from "react";

export default function ImageSlider({currentUser}) {
    const [currentSlide, setCurrentSlide] = useState(0)

    function nextSlide(){
        if (currentSlide + 1 >= currentUser.media.length) return
        setCurrentSlide((value) => value + 1)
    }

    function prevSlide() {
        if (currentSlide - 1 < 0) return
        setCurrentSlide((value) => value - 1)
    }

    useEffect(() => {
        if (currentSlide >= currentUser.media.length){
            setCurrentSlide((value) => value - 1)
        }
    }, [currentUser.media.length])

    return (
        currentUser.media && (
            <div className="relative h-full w-full">
                <div className="rounded-3xl overflow-hidden w-full h-full">
                    <button type="button"
                        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                        onClick={() => prevSlide()}>
                            <span className="inline-flex items-center text-zinc-100 justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-white group-focus:outline-none dark:group-focus:ring-zinc-400">
                                <KeyboardArrowLeftSharp fontSize={"large"} />
                                <span className="sr-only">Previous</span>
                            </span>
                    </button>
                    <button type="button" className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                        onClick={() => nextSlide()}>
                            <span className="inline-flex items-center text-zinc-100 justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-white group-focus:outline-none dark:group-focus:ring-zinc-400">
                                <KeyboardArrowRightSharp fontSize={"large"} />
                                <span className="sr-only">Next</span>
                            </span>
                    </button>
                    <div className="absolute z-30 flex flex-row gap-3 top-5 w-full justify-between items-center px-5">
                        {currentUser.media.map((image, index) => (
                            <button key={image.id} className={`w-full cursor-default h-2 rounded-full ${currentSlide === index ? 'bg-zinc-300' : 'bg-zinc-400/60'}`}/>
                        ))}
                    </div>
                    <div className="relative w-full h-full">
                        {currentUser.media.map((image, index) => (
                            <div key={image.id} className={`w-full h-full absolute top-0 left-0 duration-500 ${currentSlide === index ? 'translate-x-0' : currentSlide > index ? '-translate-x-full' : 'translate-x-full'} transition-transform`}>
                                <img src={image.relative_path} className={`object-cover w-full h-full`}
                                     alt=""/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )

    )
}
