import InformationBoardImage from "../InformationBoardImage";

export default function NavBarLogo() {
    return (
        <div className={` flex w-full p-3 items-center justify-center border-b border-dashed `}>
            <span>
                <InformationBoardImage size="50"/>
            </span>
        </div>
    )
}