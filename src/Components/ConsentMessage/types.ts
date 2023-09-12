export interface IConsentMessageProps {
    onAccepted: () => void
    onDecline: React.Dispatch<boolean>
    text: string
    congregatioNumber: string
    name?: string
}