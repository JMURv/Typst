import {DeleteSharp, FileCopySharp} from "@mui/icons-material";
import {useRef, useEffect} from "react";
import {Fancybox as NativeFancybox} from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";


export default function MediaGridLoaded({files, setFiles, removeCallBack, isAuthor, gap}) {
    const FancyboxRef = useRef(null)

    async function remove(mediaId) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== mediaId))
        await removeCallBack(mediaId)
    }

    useEffect(() => {
        const container = FancyboxRef.current
        const options = {
            Carousel: {
                infinite: false,
            }
        }
        NativeFancybox.bind(container, "[data-fancybox]", options)
        return () => {
            NativeFancybox.unbind(container)
            NativeFancybox.close()
        }
    }, [])

    return (
        files.length > 0 ? (
            <div ref={FancyboxRef} className={`grid h-full w-full gap-${gap} media-grid-${files.length}`}>
                {files.map((file) => (
                    <div key={file.id} className={`media-wrapper hover:z-20 ${gap ? 'rounded-xl':''}`}>
                        {isAuthor && (
                            <div onClick={() => remove(file.id)}
                                 className="transition-all duration-300 text-zinc-200 absolute right-1 top-1 cursor-pointer hover:text-red-500">
                                <DeleteSharp fontSize={"small"}/>
                            </div>
                        )}
                        {file.type.includes("image") ? (
                            <a data-fancybox="gallery" className="w-full h-full object-cover" href={file.relative_path}>
                                <img loading={"lazy"} src={file.relative_path} width={1450} height={1450} className="w-full h-full object-cover" alt=""/>
                            </a>
                        ) : (
                            file.type.includes('video') ? (
                                <video
                                    loop
                                    autoPlay
                                    controls
                                    muted
                                    src={file.file}
                                    className="post-video"
                                />
                            ) : (
                                <div className="flex flex-row gap-3 justify-center p-3">
                                    <FileCopySharp fontSize={"large"} />
                                    <p>{file.file_name}</p>
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
        ) : null)
}