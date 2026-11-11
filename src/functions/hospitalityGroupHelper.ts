export interface IHospitalityGroupLike {
    name?: string | null;
    position?: number | null;
}

export function getHospitalityGroupDisplayName(group?: IHospitalityGroupLike | null): string {
    if (!group) return "";
    const name = group.name?.trim();
    const position = group.position;

    if (position && position > 0) {
        if (!name || new RegExp(`^grupo\\s*${position}$`, "i").test(name)) {
            return `Grupo ${position}`;
        }
        return `Grupo ${position} • ${name}`;
    }

    return name || "Grupo";
}
