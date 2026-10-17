import { useSubmit } from "@/hooks/useSubmitForms";
import { api } from "@/services/api";
import { UserTypes } from "@/types/types";
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit";
import { CameraIcon } from "lucide-react";
import Image from "next/image";
import Router from "next/router";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import avatarFemale from '../../../public/images/avatar-female.png';
import avatarMale from '../../../public/images/avatar-male.png';
import AvatarCropModal from "../AvatarCropModal";
import { Card, CardContent } from "../ui/card";

interface ProfileCardProps {
  fullName: string;
  email: string;
  user?: UserTypes;
  avatar_url?: string;
}

export function ProfileCard({ avatar_url, email, fullName, user }: ProfileCardProps) {
  const { handleSubmitError, handleSubmitSuccess } = useSubmit();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setSelectedImageSrc(imageUrl);
      setIsCropModalOpen(true);
    }
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setSelectedImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function updatePhotoAvatar(croppedFile: File) {
    const formData = new FormData();
    formData.set('avatar', croppedFile);

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
        handleCloseCropModal();
        setTimeout(() => {
          Router.reload();
        }, 800);
      })
      .catch(() => {
        handleSubmitError(messageErrorsSubmit.default);
      });
  }

  const handleSaveCroppedPhoto = async (croppedFile: File) => {
    await toast.promise(updatePhotoAvatar(croppedFile), {
      pending: "Atualizando a foto de perfil...",
      success: "Foto de perfil atualizada!",
      error: "Erro ao atualizar a foto de perfil."
    });
  };

  const defaultAvatar = user?.publisher?.gender === "Feminino" ? avatarFemale : avatarMale;

  return (
    <>
      <Card className="bg-surface-100 border-none rounded-2xl p-4 w-full mx-auto text-center shadow-sm">
        <div className="relative w-28 h-28 mx-auto">
          {/* Camada que corta a imagem */}
          <div className="w-full h-full rounded-full overflow-hidden bg-surface-200 flex justify-center items-center ring-4 ring-primary-200/20 shadow-inner">
            <Image
              src={avatar_url || defaultAvatar}
              alt="Foto de perfil"
              fill
              className="object-cover object-center rounded-full"
            />
          </div>

          {/* Botão da câmera para enviar/trocar foto */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-primary-200 hover:bg-primary-150 p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-surface-100 z-10 text-white"
            title="Alterar foto de perfil"
          >
            <CameraIcon className="w-4 h-4" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <CardContent className="pt-3 px-2">
          <p className="text-typography-800 text-sm font-bold truncate">
            {fullName ? `Bem-Vindo, ${fullName?.split(" ")[0]}!` : "Bem-Vindo"}
          </p>
        </CardContent>
      </Card>

      {/* Modal Interativo de Corte de Avatar */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        imageSrc={selectedImageSrc}
        onClose={handleCloseCropModal}
        onSave={handleSaveCroppedPhoto}
      />
    </>
  );
}
