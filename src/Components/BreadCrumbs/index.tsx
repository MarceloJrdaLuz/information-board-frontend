import Link from "next/link";
import { IBreadCrumbsProps } from "./types";

export default function BreadCrumbs({ crumbs, pageActive }: IBreadCrumbsProps) {
    return (

        <nav className="flex py-2 bg-gray-200" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {crumbs.map((crumb, index) => (
                    <li key={index}>
                        <div className="flex items-center ">
                            {index > 0 && <svg className="w-3 h-3 text-primary-200 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                            </svg>}
                            <Link href={crumb.link}>
                                <div className="ml-1 text-sm font-medium text-primary-200 hover:underline md:ml-2 dark:text-gray-400 dark:hover:text-white">{crumb.label}</div>
                            </Link>
                        </div>
                    </li>
                ))}
                <li aria-current="page">
                    <div className="flex items-center">
                        <svg className="w-3 h-3 text-primary-200 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">{pageActive}</span>
                    </div>
                </li>
            </ol>
        </nav>

    )
}