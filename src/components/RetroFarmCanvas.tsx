import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  SceneId,
  TimeOfDayId,
  SCENE_PRESETS,
  TIME_OF_DAY_PRESETS,
  LetterContent,
  dampValue,
  computeHeartBounce,
  computeFlyingLetterPose,
  groundHeightAt,
  getResponsiveCameraPreset,
} from '../utils/sceneState';
import {
  createPixelMeadowTextures,
  createPixelWoodTextures,
  createPixelShingleTexture,
  createContactShadowTexture,
  updateLoveLetterCanvas,
} from '../three/proceduralTextures';
import {
  createPixelHeartGeometry,
  createPixelBarnGroup,
  createWindmillGroup,
  createCottageGroup,
  createBlossomTreeWithSwing,
  createTrampolineGroup,
  createFruitTreeGroup,
  createVoxelSheep,
  createWoodenBridge,
  createFlyingLoveLetter,
} from '../three/voxelModels';

interface RetroFarmCanvasProps {
  activeScene: SceneId;
  timeOfDay: TimeOfDayId;
  letterContent: LetterContent;
  proposalAccepted: boolean;
  onSelectScene: (scene: SceneId) => void;
  onOpenLetterModal: () => void;
}

// Pre-allocated module-scope math helpers (Zero GC in render loop)
const _dummy = new THREE.Object3D();
const _petalDummy = new THREE.Object3D();
const _heartDummy = new THREE.Object3D();
const _cloudDummy = new THREE.Object3D();
const _color = new THREE.Color();
const _skyTopColor = new THREE.Color();
const _skyHorizonColor = new THREE.Color();
const _fogColor = new THREE.Color();
const _keyColor = new THREE.Color();
const _hemiSkyColor = new THREE.Color();
const _hemiGroundColor = new THREE.Color();
const _pointerNdc = new THREE.Vector2();

interface HeartInstanceData {
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  speed: number;
  amplitude: number;
  scale: number;
  isForegroundRing: boolean;
  orbitAngle: number;
  orbitRadius: number;
}

interface FlowerInstanceData {
  x: number;
  y: number;
  z: number;
  phase: number;
  scale: number;
  rotY: number;
}

export const RetroFarmCanvas: React.FC<RetroFarmCanvasProps> = ({
  activeScene,
  timeOfDay,
  letterContent,
  proposalAccepted,
  onSelectScene,
  onOpenLetterModal,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Store latest React props & callbacks in refs so canvas never tears down
  const activeSceneRef = useRef<SceneId>(activeScene);
  const timeOfDayRef = useRef<TimeOfDayId>(timeOfDay);
  const proposalAcceptedRef = useRef<boolean>(proposalAccepted);
  const onSelectSceneRef = useRef(onSelectScene);
  const onOpenLetterModalRef = useRef(onOpenLetterModal);
  const cameraTransitionActiveRef = useRef<boolean>(true);

  const letterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const letterTextureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    activeSceneRef.current = activeScene;
    cameraTransitionActiveRef.current = true;
  }, [activeScene]);

  useEffect(() => {
    timeOfDayRef.current = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    proposalAcceptedRef.current = proposalAccepted;
  }, [proposalAccepted]);

  useEffect(() => {
    onSelectSceneRef.current = onSelectScene;
  }, [onSelectScene]);

  useEffect(() => {
    onOpenLetterModalRef.current = onOpenLetterModal;
  }, [onOpenLetterModal]);

  // Update 3D love letter parchment texture whenever letterContent changes
  useEffect(() => {
    if (letterCanvasRef.current && letterTextureRef.current) {
      updateLoveLetterCanvas(letterCanvasRef.current, letterContent);
      letterTextureRef.current.needsUpdate = true;
    }
  }, [letterContent]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 2. Scene, Studio Environment Map & Fog
    const scene = new THREE.Scene();
    const initialPreset = TIME_OF_DAY_PRESETS[timeOfDayRef.current];
    scene.background = new THREE.Color(initialPreset.skyHorizonHex);
    scene.fog = new THREE.FogExp2(initialPreset.fogHex, initialPreset.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera & Damped OrbitControls
    const initialCam = SCENE_PRESETS[activeSceneRef.current];
    const camera = new THREE.PerspectiveCamera(
      initialCam.fov,
      width / height,
      0.2,
      160
    );
    camera.position.set(
      initialCam.cameraPos.x,
      initialCam.cameraPos.y,
      initialCam.cameraPos.z
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(
      initialCam.cameraTarget.x,
      initialCam.cameraTarget.y,
      initialCam.cameraTarget.z
    );
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.8;
    controls.maxDistance = 48;
    controls.update();

    const onControlStart = () => {
      cameraTransitionActiveRef.current = false;
    };
    controls.addEventListener('start', onControlStart);

    // 4. Balanced 3-Point Studio Lighting Rig (1 Shadow Caster)
    const hemiLight = new THREE.HemisphereLight(
      initialPreset.hemiSkyHex,
      initialPreset.hemiGroundHex,
      initialPreset.hemiIntensity
    );
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      initialPreset.keyLightHex,
      initialPreset.keyLightIntensity
    );
    keyLight.position.set(
      initialPreset.keyLightPos.x,
      initialPreset.keyLightPos.y,
      initialPreset.keyLightPos.z
    );
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const shadowBound = 28;
    keyLight.shadow.camera.left = -shadowBound;
    keyLight.shadow.camera.right = shadowBound;
    keyLight.shadow.camera.top = shadowBound;
    keyLight.shadow.camera.bottom = -shadowBound;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 85;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      initialPreset.rimLightHex,
      initialPreset.rimLightIntensity
    );
    rimLight.position.set(-18, 14, -20);
    scene.add(rimLight);

    // Warm lantern point light near the flying letter
    const letterWarmLight = new THREE.PointLight(0xffb5c5, 1.8, 12, 1.6);
    letterWarmLight.position.set(0, 5, 2);
    scene.add(letterWarmLight);

    // 5. Procedural Textures & Shared PBR Materials
    const meadowTex = createPixelMeadowTextures(maxAnisotropy);
    const redWoodTex = createPixelWoodTextures('#b8332a', '#7d1d16', '#cf463c', maxAnisotropy);
    const oakWoodTex = createPixelWoodTextures('#9c6644', '#6b4226', '#b07d56', maxAnisotropy);
    const roofShingleTex = createPixelShingleTexture('#4a3531', '#2e201d', maxAnisotropy);
    const contactShadowTex = createContactShadowTexture();

    const letterCanvas = document.createElement('canvas');
    updateLoveLetterCanvas(letterCanvas, letterContent);
    const letterSheetTex = new THREE.CanvasTexture(letterCanvas);
    letterSheetTex.colorSpace = THREE.SRGBColorSpace;
    letterSheetTex.anisotropy = maxAnisotropy;
    letterCanvasRef.current = letterCanvas;
    letterTextureRef.current = letterSheetTex;

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: meadowTex.colorMap,
      bumpMap: meadowTex.bumpMap,
      bumpScale: 0.08,
      roughness: 0.88,
      metalness: 0.02,
    });

    const redWoodMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: redWoodTex.colorMap,
      bumpMap: redWoodTex.bumpMap,
      bumpScale: 0.05,
      roughness: 0.72,
      metalness: 0.05,
    });

    const oakWoodMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: oakWoodTex.colorMap,
      bumpMap: oakWoodTex.bumpMap,
      bumpScale: 0.05,
      roughness: 0.76,
      metalness: 0.06,
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.82,
      metalness: 0.05,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: roofShingleTex,
      roughness: 0.85,
      metalness: 0.08,
    });

    const whiteTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfff8eb,
      roughness: 0.52,
      metalness: 0.05,
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x8d949e,
      roughness: 0.92,
      metalness: 0.04,
    });

    const metalDomeMat = new THREE.MeshStandardMaterial({
      color: 0xd8e2ec,
      roughness: 0.25,
      metalness: 0.78,
    });

    const hayMat = new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      roughness: 0.9,
      metalness: 0.02,
    });

    const plasterMat = new THREE.MeshStandardMaterial({
      color: 0xfff1d6,
      roughness: 0.78,
      metalness: 0.02,
    });

    const windowGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffe699,
      emissive: 0xffb74d,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    const blossomPrimaryMat = new THREE.MeshStandardMaterial({
      color: 0xffa6c1,
      roughness: 0.65,
      metalness: 0.02,
    });

    const blossomSecondaryMat = new THREE.MeshStandardMaterial({
      color: 0xffcad4,
      roughness: 0.6,
      metalness: 0.02,
    });

    // 6. Sculpted Outdoor Rolling Terrain & Sparkling Stream
    const terrainGeo = new THREE.PlaneGeometry(110, 110, 72, 72);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      posAttr.setY(i, groundHeightAt(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Crystal Stream Plane (offset carefully to sit in the stream channel without Z-fighting)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x56cfe1,
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.86,
    });
    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 70, 1, 1), waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(2.5, -0.18, 0);
    scene.add(waterMesh);

    // Stepping Stones / Dirt Trail connecting Farm -> Bridge -> Flower Field
    const pathStoneGeo = new THREE.BoxGeometry(0.95, 0.12, 0.75);
    const pathCoords = [
      [-9.5, 4.5],
      [-8.0, 4.2],
      [-6.5, 3.8],
      [-4.8, 3.3],
      [-3.2, 2.8],
      [-1.5, 2.3],
      [6.2, 2.2],
      [7.8, 2.5],
      [9.4, 2.9],
    ];
    pathCoords.forEach(([px, pz], idx) => {
      const stone = new THREE.Mesh(pathStoneGeo, stoneMat);
      stone.position.set(px, groundHeightAt(px, pz) + 0.04, pz);
      stone.rotation.y = (idx * 0.4) % 1;
      stone.receiveShadow = true;
      scene.add(stone);
    });

    // 7. Assemble Composite 3D Landmarks & Interactables
    const interactables: THREE.Object3D[] = [];

    // Landmark A: Red Pixel-Art Barn & Silo (Farmstead Backdrop Ridge)
    const barnGroup = createPixelBarnGroup(
      redWoodMat,
      roofMat,
      whiteTrimMat,
      stoneMat,
      metalDomeMat,
      hayMat,
      contactShadowTex
    );
    const barnX = -15.5;
    const barnZ = -8.8;
    barnGroup.position.set(barnX, groundHeightAt(barnX, barnZ), barnZ);
    barnGroup.rotation.y = 0.35;
    barnGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(barnGroup);
    interactables.push(barnGroup);

    // Landmark B: Wooden Windmill with Rotating Sails
    const { group: windmillGroup, rotorGroup } = createWindmillGroup(
      oakWoodMat,
      darkWoodMat,
      whiteTrimMat,
      stoneMat,
      metalDomeMat,
      contactShadowTex
    );
    const millX = -18.8;
    const millZ = -1.5;
    windmillGroup.position.set(millX, groundHeightAt(millX, millZ), millZ);
    windmillGroup.rotation.y = 0.55;
    windmillGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(windmillGroup);
    interactables.push(windmillGroup);

    // Landmark C: Cozy Farmhouse Cottage with Covered Porch (Alpendre), Toys & Waterwheel
    const {
      group: cottageGroup,
      waterwheel,
      rockingHorsePivot,
    } = createCottageGroup(
      plasterMat,
      oakWoodMat,
      darkWoodMat,
      roofMat,
      stoneMat,
      windowGlowMat,
      whiteTrimMat,
      contactShadowTex
    );
    const cotX = -4.5;
    const cotZ = -2.6;
    cottageGroup.position.set(cotX, groundHeightAt(cotX, cotZ), cotZ);
    cottageGroup.rotation.y = 0.14;
    cottageGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(cottageGroup);
    interactables.push(cottageGroup);

    // Landmark C2: Backyard Trampoline (Pula-Pula no Quintal)
    const {
      group: trampolineGroup,
      jumperGroup: trampolineJumper,
      jumpMatMesh: trampolineMatMesh,
    } = createTrampolineGroup(metalDomeMat, contactShadowTex);
    const trampX = -8.6;
    const trampZ = 1.4;
    trampolineGroup.position.set(trampX, groundHeightAt(trampX, trampZ), trampZ);
    trampolineGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(trampolineGroup);
    interactables.push(trampolineGroup);

    // Landmark C3: Backyard Fruit Tree with Apples, Oranges & Fruit Basket (Árvore de Frutas no Quintal)
    const fruitTreeGroup = createFruitTreeGroup(
      darkWoodMat,
      oakWoodMat,
      contactShadowTex
    );
    const fruitTreeX = -9.2;
    const fruitTreeZ = -3.8;
    fruitTreeGroup.position.set(
      fruitTreeX,
      groundHeightAt(fruitTreeX, fruitTreeZ),
      fruitTreeZ
    );
    fruitTreeGroup.rotation.y = 0.45;
    fruitTreeGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(fruitTreeGroup);
    interactables.push(fruitTreeGroup);

    // Landmark C4: Backyard Tree with Wooden Swing (Árvore com Balanço no Quintal)
    const yardLeafMat1 = new THREE.MeshStandardMaterial({
      color: 0x4caf50,
      roughness: 0.72,
      metalness: 0.02,
    });
    const yardLeafMat2 = new THREE.MeshStandardMaterial({
      color: 0x66bb6a,
      roughness: 0.7,
      metalness: 0.02,
    });
    const { group: yardSwingTreeGroup, swingPivot: yardSwingPivot } =
      createBlossomTreeWithSwing(
        darkWoodMat,
        yardLeafMat1,
        yardLeafMat2,
        oakWoodMat,
        hayMat,
        contactShadowTex
      );
    const yardSwingX = -1.6;
    const yardSwingZ = -2.4;
    yardSwingTreeGroup.position.set(
      yardSwingX,
      groundHeightAt(yardSwingX, yardSwingZ),
      yardSwingZ
    );
    yardSwingTreeGroup.rotation.y = 0.25;
    yardSwingTreeGroup.userData = { targetScene: 'farm' as SceneId };
    scene.add(yardSwingTreeGroup);
    interactables.push(yardSwingTreeGroup);

    // Landmark D: Arched Wooden Bridge Crossing the Stream
    const bridgeGroup = createWoodenBridge(oakWoodMat, darkWoodMat);
    bridgeGroup.position.set(2.5, groundHeightAt(2.5, 3.2) + 0.15, 3.2);
    scene.add(bridgeGroup);

    // Landmark E: Blossoming Cherry Tree with Swaying Swing (Right Flower Field Zone)
    const { group: blossomTreeGroup, swingPivot } = createBlossomTreeWithSwing(
      darkWoodMat,
      blossomPrimaryMat,
      blossomSecondaryMat,
      oakWoodMat,
      hayMat,
      contactShadowTex
    );
    const treeX = 11.2;
    const treeZ = -3.5;
    blossomTreeGroup.position.set(treeX, groundHeightAt(treeX, treeZ), treeZ);
    blossomTreeGroup.rotation.y = -0.35;
    blossomTreeGroup.userData = { targetScene: 'flower_field' as SceneId };
    scene.add(blossomTreeGroup);
    interactables.push(blossomTreeGroup);

    // Cute Grazing Voxel Sheep in the Farm Pasture
    const sheepGroupList: { mesh: THREE.Group; baseX: number; baseZ: number; phase: number }[] = [];
    const sheepCoords = [
      [-8.2, 6.8, 0.8],
      [-10.8, 8.2, 1.9],
      [-6.4, 8.8, -0.5],
      [-12.5, 6.0, 1.2],
    ];
    sheepCoords.forEach(([sx, sz, srot], idx) => {
      const sheep = createVoxelSheep(whiteTrimMat, darkWoodMat, contactShadowTex);
      sheep.position.set(sx, groundHeightAt(sx, sz), sz);
      sheep.rotation.y = srot;
      scene.add(sheep);
      sheepGroupList.push({ mesh: sheep, baseX: sx, baseZ: sz, phase: idx * 1.7 });
    });

    // Wooden Pasture Fence Posts around the Farm
    const fencePostGeo = new THREE.BoxGeometry(0.22, 0.95, 0.22);
    const fenceCoords: [number, number][] = [];
    for (let fx = -15; fx <= -4; fx += 2.2) {
      fenceCoords.push([fx, 11.2]);
    }
    for (let fz = 4; fz <= 11.2; fz += 2.2) {
      fenceCoords.push([-4, fz]);
    }
    const fenceInstanced = new THREE.InstancedMesh(
      fencePostGeo,
      oakWoodMat,
      fenceCoords.length
    );
    fenceInstanced.castShadow = true;
    fenceCoords.forEach(([fx, fz], i) => {
      _dummy.position.set(fx, groundHeightAt(fx, fz) + 0.45, fz);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      fenceInstanced.setMatrixAt(i, _dummy.matrix);
    });
    fenceInstanced.instanceMatrix.needsUpdate = true;
    fenceInstanced.computeBoundingSphere();
    scene.add(fenceInstanced);

    // Perimeter Voxel Pine/Oak Trees framing the horizon
    const pineTrunkGeo = new THREE.CylinderGeometry(0.32, 0.48, 1.8, 6);
    const pineCrownGeo = new THREE.BoxGeometry(2.1, 2.4, 2.1);
    const pineMat = new THREE.MeshStandardMaterial({
      color: 0x3b7a47,
      roughness: 0.8,
      metalness: 0.02,
    });
    const perimeterTreeCoords: [number, number, number][] = [
      [-24, -14, 1.15],
      [-19, -18, 0.95],
      [-11, -20, 1.25],
      [-3, -22, 1.0],
      [7, -21, 1.1],
      [16, -18, 1.2],
      [23, -12, 0.9],
      [25, -3, 1.15],
      [24, 8, 1.05],
      [-25, 10, 1.1],
      [-22, 17, 0.95],
      [18, 16, 1.0],
    ];
    perimeterTreeCoords.forEach(([tx, tz, tscale], idx) => {
      const tGroup = new THREE.Group();
      const gy = groundHeightAt(tx, tz);
      tGroup.position.set(tx, gy, tz);
      tGroup.scale.setScalar(tscale);

      const trunk = new THREE.Mesh(pineTrunkGeo, darkWoodMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tGroup.add(trunk);

      const c1 = new THREE.Mesh(pineCrownGeo, idx % 2 === 0 ? pineMat : blossomSecondaryMat);
      c1.position.y = 2.4;
      c1.castShadow = true;
      tGroup.add(c1);

      const c2 = new THREE.Mesh(
        pineCrownGeo,
        idx % 2 === 0 ? pineMat : blossomPrimaryMat
      );
      c2.scale.setScalar(0.72);
      c2.position.y = 3.9;
      c2.castShadow = true;
      tGroup.add(c2);

      scene.add(tGroup);
    });

    // 8. InstancedMesh: 680 Swaying 3D Pixel-Art Flowers Across the Meadow
    const flowerCount = 680;
    const stemGeo = new THREE.BoxGeometry(0.08, 0.48, 0.08);
    stemGeo.translate(0, 0.24, 0);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x3d8c40,
      roughness: 0.75,
    });

    // Voxel Cross Blossom Geometry
    const blossomGeo = new THREE.BoxGeometry(0.34, 0.16, 0.34);
    blossomGeo.translate(0, 0.52, 0);
    const blossomMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.05,
    });

    const stemInstanced = new THREE.InstancedMesh(stemGeo, stemMat, flowerCount);
    const blossomInstanced = new THREE.InstancedMesh(blossomGeo, blossomMat, flowerCount);
    blossomInstanced.castShadow = !isSoftwareGl;
    stemInstanced.frustumCulled = false;
    blossomInstanced.frustumCulled = false;

    const flowerPalette = [
      0xff4d6d, // Romantic Rose
      0xffb703, // Sunflower Gold
      0xff85a1, // Sakura Pink
      0xc77dff, // Lavender Violet
      0x4cc9f0, // Forget-me-not Blue
      0xfff0f3, // Daisy Cream
      0xf72585, // Vibrant Magenta
    ];

    const flowersData: FlowerInstanceData[] = [];
    for (let i = 0; i < flowerCount; i++) {
      // Concentrate rich flower carpets on the right meadow (x > 4) and around the valley
      const h1 = ((i * 2654435761) >>> 0) / 4294967296;
      const h2 = (((i + 77) * 1597334677) >>> 0) / 4294967296;
      const h3 = (((i + 233) * 3266489917) >>> 0) / 4294967296;

      let fx: number;
      let fz: number;
      if (i < 480) {
        // Dense flower field zone (Scene 2 focus)
        fx = 4.2 + h1 * 17.5;
        fz = -11.0 + h2 * 23.5;
      } else {
        // Scattered wildflowers across the farm & stream banks
        fx = -19.0 + h1 * 21.0;
        fz = -12.0 + h2 * 24.0;
        // Avoid placing inside barn footprint
        if (fx > -15 && fx < -7 && fz > -7 && fz < 0) {
          fx += 9.5;
        }
        // Avoid placing inside cottage body, porch deck, steps, and front walk
        if (fx > -5.8 && fx < -1.8 && fz > -4.8 && fz < 1.6) {
          fx += 5.2;
        }
        // Avoid placing inside trampoline mat & safety perimeter
        if (Math.hypot(fx - trampX, fz - trampZ) < 2.5) {
          fz += 3.2;
        }
        // Avoid placing under fruit tree trunk & fruit harvest crate
        if (Math.hypot(fx - fruitTreeX, fz - fruitTreeZ) < 2.2) {
          fx -= 2.6;
        }
        // Avoid placing under yard swing tree base
        if (Math.hypot(fx - yardSwingX, fz - yardSwingZ) < 2.0) {
          fx += 2.4;
        }
      }

      const fy = groundHeightAt(fx, fz);
      const scale = 0.8 + h3 * 0.55;
      const rotY = h1 * Math.PI * 2;
      const phase = h2 * Math.PI * 2;

      flowersData.push({ x: fx, y: fy, z: fz, phase, scale, rotY });

      _dummy.position.set(fx, fy, fz);
      _dummy.rotation.set(0, rotY, 0);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      stemInstanced.setMatrixAt(i, _dummy.matrix);
      blossomInstanced.setMatrixAt(i, _dummy.matrix);

      _color.setHex(flowerPalette[i % flowerPalette.length]);
      blossomInstanced.setColorAt(i, _color);
    }
    stemInstanced.instanceMatrix.needsUpdate = true;
    blossomInstanced.instanceMatrix.needsUpdate = true;
    if (blossomInstanced.instanceColor) blossomInstanced.instanceColor.needsUpdate = true;

    scene.add(stemInstanced);
    scene.add(blossomInstanced);

    // 9. InstancedMesh: 72 Bouncing 3D Pixel Hearts (Background Horizon + Valley + Proposal Ring)
    const heartCount = 72;
    const heartGeo = createPixelHeartGeometry(1.15);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.15,
      emissive: 0xff2a55,
      emissiveIntensity: 0.24,
    });

    const heartsInstanced = new THREE.InstancedMesh(heartGeo, heartMat, heartCount);
    heartsInstanced.castShadow = !isSoftwareGl;
    heartsInstanced.frustumCulled = false;

    const heartPalette = [
      0xff2a55, // Classic Pixel Ruby Heart
      0xff5c8a, // Bubblegum Rose
      0xff85a1, // Soft Pastel Pink
      0xe63946, // Crimson
      0xffacc5, // Blush
      0xffbe0b, // Golden Sparkle Heart
    ];

    const heartsData: HeartInstanceData[] = [];
    for (let i = 0; i < heartCount; i++) {
      const isForegroundRing = i < 18;
      let baseX = 0;
      let baseY = 2;
      let baseZ = 0;
      let scale = 1;
      let amplitude = 1.4;
      let speed = 2.6;
      const phase = (i * 0.73) % (Math.PI * 2);
      const orbitAngle = (i / 18) * Math.PI * 2;
      const orbitRadius = 2.6 + (i % 3) * 0.8;

      if (isForegroundRing) {
        // Foreground celebration hearts placed over the stream valley and around letter,
        // offset towards x > 1.2 so they never block the cottage porch, toys, or yard props
        baseX = 1.4 + Math.cos(orbitAngle) * orbitRadius;
        baseZ = 1.8 + Math.sin(orbitAngle) * (orbitRadius * 0.85);
        baseY = Math.max(1.3, groundHeightAt(baseX, baseZ) + 1.25 + (i % 4) * 0.45);
        scale = 0.65 + (i % 3) * 0.18;
        amplitude = 1.1 + (i % 3) * 0.3;
        speed = 2.6 + (i % 4) * 0.35;
      } else {
        // Bouncing 3D Pixel Hearts across the scenic background & meadow horizon!
        const idx = i - 18;
        const totalBg = heartCount - 18;
        const arcAngle = -Math.PI * 0.88 + (idx / totalBg) * Math.PI * 1.76;
        const dist = 14 + (idx % 5) * 4.2;
        baseX = Math.sin(arcAngle) * dist;
        baseZ = -Math.cos(arcAngle) * dist * 0.85 - 2;
        baseY = Math.max(1.4, groundHeightAt(baseX, baseZ) + 1.4 + (idx % 4) * 0.9);
        scale = 0.95 + (idx % 4) * 0.32;
        amplitude = 1.65 + (idx % 3) * 0.55;
        speed = 2.3 + (idx % 5) * 0.3;
      }

      heartsData.push({
        baseX,
        baseY,
        baseZ,
        phase,
        speed,
        amplitude,
        scale,
        isForegroundRing,
        orbitAngle,
        orbitRadius,
      });

      _color.setHex(heartPalette[i % heartPalette.length]);
      heartsInstanced.setColorAt(i, _color);
    }
    if (heartsInstanced.instanceColor) heartsInstanced.instanceColor.needsUpdate = true;
    scene.add(heartsInstanced);

    // 10. Fluffy Voxel Clouds Drifting Across the Sky
    const cloudCount = 26;
    const cloudGeo = new THREE.BoxGeometry(3.4, 1.1, 2.2);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfff8f6,
      roughness: 0.9,
      metalness: 0.0,
    });
    const cloudsInstanced = new THREE.InstancedMesh(cloudGeo, cloudMat, cloudCount);
    cloudsInstanced.frustumCulled = false;
    const cloudsData = Array.from({ length: cloudCount }, (_, i) => ({
      x: -45 + ((i * 17.3) % 90),
      y: 15.5 + (i % 4) * 2.4,
      z: -32 + ((i * 11.7) % 45),
      scaleX: 0.8 + (i % 3) * 0.55,
      scaleY: 0.75 + (i % 2) * 0.35,
      speed: 0.45 + (i % 4) * 0.18,
    }));
    scene.add(cloudsInstanced);

    // 11. Hero 3D Flying Love Letter
    const {
      group: flyingLetterGroup,
      flapPivot,
      sheetMesh,
      leftWingPivot,
      rightWingPivot,
      sealMesh,
    } = createFlyingLoveLetter(letterSheetTex);
    flyingLetterGroup.position.set(0, 4.8, 1.5);
    flyingLetterGroup.userData = { isFlyingLetter: true };
    scene.add(flyingLetterGroup);
    interactables.push(flyingLetterGroup);

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 12. Pointer Raycasting for Clicking the 3D Flying Letter or Farm Landmarks
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (moveDist > 6) return; // Ignore drag-orbit gestures

      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          if (obj.userData?.isFlyingLetter) {
            if (activeSceneRef.current !== 'proposal') {
              onSelectSceneRef.current('proposal');
            } else {
              onOpenLetterModalRef.current();
            }
            return;
          }
          if (obj.userData?.targetScene) {
            onSelectSceneRef.current(obj.userData.targetScene);
            return;
          }
          obj = obj.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 13. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      cameraTransitionActiveRef.current = true;
    };
    window.addEventListener('resize', handleResize);

    // 14. Lossless Animation Loop with Software-WebGL `afterDraw` Pacing
    let lastTimeMs = performance.now();
    let elapsed = 0;
    let frameId = 0;
    let currentFlapRatio = 0;
    let currentSheetRatio = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      elapsed += dt;
      const currentScene = activeSceneRef.current;
      const targetPreset = getResponsiveCameraPreset(
        SCENE_PRESETS[currentScene],
        camera.aspect
      );
      const lightPreset = TIME_OF_DAY_PRESETS[timeOfDayRef.current];
      const isCelebration = proposalAcceptedRef.current;

      // A. Smooth Exponential Damping for Scene Camera Transitions
      if (cameraTransitionActiveRef.current) {
        const camLambda = 6.0;
        camera.position.x = dampValue(
          camera.position.x,
          targetPreset.cameraPos.x,
          camLambda,
          dt
        );
        camera.position.y = dampValue(
          camera.position.y,
          targetPreset.cameraPos.y,
          camLambda,
          dt
        );
        camera.position.z = dampValue(
          camera.position.z,
          targetPreset.cameraPos.z,
          camLambda,
          dt
        );

        controls.target.x = dampValue(
          controls.target.x,
          targetPreset.cameraTarget.x,
          camLambda,
          dt
        );
        controls.target.y = dampValue(
          controls.target.y,
          targetPreset.cameraTarget.y,
          camLambda,
          dt
        );
        controls.target.z = dampValue(
          controls.target.z,
          targetPreset.cameraTarget.z,
          camLambda,
          dt
        );

        const fovDiff = Math.abs(camera.fov - targetPreset.fov);
        if (fovDiff > 0.05) {
          camera.fov = dampValue(camera.fov, targetPreset.fov, camLambda, dt);
          camera.updateProjectionMatrix();
        }

        const distRemaining =
          Math.hypot(
            camera.position.x - targetPreset.cameraPos.x,
            camera.position.y - targetPreset.cameraPos.y,
            camera.position.z - targetPreset.cameraPos.z
          ) +
          Math.hypot(
            controls.target.x - targetPreset.cameraTarget.x,
            controls.target.y - targetPreset.cameraTarget.y,
            controls.target.z - targetPreset.cameraTarget.z
          );
        if (distRemaining < 0.03) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();

      // B. Smooth Time-of-Day Atmosphere & Lighting Damping
      _skyHorizonColor.setHex(lightPreset.skyHorizonHex);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(_skyHorizonColor, 1 - Math.exp(-3 * dt));
      }
      if (scene.fog instanceof THREE.FogExp2) {
        _fogColor.setHex(lightPreset.fogHex);
        scene.fog.color.lerp(_fogColor, 1 - Math.exp(-3 * dt));
        scene.fog.density = dampValue(
          scene.fog.density,
          lightPreset.fogDensity,
          3,
          dt
        );
      }

      _keyColor.setHex(lightPreset.keyLightHex);
      keyLight.color.lerp(_keyColor, 1 - Math.exp(-3 * dt));
      keyLight.intensity = dampValue(
        keyLight.intensity,
        lightPreset.keyLightIntensity,
        3,
        dt
      );

      _hemiSkyColor.setHex(lightPreset.hemiSkyHex);
      _hemiGroundColor.setHex(lightPreset.hemiGroundHex);
      hemiLight.color.lerp(_hemiSkyColor, 1 - Math.exp(-3 * dt));
      hemiLight.groundColor.lerp(_hemiGroundColor, 1 - Math.exp(-3 * dt));
      hemiLight.intensity = dampValue(
        hemiLight.intensity,
        lightPreset.hemiIntensity,
        3,
        dt
      );

      // C. Animate Farm Windmill, Waterwheel, Tree Swings, Porch Rocking Horse, Trampoline & Sheep
      rotorGroup.rotation.z = -elapsed * 0.85;
      waterwheel.rotation.x = elapsed * 1.1;
      swingPivot.rotation.x = Math.sin(elapsed * 1.6) * 0.22;
      yardSwingPivot.rotation.x = Math.sin(elapsed * 1.85 + 0.5) * 0.26;
      rockingHorsePivot.rotation.x = Math.sin(elapsed * 3.1) * 0.18;

      // Bouncing plush bear on the backyard trampoline + elastic mat flex
      const trampSin = Math.abs(Math.sin(elapsed * 3.6));
      trampolineJumper.position.y = 0.82 + Math.pow(trampSin, 0.75) * 1.05;
      trampolineJumper.rotation.y = elapsed * 0.9;
      trampolineMatMesh.position.y = 0.76 - (1 - trampSin) * 0.08;

      sheepGroupList.forEach((s) => {
        const hop = Math.max(0, Math.sin(elapsed * 2.4 + s.phase)) * 0.14;
        s.mesh.position.y = groundHeightAt(s.baseX, s.baseZ) + hop;
        s.mesh.rotation.z = Math.sin(elapsed * 1.8 + s.phase) * 0.04;
      });

      // D. Animate Swaying Pixel-Art Flower Field
      for (let i = 0; i < flowerCount; i++) {
        const f = flowersData[i];
        const windSwayZ = Math.sin(elapsed * 2.1 + f.x * 0.35 + f.phase) * 0.12;
        const windSwayX = Math.cos(elapsed * 1.7 + f.z * 0.35 + f.phase) * 0.08;

        _petalDummy.position.set(f.x, f.y, f.z);
        _petalDummy.rotation.set(windSwayX, f.rotY, windSwayZ);
        _petalDummy.scale.setScalar(f.scale);
        _petalDummy.updateMatrix();
        stemInstanced.setMatrixAt(i, _petalDummy.matrix);
        blossomInstanced.setMatrixAt(i, _petalDummy.matrix);
      }
      stemInstanced.instanceMatrix.needsUpdate = true;
      blossomInstanced.instanceMatrix.needsUpdate = true;

      // E. Animate Hero 3D Flying Love Letter
      const letterPose = computeFlyingLetterPose(currentScene, elapsed);
      flyingLetterGroup.position.x = dampValue(
        flyingLetterGroup.position.x,
        letterPose.pos.x,
        5.5,
        dt
      );
      flyingLetterGroup.position.y = dampValue(
        flyingLetterGroup.position.y,
        letterPose.pos.y,
        5.5,
        dt
      );
      flyingLetterGroup.position.z = dampValue(
        flyingLetterGroup.position.z,
        letterPose.pos.z,
        5.5,
        dt
      );

      flyingLetterGroup.rotation.x = dampValue(
        flyingLetterGroup.rotation.x,
        letterPose.rot.x,
        5.5,
        dt
      );
      flyingLetterGroup.rotation.y = dampValue(
        flyingLetterGroup.rotation.y,
        letterPose.rot.y,
        5.5,
        dt
      );
      flyingLetterGroup.rotation.z = dampValue(
        flyingLetterGroup.rotation.z,
        letterPose.rot.z,
        5.5,
        dt
      );

      currentFlapRatio = dampValue(
        currentFlapRatio,
        letterPose.flapOpenRatio,
        5.0,
        dt
      );
      currentSheetRatio = dampValue(
        currentSheetRatio,
        letterPose.sheetRiseRatio,
        4.5,
        dt
      );

      // Rotate top envelope flap open behind the rising sheet
      flapPivot.rotation.x = -currentFlapRatio * 3.05;
      // Slide love letter parchment sheet upward and clearly in front of the flap
      sheetMesh.position.y = 0.04 + currentSheetRatio * 0.82;
      sheetMesh.position.z = 0.05 + currentSheetRatio * 0.08;
      sealMesh.scale.setScalar(1 + Math.sin(elapsed * 4.5) * 0.08);

      // Flap pixel angel wings
      const wingFlap = Math.sin(elapsed * 7.5) * 0.38;
      leftWingPivot.rotation.y = wingFlap;
      rightWingPivot.rotation.y = -wingFlap;

      letterWarmLight.position.copy(flyingLetterGroup.position);
      letterWarmLight.position.z += 0.8;

      // F. Animate 72 Bouncing 3D Pixel Hearts in Background & Foreground
      const boost = isCelebration ? 1.55 : 1.0;
      for (let i = 0; i < heartCount; i++) {
        const h = heartsData[i];
        const bounce = computeHeartBounce(
          h.baseY,
          elapsed,
          h.phase,
          h.speed,
          h.amplitude,
          boost
        );

        let hx = h.baseX;
        let hz = h.baseZ;
        if (h.isForegroundRing) {
          const curAngle = h.orbitAngle + elapsed * 0.35 * boost;
          const radius = currentScene === 'proposal' ? h.orbitRadius * 0.85 : h.orbitRadius;
          hx = flyingLetterGroup.position.x + Math.cos(curAngle) * radius;
          hz = flyingLetterGroup.position.z + Math.sin(curAngle) * radius;
        }

        _heartDummy.position.set(hx, bounce.y, hz);
        _heartDummy.rotation.set(0, bounce.rotY, Math.sin(elapsed * 2 + h.phase) * 0.12);
        _heartDummy.scale.set(
          h.scale * bounce.scaleXZ,
          h.scale * bounce.scaleY,
          h.scale * bounce.scaleXZ
        );
        _heartDummy.updateMatrix();
        heartsInstanced.setMatrixAt(i, _heartDummy.matrix);
      }
      heartsInstanced.instanceMatrix.needsUpdate = true;

      // G. Drift Voxel Clouds
      for (let i = 0; i < cloudCount; i++) {
        const c = cloudsData[i];
        const cx = ((c.x + elapsed * c.speed + 45) % 90) - 45;
        _cloudDummy.position.set(cx, c.y, c.z);
        _cloudDummy.rotation.set(0, 0, 0);
        _cloudDummy.scale.set(c.scaleX, c.scaleY, c.scaleX);
        _cloudDummy.updateMatrix();
        cloudsInstanced.setMatrixAt(i, _cloudDummy.matrix);
      }
      cloudsInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={canvasMountRef}
      data-testid="retro-farm-canvas"
      className="fixed inset-0 w-screen h-screen overflow-hidden z-0 cursor-grab active:cursor-grabbing"
      aria-label="Cenário 3D interativo da Fazenda Pixel Art, Campo de Flores e Carta de Pedido de Namoro"
    />
  );
};
