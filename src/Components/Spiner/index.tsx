interface SpinerProps {
    size?: string
}

export default function Spiner({size}: SpinerProps) {
    return (
        <div className="flex justify-center items-center">
                <div
                    className={`inline-block ${size ?? "h-14 w-14"} animate-spin rounded-full border-4 border-solid border-primary-200 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                    role="status">
                </div>
        </div>
    )
}