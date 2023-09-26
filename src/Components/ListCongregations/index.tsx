import { CongregationContext } from "@/context/CongregationContext"
import { ICongregation } from "@/entities/types"
import { api } from "@/services/api"
import { useContext, useEffect, useState } from "react"
import CardCongregation from "../CardCongregation"
import SkeletonCongregationCard from "../CardCongregation/skeletonCongregationCard"
import { PlusIcon } from "lucide-react"
import Router from "next/router"


export default function ListCongregations() {
    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [loading, setLoading] = useState(true)

    const getCongregations = async () => {
        await api.get('/congregations').then(res => {
            const { data } = res
            setCongregations([...data])
            setLoading(false)
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        setLoading(true)
        getCongregations()
    }, [])

    const { setShowCongregationCreated } = useContext(CongregationContext)

    let skeletonCongregations = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonCongregations.map((a, i) => (<SkeletonCongregationCard key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <>
            {loading ? (
                renderSkeleton()
            ) : (
                <ul className="flex w-full h-fit flex-wrap justify-center">
                    {congregations?.map(congregation => (
                        <CardCongregation key={congregation.number}
                            name={congregation.name} number={congregation.number}
                            circuit={congregation.circuit} city={congregation.city}
                            image_url={congregation.image_url} />
                    ))}
                    <li className="flex place-self-center justify-center items-center w-60 h-56 m-3 ">
                        <span onClick={() => { Router.push('/congregacao/add'), setShowCongregationCreated(false) }} className="border-2 border-primary-100 rounded-full p-5 hover:p-6 cursor-pointer"><PlusIcon color='#83c5be' /> </span>
                    </li>
                </ul>
            )}
        </>
    )
}
