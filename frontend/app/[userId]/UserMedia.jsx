'use client';
import ImageSlider from "@/components/Slider/ImageSlider";

export default function UserMedia({userData}) {
    return(
        <div className="w-full h-full">
            <div className="flex aspect-square w-full h-full">
                <ImageSlider currentUser={userData} />
            </div>
        </div>
    )
}