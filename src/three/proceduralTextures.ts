import * as THREE from 'three';
import { LetterContent } from '../utils/sceneState';

/**
 * Generates a pixel-art meadow grass & dirt tile texture + matching grayscale bump map.
 */
export function createPixelMeadowTextures(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 64;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Base pixel-art green palette
  const greens = ['#5a9e4b', '#64ab54', '#509142', '#70b85e', '#49853b'];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Deterministic pseudo-random pixel pattern
      const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      const colorIdx = hash % greens.length;
      ctx.fillStyle = greens[colorIdx];
      ctx.fillRect(x, y, 1, 1);

      // Occasional tiny clover/pebble pixel accent
      if (hash % 29 === 0) {
        ctx.fillStyle = '#8fd175';
        ctx.fillRect(x, y, 1, 1);
      }

      const bumpVal = 110 + (hash % 50);
      bCtx.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
      bCtx.fillRect(x, y, 1, 1);
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(28, 28);
  colorMap.magFilter = THREE.NearestFilter;
  colorMap.minFilter = THREE.NearestMipmapLinearFilter;
  colorMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(28, 28);
  bumpMap.magFilter = THREE.NearestFilter;

  return { colorMap, bumpMap };
}

/**
 * Generates a pixel-art wood plank texture and bump map for the barn, windmill, and bridge.
 */
export function createPixelWoodTextures(
  baseHex: string,
  darkHex: string,
  lightHex: string,
  maxAnisotropy: number
): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#cccccc';
  bCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    const isPlankSeam = y % 8 === 0;
    for (let x = 0; x < size; x++) {
      const hash = ((x * 374761393) ^ (y * 668265263)) >>> 0;
      if (isPlankSeam || (x === (y / 8) * 11 && y % 8 !== 0)) {
        ctx.fillStyle = darkHex;
        ctx.fillRect(x, y, 1, 1);
        bCtx.fillStyle = '#444444';
        bCtx.fillRect(x, y, 1, 1);
      } else if (hash % 7 === 0) {
        ctx.fillStyle = lightHex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.magFilter = THREE.NearestFilter;
  colorMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.magFilter = THREE.NearestFilter;

  return { colorMap, bumpMap };
}

/**
 * Generates a pixel-art roof shingle / brick texture.
 */
export function createPixelShingleTexture(
  primaryHex: string,
  secondaryHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    const offset = (y / 4) % 2 === 0 ? 0 : 4;
    ctx.fillStyle = secondaryHex;
    ctx.fillRect(0, y, size, 1);
    for (let x = offset; x < size; x += 8) {
      ctx.fillRect(x, y, 1, 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.magFilter = THREE.NearestFilter;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates a soft radial contact shadow texture for grounding 3D models.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(20, 15, 10, 0.55)');
  grad.addColorStop(0.55, 'rgba(20, 15, 10, 0.25)');
  grad.addColorStop(1, 'rgba(20, 15, 10, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Renders the romantic pixel-art love letter parchment texture with live custom text ("Quer namorar comigo?").
 */
export function updateLoveLetterCanvas(
  canvas: HTMLCanvasElement,
  content: LetterContent
): void {
  const w = 512;
  const h = 384;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d')!;

  // Warm vintage pixel parchment background
  ctx.fillStyle = '#fff5e4';
  ctx.fillRect(0, 0, w, h);

  // Pixelated border frame
  ctx.fillStyle = '#d98a6c';
  ctx.fillRect(12, 12, w - 24, 6);
  ctx.fillRect(12, h - 18, w - 24, 6);
  ctx.fillRect(12, 12, 6, h - 24);
  ctx.fillRect(w - 18, 12, 6, h - 24);

  // Inner gold trim
  ctx.fillStyle = '#eab364';
  ctx.fillRect(22, 22, w - 44, 3);
  ctx.fillRect(22, h - 25, w - 44, 3);
  ctx.fillRect(22, 22, 3, h - 44);
  ctx.fillRect(w - 25, 22, 3, h - 44);

  // Draw pixel-art heart icon at top center
  const heartGrid = [
    '01100110',
    '11111111',
    '11111111',
    '11111111',
    '01111110',
    '00111100',
    '00011000',
  ];
  const pxSize = 5;
  const startX = w / 2 - (8 * pxSize) / 2;
  const startY = 40;
  ctx.fillStyle = '#e63956';
  heartGrid.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      if (row[rx] === '1') {
        ctx.fillRect(startX + rx * pxSize, startY + ry * pxSize, pxSize, pxSize);
      }
    }
  });

  // Recipient header
  ctx.fillStyle = '#6e473b';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Para: ${content.recipientName}`, w / 2, 110);

  // Main Proposal Headline ("Quer namorar comigo?")
  ctx.fillStyle = '#c92a42';
  ctx.font = '700 32px "Outfit", sans-serif';
  ctx.fillText(content.headline, w / 2, 162);

  // Wrapped body excerpt
  ctx.fillStyle = '#4a3228';
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  const words = content.bodyText.split(' ');
  let line = '';
  let y = 205;
  const maxWidth = w - 96;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), w / 2, y);
      line = words[i] + ' ';
      y += 24;
      if (y > 295) break;
    } else {
      line = testLine;
    }
  }
  if (line && y <= 295) {
    ctx.fillText(line.trim(), w / 2, y);
  }

  // Sender footer
  ctx.fillStyle = '#8c584c';
  ctx.font = '600 18px "Outfit", sans-serif';
  ctx.fillText(`♥ ${content.senderName} ♥`, w / 2, h - 42);
}
