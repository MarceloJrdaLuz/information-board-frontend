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
import { ChangeEvent, MouseEvent, useRef, useState } from "react"
import { CameraIcon, CheckIcon, X, ZoomIn, ZoomOutIcon } from "lucide-react"
import { api } from "@/services/api"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { toast } from "react-toastify"
import { UserTypes } from "@/entities/types"
import AvatarEditor from "react-avatar-editor"
import { useSwipeable, SwipeEventData } from 'react-swipeable'

interface EditorRefType {
    current: AvatarEditor | null;
}

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
    const [croppedImage, setCroppedImage] = useState<Blob | null>(null);

    const editorRef = useRef<AvatarEditor | null>(null);
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 })

    const handleSwipe = (eventData: SwipeEventData) => {
        if (editorRef.current) {
            const deltaX = eventData.deltaX / window.innerWidth
            const deltaY = eventData.deltaY / window.innerHeight
            setPosition((prevPosition) => ({
                x: prevPosition.x + deltaX,
                y: prevPosition.y + deltaY,
            }))

            updateCroppedImage();
        }
    }

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const updateCroppedImage = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                setCroppedImage(blob);
            }, 'image/jpeg'); // ou o formato de sua escolha
        }
    };

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

        if (croppedImage) {
            formData.set('avatar', croppedImage)
        } else {
            if (uploadedPhoto) {
                formData.set('avatar', uploadedPhoto)
            }
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

    const isTouchDevice = "ontouchstart" in window
    const swipeHandlers = useSwipeable({ onSwiped: handleSwipe })

    return (
        <>
            {newAvatarUrl && (
                <div  {...(isTouchDevice ? swipeHandlers : {})}>
                    <AvatarEditor
                        ref={editorRef}
                        image={newAvatarUrl}
                        width={200}
                        height={200}
                        border={50}
                        color={[255, 255, 255, 0.6]}
                        scale={zoom}
                        position={position}
                    />
                    <div className="w-full flex justify-between">
                        <button
                            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                        >
                            <ZoomOutIcon />
                        </button>
                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        >
                            <ZoomIn />
                        </button>
                    </div>
                    {/* <div className="flex justify-center items-center absolute bottom-0 right-7 rounded-full bg-primary-200 p-5">
                    <CheckIcon onClick={sendNewPhoto} className="text-white w-10 h-10" />
                </div>
                <div className="flex justify-center items-center absolute bottom-0 left-7 rounded-full bg-red-400 p-5">
                    <X onClick={() => setNewAvatarUrl(null)} className="text-white w-10 h-10" />
                </div> */}
                </div>
            )}
            {!newAvatarUrl && <Card className="w-96">
                <CardHeader floated={false} className="h-80">
                    <div className="flex justify-center items-center cursor-pointer w-full h-full">
                        {avatar_url ? (
                            <div className="flex justify-center items-center w-72 h-72 m-2 relative">
                                <Image style={{ objectFit: "cover", objectPosition: "top center" }} src={avatar_url} alt="Foto de perfil" fill className="rounded-full p-7" />
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
            </Card>}
        </>
    )
}