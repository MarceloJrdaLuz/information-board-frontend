import { MapIcon, MapPinIcon } from "lucide-react";

export function LocationLink({ latitude, longitude }: { latitude?: string; longitude?: string }) {
  if (!latitude || !longitude) return null

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-primary-200 underline"
    >
       <MapIcon className="text-typography-500 h-4 w-4 font-semibold"/> Ver no mapa
    </a>  
  )
}
