'use client';
import {useState} from "react";
import MediaGridLoaded from "@/components/Media/MediaGridLoaded";
import ImageSlider from "@/components/Slider/ImageSlider";

export default function UserMedia({userData}) {
    const [currentSlide, setCurrentSlide] = useState(0)
    return(
        <div className="w-full h-full">
            <div className="flex aspect-square w-full h-full">
                <ImageSlider currentUser={userData} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
            </div>
        </div>
    )
}