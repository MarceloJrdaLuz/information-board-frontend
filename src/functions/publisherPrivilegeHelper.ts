import { IPublisher, IPublisherPrivilege, PrivilegeCode, Privileges } from "@/types/types"
import dayjs from "dayjs"

/**
 * Checks if an IPublisherPrivilege record is active at a given date.
 */
export function isPrivilegeActiveAt(
    pp: IPublisherPrivilege,
    targetDate: Date = new Date()
): boolean {
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    if (pp.startDate) {
        const start = new Date(pp.startDate)
        start.setHours(0, 0, 0, 0)
        if (target < start) return false
    }

    if (pp.endDate) {
        const end = new Date(pp.endDate)
        end.setHours(23, 59, 59, 999)
        if (target > end) return false
    }

    return true
}

const codeToLegacyMap: Record<PrivilegeCode, { pt: string; en: string }> = {
    [PrivilegeCode.PUBLISHER]: { pt: Privileges.PUBLICADOR, en: "Publisher" },
    [PrivilegeCode.ELDER]: { pt: Privileges.ANCIAO, en: "Elder" },
    [PrivilegeCode.MINISTERIAL_SERVANT]: { pt: Privileges.SM, en: "Ministerial Servant" },
    [PrivilegeCode.REGULAR_PIONEER]: { pt: Privileges.PIONEIROREGULAR, en: "Regular Pioneer" },
    [PrivilegeCode.SPECIAL_PIONEER]: { pt: Privileges.PIONEIROESPECIAL, en: "Special Pioneer" },
    [PrivilegeCode.MISSIONARY_WORLDWIDE]: { pt: Privileges.MISSIONARIOEMCAMPO, en: "Missionary Worldwide" },
    [PrivilegeCode.CONTINUOUS_AUXILIARY_PIONEER]: { pt: Privileges.AUXILIARTEMPOINDETERMINADO, en: "Continuous Auxiliary Pioneer" },
    [PrivilegeCode.AUXILIARY_PIONEER]: { pt: Privileges.PIONEIROAUXILIAR, en: "Auxiliary Pioneer" },
    [PrivilegeCode.SPEAKER]: { pt: Privileges.ORADOR, en: "Speaker" },
    [PrivilegeCode.READER]: { pt: Privileges.LEITOR, en: "Reader" },
    [PrivilegeCode.CHAIRMAN]: { pt: Privileges.PRESIDENTE, en: "Chairman" },
    [PrivilegeCode.ATTENDANT]: { pt: Privileges.INDICADOR, en: "Attendant" },
    [PrivilegeCode.MICROPHONE_ATTENDANT]: { pt: Privileges.MICROFONEVOLANTE, en: "Microphone Attendant" },
    [PrivilegeCode.FIELD_CONDUCTOR]: { pt: Privileges.DIRIGENTECAMPO, en: "Field Conductor" },
    [PrivilegeCode.PUBLIC_WITNESS]: { pt: Privileges.TESTEMUNHOPUBLICO, en: "Public Witness" },
    [PrivilegeCode.SOUND]: { pt: Privileges.SOM, en: "Sound" },
    [PrivilegeCode.MEDIA]: { pt: Privileges.MIDIAS, en: "Media" },
    [PrivilegeCode.SOUND_AND_MEDIA]: { pt: Privileges.SOMEMIDIAS, en: "Sound and Media" },
    [PrivilegeCode.STAGE_ATTENDANT]: { pt: Privileges.PEDESTAL, en: "Stage Attendant" }
}

const legacyToCodeMap: Partial<Record<Privileges, PrivilegeCode>> = {
    [Privileges.PUBLICADOR]: PrivilegeCode.PUBLISHER,
    [Privileges.ANCIAO]: PrivilegeCode.ELDER,
    [Privileges.SM]: PrivilegeCode.MINISTERIAL_SERVANT,
    [Privileges.PIONEIROREGULAR]: PrivilegeCode.REGULAR_PIONEER,
    [Privileges.PIONEIROESPECIAL]: PrivilegeCode.SPECIAL_PIONEER,
    [Privileges.MISSIONARIOEMCAMPO]: PrivilegeCode.MISSIONARY_WORLDWIDE,
    [Privileges.AUXILIARTEMPOINDETERMINADO]: PrivilegeCode.CONTINUOUS_AUXILIARY_PIONEER,
    [Privileges.AUXILIARINDETERMINADO]: PrivilegeCode.CONTINUOUS_AUXILIARY_PIONEER,
    [Privileges.PIONEIROAUXILIAR]: PrivilegeCode.AUXILIARY_PIONEER,
    [Privileges.ORADOR]: PrivilegeCode.SPEAKER,
    [Privileges.LEITOR]: PrivilegeCode.READER,
    [Privileges.PRESIDENTE]: PrivilegeCode.CHAIRMAN,
    [Privileges.INDICADOR]: PrivilegeCode.ATTENDANT,
    [Privileges.MICROFONEVOLANTE]: PrivilegeCode.MICROPHONE_ATTENDANT,
    [Privileges.DIRIGENTECAMPO]: PrivilegeCode.FIELD_CONDUCTOR,
    [Privileges.TESTEMUNHOPUBLICO]: PrivilegeCode.PUBLIC_WITNESS,
    [Privileges.SOM]: PrivilegeCode.SOUND,
    [Privileges.MIDIAS]: PrivilegeCode.MEDIA,
    [Privileges.SOMEMIDIAS]: PrivilegeCode.SOUND_AND_MEDIA,
    [Privileges.PEDESTAL]: PrivilegeCode.STAGE_ATTENDANT
}

/**
 * Checks if publisher has a privilege active at targetDate.
 * Accepts either PrivilegeCode (preferred) or legacy Privileges enum value.
 */
export function hasPrivilege(
    publisher: Partial<IPublisher> | null | undefined,
    privilege: PrivilegeCode | Privileges | string,
    targetDate: Date = new Date()
): boolean {
    if (!publisher) return false

    const code: PrivilegeCode | undefined =
        Object.values(PrivilegeCode).includes(privilege as PrivilegeCode)
            ? (privilege as PrivilegeCode)
            : legacyToCodeMap[privilege as Privileges]

    // Primary check: privilegesRelation with dates
    if (publisher.privilegesRelation && Array.isArray(publisher.privilegesRelation)) {
        return publisher.privilegesRelation.some(pp => {
            if (!pp.privilege) return false
            const matchCode = code && pp.privilege.code === code
            const names = code && codeToLegacyMap[code]
            const matchName = names && (pp.privilege.name === names.en || pp.privilege.name === names.pt)
            const matchRaw = pp.privilege.name === privilege || pp.privilege.code === privilege
            return (matchCode || matchName || matchRaw) && isPrivilegeActiveAt(pp, targetDate)
        })
    }

    return false
}

/**
 * Checks if publisher has ANY of the specified privileges.
 */
export function hasAnyPrivilege(
    publisher: Partial<IPublisher> | null | undefined,
    privileges: (PrivilegeCode | Privileges | string)[],
    targetDate: Date = new Date()
): boolean {
    return privileges.some(p => hasPrivilege(publisher, p, targetDate))
}

/**
 * Returns active IPublisherPrivilege list.
 */
export function getActivePrivileges(
    publisher: Partial<IPublisher> | null | undefined,
    targetDate: Date = new Date()
): IPublisherPrivilege[] {
    if (!publisher?.privilegesRelation || !Array.isArray(publisher.privilegesRelation)) {
        return []
    }
    return publisher.privilegesRelation.filter(pp => isPrivilegeActiveAt(pp, targetDate))
}

/**
 * Returns active display labels (in Portuguese) to render in badges/chips.
 */
export function getActivePrivilegeLabels(
    publisher: Partial<IPublisher> | null | undefined,
    targetDate: Date = new Date()
): string[] {
    const active = getActivePrivileges(publisher, targetDate)
    const labels: string[] = []

    for (const pp of active) {
        if (pp.privilege) {
            const code = pp.privilege.code as PrivilegeCode
            const mapped = code && codeToLegacyMap[code]
            if (mapped) {
                labels.push(mapped.pt)
            } else if (pp.privilege.name) {
                labels.push(pp.privilege.name)
            }
        }
    }

    return Array.from(new Set(labels))
}

/**
 * Returns user-friendly Portuguese display name for a publisher privilege.
 */
export function getPrivilegeDisplayName(pp: IPublisherPrivilege): string {
    if (!pp.privilege) return ""
    const code = pp.privilege.code as PrivilegeCode
    const mapped = code && codeToLegacyMap[code]
    return mapped ? mapped.pt : (pp.privilege.name || "")
}

/**
 * Returns past (closed) privileges sorted by end date descending.
 */
export function getPastPrivileges(
    publisher: Partial<IPublisher> | null | undefined
): IPublisherPrivilege[] {
    if (!publisher?.privilegesRelation || !Array.isArray(publisher.privilegesRelation)) {
        return []
    }
    return publisher.privilegesRelation
        .filter(pp => pp.endDate !== null && pp.endDate !== undefined)
        .sort((a, b) => {
            const endA = a.endDate ? new Date(a.endDate).getTime() : 0
            const endB = b.endDate ? new Date(b.endDate).getTime() : 0
            return endB - endA
        })
}

/**
 * Returns the start date of the active PUBLISHER privilege (formatted as YYYY-MM-DD), if present.
 */
export function getPublisherStartDate(publisher: Partial<IPublisher> | null | undefined): string | null {
    if (!publisher?.privilegesRelation || !Array.isArray(publisher.privilegesRelation)) {
        return null
    }
    const pubPriv = publisher.privilegesRelation.find(pp =>
        (pp.privilege?.code === PrivilegeCode.PUBLISHER ||
         pp.privilege?.name === "Publisher" ||
         pp.privilege?.name === "Publicador") &&
        !pp.endDate
    )
    return pubPriv?.startDate ? dayjs(pubPriv.startDate).format("YYYY-MM-DD") : null
}
