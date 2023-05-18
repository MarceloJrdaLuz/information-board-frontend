import { useState } from "react";
import { NavBarOptionsType } from "./types";


export default function NavBarOptions(props: NavBarOptionsType) {
    
    
    return (
        <li onClick={props.onClick} className={`relative flex flex-1 p-4 items-center cursor-pointer  hover:bg-secondary-100 hover:text-black  ${props.active && ' font-bold after:absolute after:right-0 after:content-[" "] after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent after:border-r-[30px] after:border-r-secondary-100 after:border-b-[20px] after:border-b-transparent'}`} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}>
            <span className="pr-3 flex justify-center items-center">
                <span>{props.icon}</span>
            </span>
            <span className="text-sm">{props.title}</span>
        </li>
    )
}