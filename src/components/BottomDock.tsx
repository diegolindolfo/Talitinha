import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sun,
  Volume2,
  VolumeX,
  MailOpen,
  Edit3,
} from 'lucide-react';
import {
  SceneId,
  TimeOfDayId,
  SCENE_ORDER,
  SCENE_PRESETS,
  TIME_OF_DAY_PRESETS,
} from '../utils/sceneState';

interface BottomDockProps {
  activeScene: SceneId;
  timeOfDay: TimeOfDayId;
  isMuted: boolean;
  isCollapsed: boolean;
  onSelectScene: (scene: SceneId) => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onSelectTimeOfDay: (tod: TimeOfDayId) => void;
  onToggleMute: () => void;
  onToggleCollapse: () => void;
  onOpenLetter: () => void;
  onCustomizeLetter: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeScene,
  timeOfDay,
  isMuted,
  isCollapsed,
  onSelectScene,
  onPrevScene,
  onNextScene,
  onSelectTimeOfDay,
  onToggleMute,
  onToggleCollapse,
  onOpenLetter,
  onCustomizeLetter,
}) => {
  const timeKeys: TimeOfDayId[] = [
    'golden_sunset',
    'sunny_meadow',
    'pastel_dawn',
    'starry_night',
  ];

  return (
    <div
      className="fixed z-20 left-1/2 -translate-x-1/2 bottom-4 w-full max-w-[min(940px,94vw)] pointer-events-none flex flex-col items-center"
      aria-label="Controles de cena e iluminação"
    >
      {/* Collapse / Expand Cinema Mode Toggle Tab */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-t-lg border border-b-0 border-[#5c3d46] bg-[#241926] text-[#ffebd6] hover:bg-[#322236] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#ff758f]" />
            <span>Mostrar Controles (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#ff758f]" />
            <span>Ocultar Controles (H)</span>
          </>
        )}
      </button>

      {/* Main Unified Control Dock (No backdrop-filter over WebGL; uses solid high-contrast retro slate) */}
      {!isCollapsed && (
        <div
          className="pointer-events-auto w-full rounded-xl border-2 border-[#5c3d46] bg-[#211724] px-2.5 py-2 sm:px-4 sm:py-3 shadow-2xl flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-2 sm:gap-3"
          style={{ backgroundColor: 'rgba(33, 23, 36, 0.96)' }}
        >
          {/* Row 1 on Mobile / Left Group on Desktop: Prev + 4 Scene Tabs + Next */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={onPrevScene}
              aria-label="Cena Anterior"
              className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-lg border border-[#4a313b] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              className="flex-1 sm:flex-initial grid grid-cols-4 sm:flex items-center gap-0.5 sm:gap-1 p-1 rounded-lg bg-[#160f18] border border-[#3d2833]"
              role="tablist"
              aria-label="Cenas da História"
            >
              {SCENE_ORDER.map((sceneId) => {
                const preset = SCENE_PRESETS[sceneId];
                const isActive = activeScene === sceneId;
                return (
                  <button
                    key={sceneId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectScene(sceneId)}
                    className={`px-1 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap truncate text-center cursor-pointer ${
                      isActive
                        ? 'bg-[#d92644] text-white'
                        : 'text-[#d9c3b8] hover:text-white hover:bg-[#2b1e2e]'
                    }`}
                  >
                    <span className="hidden sm:inline">0{preset.index}. </span>
                    <span>{preset.shortLabel.replace(/^0\d\.\s*/, '')}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onNextScene}
              aria-label="Próxima Cena"
              className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-lg border border-[#4a313b] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2 on Mobile / Right Group on Desktop: Time of Day + Letter Actions + Audio */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
              <Sun className="w-4 h-4 text-[#ffb703] shrink-0 hidden sm:block" />
              <label htmlFor="time-of-day-select" className="sr-only">
                Clima e Horário
              </label>
              <select
                id="time-of-day-select"
                value={timeOfDay}
                onChange={(e) => onSelectTimeOfDay(e.target.value as TimeOfDayId)}
                className="w-full sm:w-auto px-2 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg border border-[#4a313b] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] focus:outline-none focus:ring-2 focus:ring-[#ff4d6d] truncate cursor-pointer"
              >
                {timeKeys.map((k) => (
                  <option key={k} value={k}>
                    {TIME_OF_DAY_PRESETS[k].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onCustomizeLetter}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg border border-[#5c3d46] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#ffb3c6]" />
                <span className="hidden sm:inline">Editar Carta</span>
                <span className="sm:hidden">Editar</span>
              </button>

              <button
                type="button"
                onClick={onOpenLetter}
                className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 min-h-[34px] text-xs font-bold rounded-lg bg-[#d92644] text-white hover:bg-[#b81d38] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MailOpen className="w-3.5 h-3.5" />
                <span>Ler Pedido</span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#4a313b] bg-[#2e2032] text-[#ffebd6] hover:bg-[#3d2b42] transition-colors shrink-0 cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#a38f96]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#ff758f]" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
