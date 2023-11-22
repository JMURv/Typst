import {useEffect, useRef, useState} from "react";
import {Fancybox as NativeFancybox} from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import {CloseSharp, DeleteSharp, EditSharp} from "@mui/icons-material";
import {useNotification} from "@/providers/NotificationContext";
import useTranslation from "next-translate/useTranslation";


export default function UserStories({session, userData, setUserData, isAuthor}) {
    const maxStories = 4
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const { t } = useTranslation('user')
    const { addNotification } = useNotification()
    const FancyboxRef = useRef(null)
    const [isEdit, setIsEdit] = useState(false)

    const handleFileUpload = async () => {
        try {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (event) => {
                const file = event.target.files[0]

                if (file.size > maxFileSize) {
                    addNotification({
                        id: new Date().toISOString(),
                        message: t('too large file')
                    })
                    return
                }

                if (file) {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', "stories")

                    const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            "Authorization": `Bearer ${session.access}`
                        }
                    })

                    if (response.ok) {
                        const newFileData = await response.json()
                        const newUserData = {...userData}
                        newUserData.stories.push(newFileData)
                        setUserData(newUserData)
                    } else {
                        console.error('File upload failed')
                    }
                }
            }
            input.click()
        } catch (error) {
            console.error('Error handling file upload:', error)
        }
    }

    const handleFileDelete = async (file) => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            stories: prevUserData.stories.filter((prevFile) => prevFile.id !== file.id)
        }))

        const formData = new FormData()
        formData.append('mediaId', file.id)
        formData.append('type', "stories")

        const response = await fetch(`/api/v1/users/${session.user.user_id}/media/`, {
            method: 'DELETE',
            body: formData,
            headers: {
                "Authorization": `Bearer ${session.access}`
            }
        })

        if (response.ok) {
            addNotification({
                id: new Date().toISOString(),
                message: t('deleted story')
            })
        } else {
            console.error('File upload failed')
        }
    }

    useEffect(() => {
        const container = FancyboxRef.current
        const options = {
            Carousel: {
                infinite: true,
                Navigation: false,
            },
            Thumbs: false,
            Toolbar: {
                display: {
                    left: [],
                    middle: [],
                    right: ["close"]
                }
            }
        }
        NativeFancybox.bind(container, "[data-fancybox]", options)
        return () => {
            NativeFancybox.unbind(container)
            NativeFancybox.close()
        }
    }, [])
    return (
        <div ref={FancyboxRef} className={`w-full flex flex-row flex-wrap gap-3`}>
            {[...Array(maxStories)].map((_, index) => {
                const file = userData.stories[index]
                return (
                    <div key={index} className={`relative`}>
                        {file ? (
                            <div className="min-w-[80px] max-w-[80px] w-full aspect-square rounded-full bg-gradient-to-r from-pink-pastel via-pastel-100 to-purple-500 overflow-hidden">
                                <a data-fancybox="gallery" className="w-full h-full" href={file.relative_path}>
                                    <img
                                        loading={"lazy"}
                                        src={file.relative_path}
                                        alt=""
                                        width={450}
                                        height={450}
                                        className="h-full w-full object-cover p-1 rounded-full"
                                    />
                                </a>
                                {isEdit && (
                                    <div
                                        className="w-full h-full rounded-full bg-pink-pastel/50 absolute inset-0 flex items-center justify-center cursor-pointer"
                                        onClick={() => handleFileDelete(file)}
                                    >
                                        <DeleteSharp fontSize={"large"} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            isAuthor ? (
                                <div
                                    className="min-w-[80px] max-w-[80px] w-full aspect-square rounded-full bg-pink-pastel/20 border-2 border-dashed border-pink-pastel cursor-pointer"
                                    onClick={() => handleFileUpload()}
                                />
                            ):null
                        )}
                    </div>
                )
            })}
            {isAuthor && (
                <div className="min-w-[80px] max-w-[80px] w-full aspect-square rounded-full bg-pink-pastel/20 cursor-pointer">
                    <div onClick={() => setIsEdit((value) => !value)} className={`flex justify-center items-center w-full h-full`}>
                        {isEdit ? (
                            <CloseSharp fontSize={"large"} />
                        ) : (
                            <EditSharp fontSize={"large"} />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
