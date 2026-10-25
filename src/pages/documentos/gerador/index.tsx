import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DocumentosGeradorRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/modelos/cartas");
    }, [router]);

    return null;
}
