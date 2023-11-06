import {DeleteSharp} from "@mui/icons-material";
import {useDropzone} from "react-dropzone";
import {useCallback} from "react";


export function UserPageStaticMediaGrid({session, userData, setUserData, isAuthor}) {
    const filesLength = userData.media.length
    let maxItems = 4
    const maxSizeInMB = 80

    if (filesLength < 2) {
        maxItems = 4
    } else if (filesLength >= 2 && filesLength < 4) {
        maxItems = 4
    } else if (filesLength >= 4) {
        maxItems = 6
    }

    async function serverRemove(mediaId) {
        setUserData((prevUserData) => ({
            ...prevUserData,
            media: prevUserData.media.filter((file) => file.id !== mediaId)
        }))
        try {
            const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({mediaId: mediaId})
            })
            if (response.ok) {
                console.log('File successfully deleted')
            }
            else console.error('File delete failed')
        } catch (e) {
            console.error(`Error occurred: ${e}`)
        }
    }

    async function loadNewFile(file) {
        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access}`
                },
                body: formData
            })
            if (response.ok) {
                const data = await response.json()
                console.log('File successfully uploaded')
                setUserData((prevUserData) => ({
                    ...prevUserData,
                    media: [...prevUserData.media, data]
                }))
            }
            else console.error('File upload failed')
        } catch (e) {
            console.error(`Error occurred: ${e}`)
        }
    }

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        const fileCount = userData.media.length
        if (fileCount >= 6) return
        acceptedFiles.forEach((file) => {
            return loadNewFile(file)
        })
        if (rejectedFiles.length > 0) {
            const maxSizeError = `File size exceeds the maximum allowed (${maxSizeInMB}MB).`;
        }
    }, [loadNewFile, userData.media.length])
    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        maxFiles: 6,
        noClick: true,
        noKeyboard: true,
        maxSize: maxSizeInMB * 1024 * 1024
    })
    return(
        <div {...getRootProps()} className={`w-full min-h-[250px] flex flex-wrap gap-3`}>
            {[...Array(maxItems)].map((_, index) => {
                const file = userData.media[index]
                return (
                    <label key={index} htmlFor="file-input" className="w-[48%] h-[200px] border-2 border-pink-pastel border-dashed rounded-lg overflow-hidden relative">
                        {file && file.type.includes("image") ? (
                            <div className="h-full w-full max-h-[200px]">
                                {isAuthor && filesLength > 1 && (
                                    <div
                                        onClick={(e) => {e.preventDefault();serverRemove(file.id)}}
                                        className="transition-all duration-300 text-gray-200 absolute right-1 top-1 cursor-pointer hover:text-red-400"
                                    >
                                        <DeleteSharp fontSize={"small"}/>
                                    </div>
                                )}
                                <img loading={"lazy"} src={file.relative_path} alt="" width={450} height={450} className="h-full w-full object-cover rounded-lg"/>
                            </div>
                        ) : (
                            <div className="h-full w-full bg-gray-300/50 dark:bg-gray-600/50 rounded-lg hover:bg-gray-400/50 hover:dark:bg-gray-700/50 transition-all duration-300"/>
                        )}
                    </label>
                )
            })}
            <input id="file-input" {...getInputProps()} />
        </div>
    )
}

export default function StaticMediaGrid({session, files, setFiles, userData, setUserData, isAuthor, isServer}) {
    const filesLength = files.length
    let maxItems = 4
    const maxSizeInMB = 80

    if (filesLength < 2) {
        maxItems = 4
    } else if (filesLength >= 2 && filesLength < 4) {
        maxItems = 4
    } else if (filesLength >= 4) {
        maxItems = 4
    }

    async function serverRemove(mediaId) {
        setFiles(
            (prevFiles) => prevFiles.filter((file) => file.id !== mediaId)
        )
        setUserData((prevUserData) => ({
            ...prevUserData,
            media: prevUserData.media.filter((file) => file.id !== mediaId)
        }))
        try {
            const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({mediaId: mediaId})
            })
            if (response.ok) {
                console.log('File successfully deleted')
            }
            else console.error('File delete failed')
        } catch (e) {
            console.error(`Error occurred: ${e}`)
        }
    }

    function localRemove (index) {
        const newFiles = [...files]
        newFiles.splice(index, 1)
        setFiles(newFiles)
    }

    async function loadNewFile(file) {
        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access}`
                },
                body: formData
            })
            if (response.ok) {
                const data = await response.json()
                console.log('File successfully uploaded')
                if (setUserData){
                    setUserData((prevUserData) => ({
                        ...prevUserData,
                        media: [...prevUserData.media, data]
                    }))
                } else {
                    setFiles((prevFiles) => [...prevFiles, data])
                }
            }
            else console.error('File upload failed')
        } catch (e) {
            console.error(`Error occurred: ${e}`)
        }
    }

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        let fileCount = 0
        if (setUserData){
            fileCount = userData.media.length
        } else {
            fileCount = files.length
        }
        if (fileCount >= 4) return
        acceptedFiles.forEach((file) => {
            setFiles((prevState) => [...prevState, file])
            if (isServer) {
                return loadNewFile(file)
            }
        })
        if (rejectedFiles.length > 0) {
            const maxSizeError = `File size exceeds the maximum allowed (${maxSizeInMB}MB).`;
        }
    }, [files, userData])
    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        maxFiles: 4,
        noClick: true,
        noKeyboard: true,
        maxSize: maxSizeInMB * 1024 * 1024
    })

    if (!isServer){
        return (
            <div {...getRootProps()} className="w-[350px] min-h-[350px] grid grid-rows-2 grid-cols-2 gap-3">
                {[...Array(maxItems)].map((_, index) => {
                    const file = files[index]
                    return(
                        <label key={index} htmlFor="file-input" className="w-full h-full border-2 border-pink-pastel border-dashed rounded-lg overflow-hidden relative">
                            {file ? (
                                <>
                                    <div onClick={(e) => {e.preventDefault();localRemove(index)}}
                                        className="transition-all duration-300 text-zinc-200 absolute right-1 top-1 cursor-pointer hover:text-red-500">
                                        <DeleteSharp fontSize={"small"}/>
                                    </div>
                                    <img loading={"lazy"} src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg" alt=""/>
                                </>
                            ) : <div className="w-full h-full bg-gray-300/50 dark:bg-gray-600/50 hover:bg-gray-400/50 hover:dark:bg-gray-700/50 transition-all duration-300 rounded-lg"/>}
                        </label>
                    )
                })}
                <input id="file-input" {...getInputProps()} />
            </div>
        )
    }

    return (
        <div {...getRootProps()} className={`w-full min-h-[250px] flex flex-wrap gap-3`}>
            {[...Array(maxItems)].map((_, index) => {
                const file = files[index]
                return (
                    <label key={index} htmlFor="file-input" className="w-[48%] h-[200px] border-2 border-pink-pastel border-dashed rounded-lg overflow-hidden relative">
                        {file && file.type.includes("image") ? (
                            <div className="h-full w-full max-h-[200px]">
                                {file.relative_path ? (
                                    <>
                                        {isAuthor && filesLength > 1 && (
                                            <div
                                                onClick={(e) => {e.preventDefault();serverRemove(file.id)}}
                                                className="transition-all duration-300 text-gray-200 absolute right-1 top-1 cursor-pointer hover:text-red-400"
                                            >
                                                <DeleteSharp fontSize={"small"}/>
                                            </div>
                                        )}
                                        <img loading={"lazy"} src={file.relative_path} alt="" width={450} height={450} className="h-full w-full object-cover rounded-lg"/>
                                    </>
                                ):(
                                    <>
                                        {isAuthor && filesLength > 1 && (
                                            <div
                                                onClick={(e) => {e.preventDefault();localRemove(index)}}
                                                className="transition-all duration-300 text-gray-200 absolute right-1 top-1 cursor-pointer hover:text-red-400"
                                            >
                                                <DeleteSharp fontSize={"small"}/>
                                            </div>
                                        )}
                                        <img loading={"lazy"} src={URL.createObjectURL(file)} alt="" width={450} height={450} className="h-full w-full object-cover rounded-lg"/>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="h-full w-full bg-gray-300/50 dark:bg-gray-600/50 rounded-lg hover:bg-gray-400/50 hover:dark:bg-gray-700/50 transition-all duration-300"/>
                        )}
                    </label>
                )
            })}
            <input id="file-input" {...getInputProps()} />
        </div>
    )
}