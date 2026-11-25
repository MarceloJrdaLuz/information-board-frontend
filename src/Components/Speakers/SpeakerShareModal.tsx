import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { api } from "@/services/api";
import dayjs from "dayjs";
import { Check, Clock, Copy, Loader2, RefreshCw, Share2, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SpeakerShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakerShareModal({ isOpen, onClose }: SpeakerShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<{
    token: string;
    expires_at: string;
    congregation?: { name: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchToken = async (force: boolean = false) => {
    setLoading(true);
    try {
      const res = await api.post(`/speakers/share/generate${force ? "?force=true" : ""}`);
      setTokenData(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erro ao gerar código de compartilhamento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchToken(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!tokenData?.token) return;
    try {
      await navigator.clipboard.writeText(tokenData.token);
      setCopied(true);
      toast.success("Código copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.info("Não foi possível copiar automaticamente.");
    }
  };

  const formattedExpires = tokenData?.expires_at
    ? dayjs(tokenData.expires_at).format("DD/MM/YYYY [às] HH:mm")
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-surface-100 border border-surface-300 text-typography-900 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-primary-200 font-bold text-xs uppercase tracking-wider">
            <Share2 size={16} />
            <span>Compartilhar Arranjo de Oradores</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-typography-900 tracking-tight">
            Código de Compartilhamento
          </DialogTitle>
          <DialogDescription className="text-xs text-typography-500 leading-relaxed">
            Compartilhe este código com o coordenador da outra congregação para que ele possa importar as congregações, oradores e temas cadastrados na sua lista.
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 flex flex-col items-center justify-center gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3 text-typography-500">
              <Loader2 className="h-8 w-8 animate-spin text-primary-200" />
              <span className="text-xs font-medium">Gerando código seguro...</span>
            </div>
          ) : tokenData ? (
            <>
              {/* Box do Código PIN */}
              <div className="w-full bg-surface-200/80 border border-primary-200/30 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-typography-500">
                  Código de Importação (PIN)
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-primary-200 selection:bg-primary-200 selection:text-white">
                    {tokenData.token}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-typography-500 mt-1">
                  <Clock size={13} className="text-primary-200" />
                  <span>Válido por 48h (até {formattedExpires})</span>
                </div>
              </div>

              {/* Botão de Copiar */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 px-4 rounded-xl bg-primary-200 hover:bg-primary-150 active:scale-98 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-white" />
                    <span>Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>

              {/* Dica de Segurança */}
              <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-snug">
                  Apenas usuários com perfil de coordenação da outra congregação conseguirão visualizar a prévia e importar os oradores.
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Rodapé com Ações Auxiliares */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-300 text-xs">
          <button
            type="button"
            onClick={() => fetchToken(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-typography-500 hover:text-primary-200 transition-colors cursor-pointer font-medium disabled:opacity-50"
            title="Gera um novo código e invalida o anterior"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Gerar novo código</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-surface-300 hover:bg-surface-200 text-typography-600 transition cursor-pointer font-medium"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
