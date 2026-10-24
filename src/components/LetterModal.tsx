import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Edit3, Check, X, RotateCcw, Share2 } from 'lucide-react';
import {
  LetterContent,
  validateLetterContent,
  DEFAULT_LETTER_CONTENT,
  encodeLetterToQueryParams,
} from '../utils/sceneState';

interface LetterModalProps {
  isOpen: boolean;
  isEditingInitial?: boolean;
  letterContent: LetterContent;
  proposalAccepted: boolean;
  onClose: () => void;
  onAcceptProposal: () => void;
  onSaveLetterContent: (newContent: LetterContent) => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  isEditingInitial = false,
  letterContent,
  proposalAccepted,
  onClose,
  onAcceptProposal,
  onSaveLetterContent,
}) => {
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [draft, setDraft] = useState<LetterContent>(letterContent);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [playfulPromptIndex, setPlayfulPromptIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  const playfulPrompts = [
    'Ainda pensando com carinho?',
    'Os corações da fazenda estão torcendo pelo Sim!',
    'Olha como o campo de flores ficou mais bonito hoje!',
  ];

  useEffect(() => {
    setDraft(letterContent);
  }, [letterContent]);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditingInitial);
      setErrors({});
      setShareCopied(false);
    }
  }, [isOpen, isEditingInitial]);

  if (!isOpen) return null;

  const handleShareLink = async () => {
    const query = encodeLetterToQueryParams(letterContent);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, '', `?${query}`);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${letterContent.headline} — Para ${letterContent.recipientName}`,
          text: `Uma carta especial esperando por você na Fazenda dos Corações!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if user cancels share sheet
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 3000);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLetterContent(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const updated: LetterContent = {
      recipientName: draft.recipientName.trim(),
      senderName: draft.senderName.trim(),
      headline: draft.headline.trim(),
      bodyText: draft.bodyText.trim(),
      postscript: draft.postscript.trim(),
    };
    onSaveLetterContent(updated);
    const query = encodeLetterToQueryParams(updated);
    window.history.replaceState(null, '', `?${query}`);
    setIsEditing(false);
  };

  const handleResetDefault = () => {
    setDraft(DEFAULT_LETTER_CONTENT);
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(18, 13, 24, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border-4 border-[#6e3b3b] bg-[#fff7eb] text-[#3d251e] p-4 sm:p-8 pixel-card">
        {/* Top Corner Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-[#e8d5be]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#8c584c] min-w-0">
            <span className="truncate">Carta Pixel Art</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Selo Real de Coração</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-md border border-[#d5b895] bg-[#f7e8d0] text-[#59372c] hover:bg-[#eed7b5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>{shareCopied ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setErrors({});
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-md border border-[#d5b895] bg-[#f7e8d0] text-[#59372c] hover:bg-[#eed7b5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>{isEditing ? 'Ver Carta' : 'Personalizar'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar carta"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[#d5b895] bg-[#f7e8d0] text-[#59372c] hover:bg-[#eed7b5] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveSubmit} className="mt-5 space-y-4" noValidate>
            <div className="flex items-center justify-between">
              <h2
                id="letter-modal-title"
                className="text-xl font-bold text-[#4a2c23] font-display"
              >
                Personalizar Pedido de Namoro
              </h2>
              <button
                type="button"
                onClick={handleResetDefault}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#8c584c] hover:text-[#4a2c23] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar texto original</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="recipient-input"
                  className="block text-xs font-semibold text-[#59372c] mb-1"
                >
                  Para quem é a carta?
                </label>
                <input
                  id="recipient-input"
                  type="text"
                  value={draft.recipientName}
                  onChange={(e) =>
                    setDraft({ ...draft, recipientName: e.target.value })
                  }
                  placeholder="Ex: Meu Amor, Sofia..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-[#cfa982] bg-white text-[#3d251e] focus:outline-none focus:ring-2 focus:ring-[#d93854]"
                />
                {errors.recipientName && (
                  <p className="mt-1 text-xs font-medium text-[#c92a42]">
                    {errors.recipientName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sender-input"
                  className="block text-xs font-semibold text-[#59372c] mb-1"
                >
                  Sua assinatura
                </label>
                <input
                  id="sender-input"
                  type="text"
                  value={draft.senderName}
                  onChange={(e) =>
                    setDraft({ ...draft, senderName: e.target.value })
                  }
                  placeholder="Ex: Com todo meu amor, Lucas"
                  className="w-full px-3 py-2 text-sm rounded-md border border-[#cfa982] bg-white text-[#3d251e] focus:outline-none focus:ring-2 focus:ring-[#d93854]"
                />
                {errors.senderName && (
                  <p className="mt-1 text-xs font-medium text-[#c92a42]">
                    {errors.senderName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="headline-input"
                className="block text-xs font-semibold text-[#59372c] mb-1"
              >
                Pergunta do Pedido (aparece na carta 3D)
              </label>
              <input
                id="headline-input"
                type="text"
                value={draft.headline}
                onChange={(e) =>
                  setDraft({ ...draft, headline: e.target.value })
                }
                placeholder="Quer namorar comigo?"
                className="w-full px-3 py-2 text-sm rounded-md border border-[#cfa982] bg-white text-[#3d251e] focus:outline-none focus:ring-2 focus:ring-[#d93854]"
              />
              {errors.headline && (
                <p className="mt-1 text-xs font-medium text-[#c92a42]">
                  {errors.headline}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="body-input"
                className="block text-xs font-semibold text-[#59372c] mb-1"
              >
                Mensagem da Carta
              </label>
              <textarea
                id="body-input"
                rows={4}
                value={draft.bodyText}
                onChange={(e) =>
                  setDraft({ ...draft, bodyText: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-[#cfa982] bg-white text-[#3d251e] focus:outline-none focus:ring-2 focus:ring-[#d93854]"
              />
              {errors.bodyText && (
                <p className="mt-1 text-xs font-medium text-[#c92a42]">
                  {errors.bodyText}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-[#cfa982] bg-[#f7e8d0] text-[#59372c] hover:bg-[#eed7b5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-md bg-[#d92644] text-white hover:bg-[#b81d38] transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar na Carta 3D</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-center space-y-5">
            {/* Pixel-Art Heart Wax Seal Emblem */}
            <div className="mx-auto w-12 h-12 rounded-lg bg-[#ffe0e6] border-2 border-[#e63956] flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#d92644] fill-[#d92644]" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#8c584c]">
                Para: {letterContent.recipientName}
              </p>
              <h2
                id="letter-modal-title"
                className="text-2xl sm:text-3xl font-bold text-[#c92a42] font-display tracking-tight"
              >
                {letterContent.headline}
              </h2>
            </div>

            <p className="text-base leading-relaxed text-[#4a3228] max-w-lg mx-auto">
              “{letterContent.bodyText}”
            </p>

            {letterContent.postscript && (
              <p className="text-xs italic text-[#7a5244]">
                P.S.: {letterContent.postscript}
              </p>
            )}

            <div className="pt-1 text-sm font-semibold text-[#6e473b] font-display">
              — {letterContent.senderName}
            </div>

            {/* Interactive Proposal Response Section */}
            <div className="pt-4 border-t border-[#e8d5be]">
              {proposalAccepted ? (
                <div
                  data-testid="proposal-accepted-banner"
                  className="p-4 rounded-lg bg-[#fff0f3] border-2 border-[#ff4d6d] text-[#a31631] space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 font-bold text-base font-display">
                    <Sparkles className="w-5 h-5 text-[#e63956]" />
                    <span>Pedido Aceito! Nosso capítulo começa agora!</span>
                  </div>
                  <p className="text-xs text-[#7a2838]">
                    Os corações da fazenda estão saltitando em festa ao fundo. Feche a
                    carta se quiser passear pelo cenário em clima de celebração!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={onAcceptProposal}
                      className="pixel-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg bg-[#d92644] text-white hover:bg-[#b81d38] shadow-md cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Sim, eu aceito!</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPlayfulPromptIndex(
                          (prev) => (prev + 1) % playfulPrompts.length
                        )
                      }
                      className="pixel-button px-4 py-3 text-xs font-semibold rounded-lg border border-[#d5b895] bg-[#f7e8d0] text-[#59372c] hover:bg-[#eed7b5] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Ler mais uma vez
                    </button>
                  </div>

                  {playfulPromptIndex > 0 && (
                    <p className="text-xs font-medium text-[#b81d38]">
                      {playfulPrompts[playfulPromptIndex]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
