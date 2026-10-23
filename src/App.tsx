import { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowRight, MailOpen, Sparkles } from 'lucide-react';
import {
  SceneId,
  TimeOfDayId,
  SCENE_PRESETS,
  DEFAULT_LETTER_CONTENT,
  LetterContent,
  getNextSceneId,
  getPrevSceneId,
} from './utils/sceneState';
import { soundEngine } from './utils/soundEffects';
import { RetroFarmCanvas } from './components/RetroFarmCanvas';
import { BottomDock } from './components/BottomDock';
import { LetterModal } from './components/LetterModal';

export default function App() {
  const [activeScene, setActiveScene] = useState<SceneId>('farm');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayId>('golden_sunset');
  const [letterContent, setLetterContent] = useState<LetterContent>(
    DEFAULT_LETTER_CONTENT
  );
  const [proposalAccepted, setProposalAccepted] = useState<boolean>(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);
  const [isEditingLetter, setIsEditingLetter] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const currentPreset = SCENE_PRESETS[activeScene];

  // Expose key state on document.body for deterministic verification
  useEffect(() => {
    document.body.setAttribute('data-scene', activeScene);
    document.body.setAttribute('data-time-of-day', timeOfDay);
    document.body.setAttribute(
      'data-proposal-accepted',
      proposalAccepted ? 'true' : 'false'
    );
  }, [activeScene, timeOfDay, proposalAccepted]);

  const handleSelectScene = useCallback((nextScene: SceneId) => {
    setActiveScene(nextScene);
    soundEngine.playSceneTransition();
  }, []);

  const handleNextScene = useCallback(() => {
    setActiveScene((prev) => {
      const next = getNextSceneId(prev);
      soundEngine.playSceneTransition();
      return next;
    });
  }, []);

  const handlePrevScene = useCallback(() => {
    setActiveScene((prev) => {
      const next = getPrevSceneId(prev);
      soundEngine.playSceneTransition();
      return next;
    });
  }, []);

  const handleOpenLetterModal = useCallback(() => {
    setActiveScene('proposal');
    setIsEditingLetter(false);
    setIsLetterModalOpen(true);
    soundEngine.playLetterOpen();
  }, []);

  const handleCustomizeLetter = useCallback(() => {
    setIsEditingLetter(true);
    setIsLetterModalOpen(true);
  }, []);

  const handleAcceptProposal = useCallback(() => {
    setProposalAccepted(true);
    soundEngine.playCelebrationFanfare();
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      return next;
    });
  }, []);

  // Keyboard shortcuts: Left/Right arrows for scenes, H to hide/show HUD
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      } else if (e.key === 'ArrowRight' && !isLetterModalOpen) {
        handleNextScene();
      } else if (e.key === 'ArrowLeft' && !isLetterModalOpen) {
        handlePrevScene();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextScene, handlePrevScene, isLetterModalOpen]);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* Full-Bleed 3D Pixel Art Viewport */}
      <RetroFarmCanvas
        activeScene={activeScene}
        timeOfDay={timeOfDay}
        letterContent={letterContent}
        proposalAccepted={proposalAccepted}
        onSelectScene={handleSelectScene}
        onOpenLetterModal={handleOpenLetterModal}
      />

      {/* Minimal Top-Left Story & Scene Card (Leaves Center 3D Viewport 100% Unobstructed) */}
      {!isDockCollapsed && (
        <section
          aria-label="História da Cena Atual"
          className="fixed top-4 left-4 z-10 max-w-md rounded-xl border-2 border-[#5c3d46] px-4 py-3.5 text-[#fff8f0] shadow-xl pointer-events-auto"
          style={{ backgroundColor: 'rgba(33, 23, 36, 0.92)' }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[#ffb3c6]">
            <span>Fazenda dos Corações</span>
            <span aria-hidden="true">·</span>
            <span>Cena {currentPreset.index} de 4</span>
            {proposalAccepted && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#ffbe0b] font-semibold">
                  Pedido Aceito ♥
                </span>
              </>
            )}
          </div>

          <h1 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white font-display">
            {currentPreset.label}
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-[#e6d5cf] leading-relaxed">
            {currentPreset.poeticLine}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {activeScene !== 'proposal' ? (
              <button
                type="button"
                onClick={handleNextScene}
                className="pixel-button inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#d92644] text-white hover:bg-[#b81d38] cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {activeScene === 'flying_letter'
                    ? 'Abrir a Carta Voando'
                    : 'Próxima Cena'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenLetterModal}
                className="pixel-button inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#d92644] text-white hover:bg-[#b81d38] cursor-pointer whitespace-nowrap shrink-0"
              >
                <MailOpen className="w-3.5 h-3.5" />
                <span>Abrir Carta: "{letterContent.headline}"</span>
              </button>
            )}

            {activeScene !== 'proposal' && (
              <button
                type="button"
                onClick={handleOpenLetterModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#5c3d46] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Heart className="w-3.5 h-3.5 text-[#ff4d6d] fill-[#ff4d6d]" />
                <span>Ir para o Pedido</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Subtle Floating Celebration Banner when Proposal is Accepted */}
      {proposalAccepted && !isLetterModalOpen && !isDockCollapsed && (
        <div
          data-testid="celebration-toast"
          className="fixed top-4 right-4 z-10 max-w-xs rounded-xl border-2 border-[#ffbe0b] px-4 py-3 text-[#fff8f0] shadow-xl pointer-events-auto"
          style={{ backgroundColor: 'rgba(54, 21, 35, 0.94)' }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#ffbe0b] font-display">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Ela(e) disse SIM! ♥</span>
          </div>
          <p className="mt-1 text-xs text-[#ffd6e0]">
            Para: {letterContent.recipientName} · {letterContent.senderName}
          </p>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <BottomDock
        activeScene={activeScene}
        timeOfDay={timeOfDay}
        isMuted={isMuted}
        isCollapsed={isDockCollapsed}
        onSelectScene={handleSelectScene}
        onPrevScene={handlePrevScene}
        onNextScene={handleNextScene}
        onSelectTimeOfDay={setTimeOfDay}
        onToggleMute={handleToggleMute}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        onOpenLetter={handleOpenLetterModal}
        onCustomizeLetter={handleCustomizeLetter}
      />

      {/* Romantic Pixel-Art Love Letter Modal & Customizer */}
      <LetterModal
        isOpen={isLetterModalOpen}
        isEditingInitial={isEditingLetter}
        letterContent={letterContent}
        proposalAccepted={proposalAccepted}
        onClose={() => setIsLetterModalOpen(false)}
        onAcceptProposal={handleAcceptProposal}
        onSaveLetterContent={(updated) => setLetterContent(updated)}
      />
    </main>
  );
}
