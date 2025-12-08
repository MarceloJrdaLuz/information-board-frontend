import { useSubmit } from "@/hooks/useSubmitForms";
import { api } from "@/services/api";
import { UserTypes } from "@/types/types";
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CameraIcon, ZoomIn, ZoomOutIcon } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useSwipeable } from "react-swipeable";
import { toast } from "react-toastify";
import avatar from '../../../public/images/avatar-male.png';

interface ProfileCardProps {
  fullName: string;
  email: string;
  user?: UserTypes;
  avatar_url?: string;
}

export function ProfileCard({ avatar_url, email, fullName, user }: ProfileCardProps) {
  const { handleSubmitError, handleSubmitSuccess } = useSubmit();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const editorRef = useRef<AvatarEditor | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });

  const updateCroppedImage = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob) => {
        if (blob) {
          const pngFile = new File([blob], 'cropped_image.png', { type: 'image/png' });
          setCroppedImage(pngFile);
        }
      }, 'image/png', 1);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setNewAvatarUrl(imageUrl);
      setUploadedPhoto(selectedFile);
    }
  };

  async function updatePhotoAvatar() {
    const formData = new FormData();
    if (croppedImage) formData.set('avatar', croppedImage);
    else if (uploadedPhoto) formData.set('avatar', uploadedPhoto);

    const request = avatar_url
      ? api.put(`profile/${user?.profile?.id}`, formData)
      : api.post(`profile/${user?.id}`, formData);

    await request
      .then(() => {
        handleSubmitSuccess(
          avatar_url
            ? messageSuccessSubmit.photoProfileUpdate
            : messageSuccessSubmit.photoProfileCreate
        );
        setNewAvatarUrl(null);
        setZoom(1);
        setPosition({ x: 0.5, y: 0.5 });
      })
      .catch(() => handleSubmitError(messageErrorsSubmit.default));
  }

  const sendNewPhoto = () => {
    toast.promise(updatePhotoAvatar, {
      pending: "Atualizando a foto de perfil..."
    }).then(() => {

    }).catch(err => {
      console.log(err)
    })
  };

  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      const deltaX = eventData.deltaX / window.innerWidth;
      const deltaY = eventData.deltaY / window.innerHeight;
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      updateCroppedImage();
    },
  });

  return (
    <>
      {newAvatarUrl ? (
        <div className="relative w-48 mx-auto" {...swipeHandlers}>
          <AvatarEditor
            ref={editorRef}
            image={newAvatarUrl}
            width={160}
            height={160}
            border={25}
            borderRadius={80}
            color={[255, 255, 255, 0.6]}
            scale={zoom}
            position={position}
            className="rounded-full"
          />

          <div className="absolute top-1 right-1 flex gap-1">
            <button onClick={() => setZoom(Math.max(1, zoom - 0.1))}>
              <ZoomOutIcon className="w-4 h-4 text-primary-200" />
            </button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
              <ZoomIn className="w-4 h-4 text-primary-200" />
            </button>
          </div>

          <div className="flex justify-between mt-2 text-xs">
            <Button onClick={() => setNewAvatarUrl(null)} className="w-20 py-1 text-xs">Cancelar</Button>
            <Button onClick={sendNewPhoto} className="w-20 py-1 text-xs">Salvar</Button>
          </div>
        </div>
      ) : (
        <Card className="bg-surface-100 border-none rounded-lg p-3 w-full mx-auto text-center shadow-sm">
         <div className="relative w-28 h-28 mx-auto">

  {/* Camada que corta a imagem */}
  <div className="w-full h-full rounded-full overflow-hidden bg-surface-200 flex justify-center items-center">
    <Image
      src={avatar_url || avatar}
      alt="Foto de perfil"
      fill
      className="object-cover object-top rounded-full"
    />
  </div>

  {/* Botão da câmera fora do overflow-hidden */}
  <button
    onClick={() => fileInputRef.current?.click()}
    className="absolute -bottom-2 -right-2 bg-primary-200 p-2 rounded-full shadow-md hover:scale-105 transition-all duration-200 border-2 border-surface-100 z-10"
  >
    <CameraIcon className="w-4 h-4 text-typography-100" />
  </button>

  <input
    type="file"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleFileChange}
  />
</div>


          <CardContent className="pt-2 px-2">
            <p className="text-typography-700 text-sm font-semibold truncate">
              {fullName ? `Bem-Vindo, ${fullName?.split(" ")[0]}!` : "Bem-Vindo"}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
