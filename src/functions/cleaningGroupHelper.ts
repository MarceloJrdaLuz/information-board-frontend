export function getCleaningGroupDisplayName(
    group?: { order?: number; name?: string | null } | null
): string {
    if (!group) return "";
    const orderNum = group.order;
    const defaultLabel = orderNum ? `Grupo ${orderNum}` : "Grupo";
    const name = group.name?.trim();

    // Se não tem nome ou o nome é "Grupo X", exibe o padrão "Grupo {order}"
    if (!name || /^grupo\s*\d+$/i.test(name)) {
        return defaultLabel;
    }

    // Se o nome personalizado já começa com o rótulo do grupo (ex: "Grupo 1 - Sala B")
    if (orderNum && name.toLowerCase().startsWith(defaultLabel.toLowerCase())) {
        return name;
    }

    // Se tem um nome personalizado distinto (ex: "Salão Anexo")
    if (orderNum) {
        return `${defaultLabel} • ${name}`;
    }

    return name;
}
