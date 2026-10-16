import { useAuthContext } from "@/context/AuthContext";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import relativeTime from "dayjs/plugin/relativeTime";
import {
    CheckCircle2,
    Fingerprint,
    Info,
    KeyRound,
    Loader2,
    Plus,
    ShieldCheck,
    Smartphone,
    Trash2,
    X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface PasskeyItem {
    id: string;
    credentialId: string;
    nickname: string;
    deviceType: string;
    backedUp: boolean;
    createdAt: string;
    lastUsedAt: string | null;
}

interface PasskeysModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PasskeysModal({ isOpen, onClose }: PasskeysModalProps) {
    const { registerPasskey, listPasskeys, deletePasskey } = useAuthContext();

    const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [nickname, setNickname] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    const [supportsWebAuthn, setSupportsWebAuthn] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSupportsWebAuthn(browserSupportsWebAuthn());
        }
    }, []);

    const fetchPasskeys = async () => {
        try {
            setLoading(true);
            const data = await listPasskeys();
            setPasskeys(data || []);
        } catch (error) {
            console.error("Erro ao listar chaves de acesso:", error);
            toast.error("Não foi possível carregar as chaves de acesso.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPasskeys();
            setShowNameInput(false);
            setNickname(getDefaultDeviceName());
        }
    }, [isOpen]);

    function getDefaultDeviceName() {
        if (typeof window === "undefined") return "Meu Dispositivo";
        const ua = navigator.userAgent;
        if (/iPad|Macintosh/i.test(ua) && 'ontouchend' in document) return "iPad";
        if (/iPhone/i.test(ua)) return "iPhone";
        if (/Android/i.test(ua)) return "Dispositivo Android";
        if (/Windows/i.test(ua)) return "PC Windows";
        if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
        return "Meu Aparelho";
    }

    const handleCreatePasskey = async () => {
        try {
            setIsRegistering(true);
            const keyName = nickname.trim() || getDefaultDeviceName();

            await registerPasskey(keyName);
            toast.success("Chave de Acesso cadastrada com sucesso!");
            setShowNameInput(false);
            await fetchPasskeys();
        } catch (error: any) {
            console.error("Erro ao registrar passkey:", error);
            // Usuário cancelou o prompt biométrico
            if (error?.name === "NotAllowedError") {
                toast.info("Cadastro da chave cancelado.");
            } else {
                toast.error(error?.response?.data?.message || error?.message || "Erro ao cadastrar chave de acesso.");
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover esta chave de acesso?")) return;

        try {
            setDeletingId(id);
            await deletePasskey(id);
            toast.success("Chave de acesso removida.");
            setPasskeys(prev => prev.filter(pk => pk.id !== id));
        } catch (error) {
            toast.error("Erro ao remover chave de acesso.");
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-surface-100 border border-surface-300 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Cabeçalho */}
                <div className="p-4 sm:p-5 border-b border-surface-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center border border-primary-200/20 shrink-0">
                            <Fingerprint className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-typography-900 leading-tight">
                                Chaves de Acesso (Passkeys)
                            </h3>
                            <p className="text-xs text-typography-500">
                                Entre com Face ID, Touch ID ou biometria sem digitar senha
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-typography-400 hover:text-typography-900 hover:bg-surface-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
                    {/* Alerta de Suporte */}
                    {!supportsWebAuthn ? (
                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <span>
                                Este navegador não suporta Chaves de Acesso (WebAuthn). Para usar biometria, recomendamos usar o Safari no iOS/iPadOS ou Chrome/Edge atualizados.
                            </span>
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Seu dispositivo é compatível com Face ID / Touch ID e biometria segura FIDO2.
                            </span>
                        </div>
                    )}

                    {/* Formulário / Botão de Adicionar */}
                    {supportsWebAuthn && (
                        <div className="p-3.5 rounded-xl bg-surface-200/60 border border-surface-300 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-typography-800 uppercase tracking-wide">
                                    Cadastrar este aparelho
                                </span>
                                {!showNameInput && (
                                    <button
                                        type="button"
                                        onClick={() => setShowNameInput(true)}
                                        className="text-[11px] text-primary-200 hover:underline font-semibold"
                                    >
                                        Personalizar nome
                                    </button>
                                )}
                            </div>

                            {showNameInput && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-medium text-typography-600">
                                        Nome amigável da chave:
                                    </label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Ex: Meu iPad, iPhone do Marcelo"
                                        className="text-xs p-2 rounded-lg bg-surface-100 border border-surface-300 text-typography-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleCreatePasskey}
                                disabled={isRegistering}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-200 hover:bg-primary-300 text-white font-semibold text-xs transition shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                            >
                                {isRegistering ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Aguardando biometria do aparelho...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>Adicionar Chave de Acesso ({nickname || getDefaultDeviceName()})</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Lista de Chaves Ativas */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-typography-700 uppercase tracking-wider">
                            Chaves Cadastradas ({passkeys.length})
                        </span>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 text-typography-500">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
                                <span className="text-xs">Carregando chaves...</span>
                            </div>
                        ) : passkeys.length === 0 ? (
                            <div className="p-6 rounded-xl bg-surface-200/30 border border-dashed border-surface-300 text-center flex flex-col items-center gap-2">
                                <KeyRound className="w-8 h-8 text-typography-400" />
                                <p className="text-xs text-typography-500 font-medium">
                                    Você ainda não possui nenhuma Chave de Acesso cadastrada.
                                </p>
                                <p className="text-[11px] text-typography-400 max-w-xs">
                                    Adicione seu iPad, iPhone ou computador para poder entrar no sistema instantaneamente com sua biometria.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {passkeys.map((pk) => (
                                    <div
                                        key={pk.id}
                                        className="p-3 rounded-xl bg-surface-200/50 border border-surface-300 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-300 flex items-center justify-center text-primary-200 shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs font-bold text-typography-900 truncate">
                                                        {pk.nickname}
                                                    </span>
                                                    {pk.backedUp && (
                                                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            Nuvem
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-typography-500 mt-0.5">
                                                    <span>Criada {dayjs(pk.createdAt).fromNow()}</span>
                                                    {pk.lastUsedAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Último uso {dayjs(pk.lastUsedAt).fromNow()}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(pk.id)}
                                            disabled={deletingId === pk.id}
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                            title="Excluir esta chave"
                                        >
                                            {deletingId === pk.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rodapé */}
                <div className="p-3 bg-surface-200/40 border-t border-surface-300 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-typography-700 hover:bg-surface-300 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

