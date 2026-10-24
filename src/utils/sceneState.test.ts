import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCENE_ORDER,
  SCENE_PRESETS,
  getNextSceneId,
  getPrevSceneId,
  dampValue,
  computeHeartBounce,
  computeFlyingLetterPose,
  validateLetterContent,
  DEFAULT_LETTER_CONTENT,
  groundHeightAt,
  getResponsiveCameraPreset,
  encodeLetterToQueryParams,
  parseLetterFromQueryParams,
} from './sceneState';

test('scene navigation cycles forward and backward smoothly across all 4 scenes', () => {
  assert.equal(SCENE_ORDER.length, 4);
  assert.equal(getNextSceneId('farm'), 'flower_field');
  assert.equal(getNextSceneId('flower_field'), 'flying_letter');
  assert.equal(getNextSceneId('flying_letter'), 'proposal');
  assert.equal(getNextSceneId('proposal'), 'farm');

  assert.equal(getPrevSceneId('farm'), 'proposal');
  assert.equal(getPrevSceneId('proposal'), 'flying_letter');
});

test('dampValue approaches target monotonically without overshooting', () => {
  const start = 0;
  const target = 10;
  const step1 = dampValue(start, target, 4, 0.016);
  const step2 = dampValue(step1, target, 4, 0.016);
  assert.ok(step1 > start && step1 < target);
  assert.ok(step2 > step1 && step2 < target);
  assert.equal(dampValue(5, 10, 4, 0), 5);
});

test('computeHeartBounce produces positive hop elevation above baseY', () => {
  const base = 3.0;
  const bouncePeak = computeHeartBounce(base, Math.PI / 2, 0, 1, 1.5, 1);
  assert.ok(bouncePeak.y > base + 1.0);
  assert.ok(bouncePeak.scaleY > 1.0);

  const bounceRest = computeHeartBounce(base, 0, 0, 1, 1.5, 1);
  assert.ok(Math.abs(bounceRest.y - base) < 0.001);
});

test('computeFlyingLetterPose opens envelope fully in proposal scene', () => {
  const farmPose = computeFlyingLetterPose('farm', 1.2);
  const flyingPose = computeFlyingLetterPose('flying_letter', 1.2);
  const proposalPose = computeFlyingLetterPose('proposal', 1.2);

  assert.equal(farmPose.flapOpenRatio, 0);
  assert.ok(flyingPose.flapOpenRatio > 0 && flyingPose.flapOpenRatio < 1);
  assert.equal(proposalPose.flapOpenRatio, 1);
  assert.equal(proposalPose.sheetRiseRatio, 1);
});

test('validateLetterContent enforces required fields and rejects empty strings', () => {
  const validCheck = validateLetterContent(DEFAULT_LETTER_CONTENT);
  assert.equal(validCheck.valid, true);

  const invalidCheck = validateLetterContent({
    recipientName: '',
    senderName: 'A',
    headline: 'Oi',
    bodyText: 'Curto',
    postscript: '',
  });
  assert.equal(invalidCheck.valid, false);
  assert.ok(invalidCheck.errors.recipientName);
  assert.ok(invalidCheck.errors.senderName);
  assert.ok(invalidCheck.errors.headline);
  assert.ok(invalidCheck.errors.bodyText);
});

test('groundHeightAt returns finite height across farm and stream coordinates', () => {
  const farmH = groundHeightAt(-10, -5);
  const streamH = groundHeightAt(2.5, 0);
  assert.ok(Number.isFinite(farmH));
  assert.ok(Number.isFinite(streamH));
  assert.ok(streamH < farmH);
});

test('getResponsiveCameraPreset pulls camera back on portrait mobile aspect ratios', () => {
  const desktopCam = getResponsiveCameraPreset(SCENE_PRESETS.proposal, 1440 / 900);
  const mobileCam = getResponsiveCameraPreset(SCENE_PRESETS.proposal, 390 / 844);

  assert.equal(desktopCam.cameraPos.z, SCENE_PRESETS.proposal.cameraPos.z);
  assert.ok(mobileCam.cameraPos.z > desktopCam.cameraPos.z);
  assert.ok(mobileCam.fov > desktopCam.fov);
});

test('encodeLetterToQueryParams and parseLetterFromQueryParams round-trip custom letter', () => {
  const custom = {
    recipientName: 'Mariana',
    senderName: 'Diego',
    headline: 'Quer namorar comigo, Mari?',
    bodyText: 'Cada momento ao seu lado é mágico como este campo de flores.',
    postscript: 'Para sempre nós dois.',
  };
  const query = encodeLetterToQueryParams(custom);
  const parsed = parseLetterFromQueryParams(`?${query}`);
  assert.deepEqual(parsed, custom);
});

