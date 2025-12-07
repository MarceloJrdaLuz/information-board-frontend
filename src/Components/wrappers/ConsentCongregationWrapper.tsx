import { useCongregationContext } from '@/context/CongregationContext';
import { useFetch } from '@/hooks/useFetch';
import { ReactNode, useEffect, useState } from 'react';
import ConsentModal from '../ConsentModal';
import { toast } from 'react-toastify';
import { useSetAtom } from 'jotai';
import { createConsentCongregationAtom } from '@/atoms/ConsentAtoms';
import { useAuthContext } from '@/context/AuthContext';
import { ICheckConsentCongregation } from '@/types/consent';
import { ITermOfUse } from '@/types/termsofuse';

interface ConsentWrapperProps {
    children: ReactNode;
}

export const ConsentCongregationWrapper = ({ children }: ConsentWrapperProps) => {
    const { user, roleContains } = useAuthContext()
    const { congregation } = useCongregationContext()
    const acceptConsent = useSetAtom(createConsentCongregationAtom)
    const [consentCongregation, setConsentCongregation] = useState<ICheckConsentCongregation | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const shouldFetchConsent = roleContains('ADMIN_CONGREGATION')

    const { data: termActive, isLoading: isLoadingTerm  } = useFetch<ITermOfUse>(
        shouldFetchConsent ? `/terms/active/congregation` : ''
    );

    // 2️⃣ só busca o consentimento se houver termo ativo
    const { data: consentRecordData, isLoading: isLoadingConsent   } = useFetch<ICheckConsentCongregation>(
        termActive && shouldFetchConsent
            ? `/consent/check?congregation_id=${congregation?.id}&type=congregation`
            : ''
    );

    useEffect(() => {
        if (!shouldFetchConsent || !termActive) return;

        if (consentRecordData) {
            setConsentCongregation(consentRecordData);
            setIsOpen(!consentRecordData.hasAccepted || !consentRecordData.isLatestVersion);
        }
    }, [consentRecordData, shouldFetchConsent, termActive]);

    const onAccept = async () => {
        const deviceId = crypto.randomUUID();
        toast.promise(acceptConsent({
            congregation_id: congregation!.id,
            accepted_by_user_id: user?.id ?? "",
            deviceId: deviceId, 
            type: "congregation",
        }), {
            pending: 'Registrando seu consentimento...',
        }).then(() => {
            setConsentCongregation(prev => prev ? { ...prev, hasAccepted: true, isLatestVersion: true } : prev)
            setIsOpen(false)
        }).catch(err => {
            console.log(err)
        })
    }
      // 3️⃣ se não for admin, libera conteúdo normalmente
    if (!shouldFetchConsent) return <>{children}</>;

    // 4️⃣ se ainda carregando termo ou consentimento, não mostra nada
    if (isLoadingTerm || isLoadingConsent) return null;

    // 5️⃣ se não há termo ativo, libera normalmente
    if (!termActive) return <>{children}</>;

    // 6️⃣ se não há registro de consentimento, ainda não carrega conteúdo
    if (!consentCongregation) return null;

    return (
        <>
            <ConsentModal
                key={consentCongregation.activeTerm?.id}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title={consentCongregation.activeTerm?.title}
                content={consentCongregation.activeTerm?.content}
                version={consentCongregation.activeTerm?.version}
                onAccept={onAccept}
            />
            {consentCongregation.hasAccepted && consentCongregation.isLatestVersion && children}
        </>
    )
}
