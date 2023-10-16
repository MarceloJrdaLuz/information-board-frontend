import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Tooltip,
} from "@material-tailwind/react"
import Image from "next/image"
import avatar from '../../../public/images/avatar-male.png'
import { ChangeEvent, useRef, useState } from "react"
import { CameraIcon, CheckIcon } from "lucide-react"
import { api } from "@/services/api"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { toast } from "react-toastify"
import { UserTypes } from "@/entities/types"


interface ProfileCardProps {
    fullName: string
    email: string
    user?: UserTypes
    avatar_url?: string
}

export function ProfileCard({ avatar_url, email, fullName, user }: ProfileCardProps) {
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null)
    const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null)

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            const imageUrl = URL.createObjectURL(selectedFile)
            setNewAvatarUrl(imageUrl)
            setUploadedPhoto(selectedFile)
        }
    }

    async function updatePhotoAvatar() {
        const formData = new FormData()

        if (uploadedPhoto) {
            formData.set('avatar', uploadedPhoto)
        }

        if (!avatar_url) {
            await api.post(`profile/${user?.id}`, formData).then(() => {
                handleSubmitSuccess(messageSuccessSubmit.photoProfileCreate)
            }).catch(err => {
                handleSubmitError(messageErrorsSubmit.default)
                console.log(err)
            })
        } else {
            await api.put(`profile/${user?.profile?.id}`, formData).then(() => {
                handleSubmitSuccess(messageSuccessSubmit.photoProfileUpdate)
            }).catch(err => {
                handleSubmitError(messageErrorsSubmit.default)
                console.log(err)
            })
        }
    }

    const sendNewPhoto = () => {
        toast.promise(updatePhotoAvatar, {
            pending: "Atualizando a foto de perfil..."
        })
    }

    return (
        <Card className="w-96">
            <CardHeader floated={false} className="h-80">
                <div className="flex justify-center items-center cursor-pointer w-full h-full">
                    {newAvatarUrl ? (
                        <div className="flex justify-center items-center w-72 h-72 m-2 relative">
                            <Image src={newAvatarUrl} alt="Nova foto de perfil" fill className="rounded-full p-1" />
                            <div className="flex justify-center items-center absolute bottom-0 right-7 rounded-full bg-primary-200 p-5">
                                <CheckIcon onClick={sendNewPhoto} className="text-white w-10 h-10" />
                            </div>
                        </div>
                    ) : (
                        avatar_url ? (
                            <div className="flex justify-center items-center w-72 h-72 m-2 relative">
                                <Image src={avatar_url} alt="Foto de perfil" fill className="rounded-full p-7" />
                                <div onClick={handleImageClick} className="flex justify-center items-center absolute bottom-0 right-7 rounded-full bg-primary-200 p-5">
                                    <CameraIcon className="text-white w-10 h-10" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center w-72 h-72 m-2 relative">
                                <Image alt="Avatar de um homem" src={avatar} className="rounded-full p-1 bg-[#a4e6da]" fill />
                                <div onClick={handleImageClick} className="flex justify-center items-center absolute bottom-0 right-7 rounded-full bg-primary-200 p-5">
                                    <CameraIcon className="text-white w-10 h-10" />
                                </div>
                            </div>
                        )
                    )}
                </div>
                <input
                    type="file"
                    name="avatar"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </CardHeader>
            <CardBody className="text-center">
                <Typography variant="h4" color="blue-gray" className="mb-2">
                    {fullName}
                </Typography>
                <Typography color="blue-gray" className="font-medium" textGradient>
                    {email}
                </Typography>
            </CardBody>
            <CardFooter className="flex justify-center gap-7 pt-2">
                <Tooltip content="Like">
                    <Typography
                        as="a"
                        href="#facebook"
                        variant="lead"
                        color="blue"
                        textGradient
                    >
                        <i className="fab fa-facebook" />
                    </Typography>
                </Tooltip>
                <Tooltip content="Follow">
                    <Typography
                        as="a"
                        href="#twitter"
                        variant="lead"
                        color="light-blue"
                        textGradient
                    >
                        <i className="fab fa-twitter" />
                    </Typography>
                </Tooltip>
                <Tooltip content="Follow">
                    <Typography
                        as="a"
                        href="#instagram"
                        variant="lead"
                        color="purple"
                        textGradient
                    >
                        <i className="fab fa-instagram" />
                    </Typography>
                </Tooltip>
            </CardFooter>
        </Card>
    )
}