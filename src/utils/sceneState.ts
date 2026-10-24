export type SceneId = 'farm' | 'flower_field' | 'flying_letter' | 'proposal';

export type TimeOfDayId = 'golden_sunset' | 'sunny_meadow' | 'pastel_dawn' | 'starry_night';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface ScenePreset {
  id: SceneId;
  index: number;
  label: string;
  shortLabel: string;
  subtitle: string;
  poeticLine: string;
  cameraPos: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  fov: number;
}

export interface TimeOfDayPreset {
  id: TimeOfDayId;
  label: string;
  skyTopHex: number;
  skyHorizonHex: number;
  fogHex: number;
  fogDensity: number;
  keyLightHex: number;
  keyLightIntensity: number;
  keyLightPos: Vector3Tuple;
  hemiSkyHex: number;
  hemiGroundHex: number;
  hemiIntensity: number;
  rimLightHex: number;
  rimLightIntensity: number;
}

export interface LetterContent {
  recipientName: string;
  senderName: string;
  headline: string;
  bodyText: string;
  postscript: string;
}

export interface LetterValidationResult {
  valid: boolean;
  errors: {
    recipientName?: string;
    senderName?: string;
    headline?: string;
    bodyText?: string;
  };
}

export const SCENE_ORDER: SceneId[] = [
  'farm',
  'flower_field',
  'flying_letter',
  'proposal',
];

export const SCENE_PRESETS: Record<SceneId, ScenePreset> = {
  farm: {
    id: 'farm',
    index: 1,
    label: '01. Casinha, Alpendre & Quintal',
    shortLabel: '01. Quintal',
    subtitle: 'Casinha com alpendre de brinquedos, pula-pula, árvore de frutas e balanço',
    poeticLine:
      'Na varanda com brinquedos, entre o pula-pula divertido, a árvore carregada de frutas e o balanço à sombra, mora o nosso futuro.',
    cameraPos: { x: -4.8, y: 5.6, z: 11.2 },
    cameraTarget: { x: -4.8, y: 1.9, z: -0.4 },
    fov: 45,
  },
  flower_field: {
    id: 'flower_field',
    index: 2,
    label: '02. Campo de Flores',
    shortLabel: '02. Flores',
    subtitle: 'Um mar de pétalas coloridas dançando na brisa',
    poeticLine:
      'Sob a grande cerejeira em flor e o balanço de madeira, centenas de flores pixeladas se inclinam enquanto corações saltitam no horizonte.',
    cameraPos: { x: 15.5, y: 4.8, z: 11.5 },
    cameraTarget: { x: 9.5, y: 2.6, z: -2.5 },
    fov: 42,
  },
  flying_letter: {
    id: 'flying_letter',
    index: 3,
    label: '03. A Carta Voando',
    shortLabel: '03. A Carta',
    subtitle: 'Trazida pelo vento com um pedido especial',
    poeticLine:
      'Balançando suavemente entre nuvens douradas e corações saltitantes, a carta voa aberta revelando o pedido escrito com carinho.',
    cameraPos: { x: 0.4, y: 5.2, z: 7.8 },
    cameraTarget: { x: 0.2, y: 4.75, z: 1.5 },
    fov: 38,
  },
  proposal: {
    id: 'proposal',
    index: 4,
    label: '04. O Pedido de Namoro',
    shortLabel: '04. O Pedido',
    subtitle: 'Uma pergunta escrita com todo o meu coração',
    poeticLine:
      'O selo se abre, os corações celebram ao redor do vale e a pergunta mais importante finalmente pousa em suas mãos.',
    cameraPos: { x: 0.25, y: 4.95, z: 5.5 },
    cameraTarget: { x: 0.15, y: 4.75, z: 1.6 },
    fov: 36,
  },
};

export const TIME_OF_DAY_PRESETS: Record<TimeOfDayId, TimeOfDayPreset> = {
  golden_sunset: {
    id: 'golden_sunset',
    label: 'Pôr do Sol Romântico',
    skyTopHex: 0x3b2d54,
    skyHorizonHex: 0xf4976c,
    fogHex: 0xf29f79,
    fogDensity: 0.011,
    keyLightHex: 0xffb36b,
    keyLightIntensity: 2.6,
    keyLightPos: { x: 26, y: 24, z: -18 },
    hemiSkyHex: 0xffd1b3,
    hemiGroundHex: 0x475c38,
    hemiIntensity: 1.15,
    rimLightHex: 0xff6b8b,
    rimLightIntensity: 1.4,
  },
  sunny_meadow: {
    id: 'sunny_meadow',
    label: 'Manhã Ensolarada',
    skyTopHex: 0x4ea8de,
    skyHorizonHex: 0xbde0fe,
    fogHex: 0xc8e7ff,
    fogDensity: 0.009,
    keyLightHex: 0xfff3d1,
    keyLightIntensity: 2.8,
    keyLightPos: { x: 20, y: 34, z: 16 },
    hemiSkyHex: 0x90e0ef,
    hemiGroundHex: 0x527946,
    hemiIntensity: 1.3,
    rimLightHex: 0xffe599,
    rimLightIntensity: 1.1,
  },
  pastel_dawn: {
    id: 'pastel_dawn',
    label: 'Aurora Pastel',
    skyTopHex: 0x6d597a,
    skyHorizonHex: 0xffcad4,
    fogHex: 0xfcd5ce,
    fogDensity: 0.011,
    keyLightHex: 0xffccd5,
    keyLightIntensity: 2.4,
    keyLightPos: { x: -24, y: 22, z: -14 },
    hemiSkyHex: 0xffeaee,
    hemiGroundHex: 0x4a6b53,
    hemiIntensity: 1.25,
    rimLightHex: 0xff8fab,
    rimLightIntensity: 1.35,
  },
  starry_night: {
    id: 'starry_night',
    label: 'Noite Estrelada',
    skyTopHex: 0x101426,
    skyHorizonHex: 0x262b47,
    fogHex: 0x1e2238,
    fogDensity: 0.013,
    keyLightHex: 0xaaccff,
    keyLightIntensity: 1.7,
    keyLightPos: { x: 18, y: 28, z: -12 },
    hemiSkyHex: 0x5c6f9e,
    hemiGroundHex: 0x1f2e25,
    hemiIntensity: 0.85,
    rimLightHex: 0xff758f,
    rimLightIntensity: 1.6,
  },
};

export const DEFAULT_LETTER_CONTENT: LetterContent = {
  recipientName: 'Meu Amor',
  senderName: 'Com todo o meu carinho',
  headline: 'Quer namorar comigo?',
  bodyText:
    'Como este campo de flores que ganha vida ao sol, meus dias ficaram muito mais bonitos desde que você chegou. Quero construir nossa própria fazendinha de sonhos, dividir cada pôr do sol e caminhar ao seu lado em todas as estações.',
  postscript: 'Prometo cuidar do seu coração todos os dias.',
};

export function getNextSceneId(current: SceneId): SceneId {
  const idx = SCENE_ORDER.indexOf(current);
  if (idx === -1) return 'farm';
  return SCENE_ORDER[(idx + 1) % SCENE_ORDER.length];
}

export function getPrevSceneId(current: SceneId): SceneId {
  const idx = SCENE_ORDER.indexOf(current);
  if (idx === -1) return 'farm';
  return SCENE_ORDER[(idx - 1 + SCENE_ORDER.length) % SCENE_ORDER.length];
}

/**
 * Frame-rate independent exponential damping helper.
 */
export function dampValue(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  if (dt <= 0) return current;
  const factor = 1 - Math.exp(-lambda * dt);
  return current + (target - current) * factor;
}

/**
 * Computes the vertical bounce offset and squash/stretch scale for a 3D pixel heart.
 * Uses a joyful arcade abs(sin) hop curve so hearts visibly hop and bounce in the background.
 */
export function computeHeartBounce(
  baseY: number,
  elapsedTime: number,
  phase: number,
  speed: number,
  amplitude: number,
  celebrationBoost = 1
): { y: number; scaleY: number; scaleXZ: number; rotY: number } {
  const t = elapsedTime * speed * celebrationBoost + phase;
  const sinVal = Math.sin(t);
  const absSin = Math.abs(sinVal);
  // Crisp parabolic-like bounce
  const hop = Math.pow(absSin, 0.78) * amplitude * celebrationBoost;
  // Subtle squash at bottom of bounce, stretch near peak
  const stretch = 1 + (absSin - 0.45) * 0.14 * Math.min(celebrationBoost, 1.5);
  const squashXZ = 1 / Math.sqrt(Math.max(0.75, stretch));
  return {
    y: baseY + hop,
    scaleY: stretch,
    scaleXZ: squashXZ,
    rotY: phase + elapsedTime * 0.85 * celebrationBoost,
  };
}

/**
 * Computes the 3D position and rotation of the flying love letter based on active scene and time.
 */
export function computeFlyingLetterPose(
  sceneId: SceneId,
  elapsedTime: number
): {
  pos: Vector3Tuple;
  rot: Vector3Tuple;
  flapOpenRatio: number;
  sheetRiseRatio: number;
} {
  if (sceneId === 'proposal') {
    // Hovers steadily close to camera, opened up so the entire letter is readable
    const gentleBob = Math.sin(elapsedTime * 2.1) * 0.09;
    const gentleSway = Math.cos(elapsedTime * 1.4) * 0.035;
    return {
      pos: { x: 0, y: 4.45 + gentleBob, z: 1.6 },
      rot: { x: 0.06 + gentleSway * 0.2, y: gentleSway, z: gentleSway * 0.3 },
      flapOpenRatio: 1,
      sheetRiseRatio: 1,
    };
  }

  if (sceneId === 'flying_letter') {
    // Soars gracefully in a breeze path with the proposal sheet risen and visible
    const swayX = Math.sin(elapsedTime * 1.15) * 0.95;
    const bobY = Math.sin(elapsedTime * 2.3) * 0.32;
    const swayZ = Math.cos(elapsedTime * 0.9) * 0.45;
    const rollZ = -Math.cos(elapsedTime * 1.15) * 0.14;
    const pitchX = 0.08 + Math.cos(elapsedTime * 2.3) * 0.08;
    const yawY = Math.sin(elapsedTime * 0.7) * 0.22;
    return {
      pos: { x: swayX, y: 4.55 + bobY, z: 1.5 + swayZ },
      rot: { x: pitchX, y: yawY, z: rollZ },
      flapOpenRatio: 0.92,
      sheetRiseRatio: 0.82,
    };
  }

  // In 'farm' or 'flower_field', the letter circles higher over the meadow waiting to be discovered
  const orbitAngle = elapsedTime * 0.55;
  const x = Math.sin(orbitAngle) * 4.2;
  const z = 1.5 + Math.cos(orbitAngle) * 2.4;
  const y = 5.4 + Math.sin(elapsedTime * 2.2) * 0.45;
  return {
    pos: { x, y, z },
    rot: {
      x: 0.22 + Math.sin(elapsedTime * 1.8) * 0.12,
      y: Math.atan2(Math.cos(orbitAngle) * 4.2, -Math.sin(orbitAngle) * 2.4) * 0.35,
      z: Math.cos(orbitAngle) * 0.2,
    },
    flapOpenRatio: 0,
    sheetRiseRatio: 0,
  };
}

/**
 * Validates custom letter input fields without silently substituting fallbacks on empty inputs.
 */
export function validateLetterContent(input: LetterContent): LetterValidationResult {
  const errors: LetterValidationResult['errors'] = {};

  if (!input.recipientName || input.recipientName.trim().length < 2) {
    errors.recipientName = 'Informe o nome de quem vai receber a carta (mín. 2 caracteres).';
  }
  if (!input.senderName || input.senderName.trim().length < 2) {
    errors.senderName = 'Informe a sua assinatura ou nome (mín. 2 caracteres).';
  }
  if (!input.headline || input.headline.trim().length < 4) {
    errors.headline = 'Escreva o pedido principal (ex: Quer namorar comigo?).';
  }
  if (!input.bodyText || input.bodyText.trim().length < 10) {
    errors.bodyText = 'A mensagem da carta deve ter pelo menos 10 caracteres.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Ground height function for the 3D terrain so all props sit flush on the ground.
 */
export function groundHeightAt(x: number, z: number): number {
  // Stream channel running diagonally near x = 2..5
  const streamCenter = 2.5 + Math.sin(z * 0.12) * 2.2;
  const distToStream = Math.abs(x - streamCenter);
  const streamDip = distToStream < 2.6 ? -0.55 * Math.cos((distToStream / 2.6) * (Math.PI / 2)) : 0;

  // Gentle rolling hills around the perimeter
  const radialDist = Math.hypot(x, z);
  const outerHills =
    radialDist > 22
      ? Math.pow((radialDist - 22) * 0.12, 1.35) *
        (0.65 + 0.35 * Math.sin(x * 0.18 + z * 0.15))
      : 0;

  const gentleUndulation =
    Math.sin(x * 0.09) * Math.cos(z * 0.09) * 0.22;

  return gentleUndulation + streamDip + outerHills;
}

/**
 * Adjusts camera position and FOV for narrow portrait mobile screens (aspect < 1)
 * so wide 3D subjects (like the flying love letter and barn) never clip horizontally.
 */
export function getResponsiveCameraPreset(
  preset: ScenePreset,
  aspect: number
): { cameraPos: Vector3Tuple; cameraTarget: Vector3Tuple; fov: number } {
  if (!Number.isFinite(aspect) || aspect >= 1) {
    return {
      cameraPos: { ...preset.cameraPos },
      cameraTarget: { ...preset.cameraTarget },
      fov: preset.fov,
    };
  }

  // Portrait mobile factor (e.g. 390/844 = 0.46 -> factor ~ 1.45)
  const clampedAspect = Math.max(0.4, aspect);
  const pullBackFactor = Math.min(1.65, 1 / Math.pow(clampedAspect, 0.55));

  const dx = preset.cameraPos.x - preset.cameraTarget.x;
  const dy = preset.cameraPos.y - preset.cameraTarget.y;
  const dz = preset.cameraPos.z - preset.cameraTarget.z;

  return {
    cameraPos: {
      x: preset.cameraTarget.x + dx * pullBackFactor,
      y: preset.cameraTarget.y + dy * (1 + (pullBackFactor - 1) * 0.45),
      z: preset.cameraTarget.z + dz * pullBackFactor,
    },
    cameraTarget: { ...preset.cameraTarget },
    fov: Math.min(56, preset.fov * (1 + (1 - clampedAspect) * 0.35)),
  };
}

/**
 * Encodes customized letter content into URL search parameters for easy sharing on mobile (WhatsApp/Direct).
 */
export function encodeLetterToQueryParams(content: LetterContent): string {
  const params = new URLSearchParams();
  params.set('to', content.recipientName.trim());
  params.set('from', content.senderName.trim());
  params.set('title', content.headline.trim());
  params.set('msg', content.bodyText.trim());
  if (content.postscript.trim()) {
    params.set('ps', content.postscript.trim());
  }
  return params.toString();
}

/**
 * Parses customized letter content from URL search parameters if present and valid.
 */
export function parseLetterFromQueryParams(
  search: string,
  fallback: LetterContent = DEFAULT_LETTER_CONTENT
): LetterContent {
  if (!search) return fallback;
  const params = new URLSearchParams(search);
  const to = params.get('to');
  const from = params.get('from');
  const title = params.get('title');
  const msg = params.get('msg');
  const ps = params.get('ps');

  if (!to && !from && !title && !msg) {
    return fallback;
  }

  const candidate: LetterContent = {
    recipientName: to?.trim() || fallback.recipientName,
    senderName: from?.trim() || fallback.senderName,
    headline: title?.trim() || fallback.headline,
    bodyText: msg?.trim() || fallback.bodyText,
    postscript: ps !== null ? ps.trim() : fallback.postscript,
  };

  const check = validateLetterContent(candidate);
  return check.valid ? candidate : fallback;
}

