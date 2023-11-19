import {DeleteSharp, FileCopySharp} from "@mui/icons-material";

export default function MediaGridUpload({files, setFiles}) {

    const remove = (index) => {
        const newFiles = [...files]
        newFiles.splice(index, 1)
        setFiles(newFiles)
    }

    return (
        <div className={`media-grid-base gap-3 media-grid-${files.length}`}>
            {files.map((file, index) => (
                <div key={URL.createObjectURL(file)} className={`media-wrapper rounded-xl ${index > 8 ? 'hidden' : ''}`}>
                    <div onClick={() => remove(index)} className="transition-all duration-300 text-zinc-200 absolute right-1 top-1 cursor-pointer hover:text-red-500">
                        <DeleteSharp fontSize={"small"}/>
                    </div>
                    {file.type.includes("image") ? (
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt=""/>
                    ) : (
                        file.type.includes('video') ? (
                            <video loop autoPlay controls muted src={URL.createObjectURL(file)}/>
                        ) : (
                            <a href={URL.createObjectURL(file)}>
                                <div className="flex flex-row gap-3 justify-center p-3">
                                    <FileCopySharp fontSize={"large"} />
                                    <p>{file.name}</p>
                                </div>
                            </a>
                        )
                    )}
                </div>
            ))}
        </div>
    )
}