export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new window.Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

export interface Area {
    x: number
    y: number
    width: number
    height: number
}

export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
): Promise<File | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // Bounding box da imagem rotacionada
    const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height)
    const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)

    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.translate(-image.width / 2, -image.height / 2)

    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        return null
    }

    // Define resolução de saída nítida para o avatar (400x400)
    const outputSize = 400
    croppedCanvas.width = outputSize
    croppedCanvas.height = outputSize

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    )

    return new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => {
            if (blob) {
                resolve(new File([blob], 'avatar.png', { type: 'image/png' }))
            } else {
                resolve(null)
            }
        }, 'image/png', 0.95)
    })
}

