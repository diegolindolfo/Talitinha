import * as THREE from 'three';

/**
 * Creates a bevelled 3D pixel-art heart ExtrudeGeometry.
 */
export function createPixelHeartGeometry(scale = 1): THREE.ExtrudeGeometry {
  const s = 0.12 * scale;
  const shape = new THREE.Shape();
  // Stepped pixel-heart outline centered at (0, 0)
  shape.moveTo(0, -3 * s);
  shape.lineTo(1 * s, -3 * s);
  shape.lineTo(1 * s, -2 * s);
  shape.lineTo(2 * s, -2 * s);
  shape.lineTo(2 * s, -1 * s);
  shape.lineTo(3 * s, -1 * s);
  shape.lineTo(3 * s, 0);
  shape.lineTo(4 * s, 0);
  shape.lineTo(4 * s, 2 * s);
  shape.lineTo(3 * s, 2 * s);
  shape.lineTo(3 * s, 3 * s);
  shape.lineTo(1 * s, 3 * s);
  shape.lineTo(1 * s, 2 * s);
  shape.lineTo(0, 2 * s);
  shape.lineTo(-1 * s, 2 * s);
  shape.lineTo(-1 * s, 3 * s);
  shape.lineTo(-3 * s, 3 * s);
  shape.lineTo(-3 * s, 2 * s);
  shape.lineTo(-4 * s, 2 * s);
  shape.lineTo(-4 * s, 0);
  shape.lineTo(-3 * s, 0);
  shape.lineTo(-3 * s, -1 * s);
  shape.lineTo(-2 * s, -1 * s);
  shape.lineTo(-2 * s, -2 * s);
  shape.lineTo(-1 * s, -2 * s);
  shape.lineTo(-1 * s, -3 * s);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22 * scale,
    bevelEnabled: true,
    bevelThickness: 0.04 * scale,
    bevelSize: 0.03 * scale,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

/**
 * 1. Composite 11-Part Red Pixel-Art Barn & Silo Group (pivoted at bottom-center y=0)
 */
export function createPixelBarnGroup(
  redWoodMat: THREE.Material,
  roofMat: THREE.Material,
  whiteTrimMat: THREE.Material,
  stoneMat: THREE.Material,
  metalDomeMat: THREE.Material,
  hayMat: THREE.Material,
  contactShadowTex: THREE.Texture
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BarnAndSilo';

  // Soft contact shadow disc
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(6.8, 24),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  // Part 1: Stone Foundation Plinth (roughness 0.9)
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 5.2), stoneMat);
  foundation.position.y = 0.25;
  foundation.castShadow = true;
  foundation.receiveShadow = true;
  group.add(foundation);

  // Part 2: Primary Timber Barn Hull (roughness 0.72)
  const hull = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.6, 4.6), redWoodMat);
  hull.position.y = 2.3;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // Part 3: Upper Gambrel Loft Block
  const loft = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.6, 4.5), redWoodMat);
  loft.position.y = 4.6;
  loft.castShadow = true;
  group.add(loft);

  // Part 4 & 5: Gambrel Sloped Roof Planes
  const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 5.2), roofMat);
  roofLeft.position.set(-1.55, 4.85, 0);
  roofLeft.rotation.z = Math.PI / 5.2;
  roofLeft.castShadow = true;
  group.add(roofLeft);

  const roofRight = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 5.2), roofMat);
  roofRight.position.set(1.55, 4.85, 0);
  roofRight.rotation.z = -Math.PI / 5.2;
  roofRight.castShadow = true;
  group.add(roofRight);

  // Part 6: Roof Cupola Voxel Lantern
  const cupola = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.2), whiteTrimMat);
  cupola.position.set(0, 5.9, 0);
  cupola.castShadow = true;
  group.add(cupola);

  const cupolaRoof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.8, 4), roofMat);
  cupolaRoof.position.set(0, 6.8, 0);
  cupolaRoof.rotation.y = Math.PI / 4;
  group.add(cupolaRoof);

  // Part 7: Double Barn Doors with White X-Bracing
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.3, 0.22), whiteTrimMat);
  doorFrame.position.set(0, 1.65, 2.32);
  group.add(doorFrame);

  const doorInner = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.26), redWoodMat);
  doorInner.position.set(0, 1.65, 2.32);
  group.add(doorInner);

  const brace1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.3), whiteTrimMat);
  brace1.position.set(0, 1.65, 2.34);
  brace1.rotation.z = 0.72;
  group.add(brace1);

  const brace2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.3), whiteTrimMat);
  brace2.position.set(0, 1.65, 2.34);
  brace2.rotation.z = -0.72;
  group.add(brace2);

  // Part 8: Hayloft Window Frame
  const loftWindow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.25), whiteTrimMat);
  loftWindow.position.set(0, 4.4, 2.28);
  group.add(loftWindow);

  // Part 9: Cylindrical Grain Silo (adjacent right)
  const siloTower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 6.2, 12),
    whiteTrimMat
  );
  siloTower.position.set(4.1, 3.1, -0.6);
  siloTower.castShadow = true;
  siloTower.receiveShadow = true;
  group.add(siloTower);

  // Part 10: Metallic Silo Dome Cap (high metalness 0.75, low roughness 0.25)
  const siloDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.38, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    metalDomeMat
  );
  siloDome.position.set(4.1, 6.2, -0.6);
  siloDome.castShadow = true;
  group.add(siloDome);

  // Part 11: Stacked Golden Hay Bales by the Barn
  const bale1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.8), hayMat);
  bale1.position.set(-3.5, 0.35, 1.8);
  bale1.rotation.y = 0.2;
  bale1.castShadow = true;
  group.add(bale1);

  const bale2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.8), hayMat);
  bale2.position.set(-3.4, 1.05, 1.7);
  bale2.rotation.y = -0.15;
  bale2.castShadow = true;
  group.add(bale2);

  return group;
}

/**
 * 2. Composite 9-Part Wooden Windmill with Rotating Sails
 */
export function createWindmillGroup(
  woodMat: THREE.Material,
  darkWoodMat: THREE.Material,
  sailClothMat: THREE.Material,
  stoneMat: THREE.Material,
  metalMat: THREE.Material,
  contactShadowTex: THREE.Texture
): { group: THREE.Group; rotorGroup: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'Windmill';

  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 20),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  // Part 1: Octagonal Stone Plinth
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 1.2, 8), stoneMat);
  plinth.position.y = 0.6;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Part 2: Tapered Octagonal Wooden Tower
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.95, 5.4, 8), woodMat);
  tower.position.y = 3.9;
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);

  // Part 3: Wooden Observation Deck Ring
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.22, 8), darkWoodMat);
  deck.position.y = 2.8;
  deck.castShadow = true;
  group.add(deck);

  // Part 4: Conical Shingled Cap
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.55, 1.5, 8), darkWoodMat);
  cap.position.y = 7.3;
  cap.castShadow = true;
  group.add(cap);

  // Part 5: Rotor Axle & Hub
  const rotorGroup = new THREE.Group();
  rotorGroup.position.set(0, 5.8, 1.45);
  group.add(rotorGroup);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.6, 8), metalMat);
  hub.rotation.x = Math.PI / 2;
  rotorGroup.add(hub);

  // Parts 6-9: Four Pixel-Art Latticed Sails
  for (let i = 0; i < 4; i++) {
    const bladePivot = new THREE.Group();
    bladePivot.rotation.z = (i * Math.PI) / 2;

    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 0.14), darkWoodMat);
    spar.position.y = 2.0;
    spar.castShadow = true;
    bladePivot.add(spar);

    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.0, 0.06), sailClothMat);
    sail.position.set(0.42, 2.2, 0.04);
    sail.castShadow = true;
    bladePivot.add(sail);

    rotorGroup.add(bladePivot);
  }

  return { group, rotorGroup };
}

/**
 * 3. Composite 9-Part Cozy Farmhouse Cottage & Waterwheel
 */
export function createCottageGroup(
  plasterMat: THREE.Material,
  woodMat: THREE.Material,
  roofMat: THREE.Material,
  stoneMat: THREE.Material,
  windowGlowMat: THREE.Material,
  contactShadowTex: THREE.Texture
): { group: THREE.Group; waterwheel: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'CozyCottage';

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(5.2, 20),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  // Part 1: Stone Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 3.8), stoneMat);
  base.position.y = 0.225;
  base.receiveShadow = true;
  group.add(base);

  // Part 2: Main Cream Plaster Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.4), plasterMat);
  walls.position.y = 1.75;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Part 3 & 4: Pitched Shingled Roof
  const roof1 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.26, 4.0), roofMat);
  roof1.position.set(-1.1, 3.6, 0);
  roof1.rotation.z = Math.PI / 4.5;
  roof1.castShadow = true;
  group.add(roof1);

  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.26, 4.0), roofMat);
  roof2.position.set(1.1, 3.6, 0);
  roof2.rotation.z = -Math.PI / 4.5;
  roof2.castShadow = true;
  group.add(roof2);

  // Part 5: Stone Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.4, 0.75), stoneMat);
  chimney.position.set(-1.3, 3.8, -0.9);
  chimney.castShadow = true;
  group.add(chimney);

  // Part 6 & 7: Warm Glowing Pixel Windows & Front Door
  const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.15), windowGlowMat);
  winLeft.position.set(-1.1, 1.8, 1.72);
  group.add(winLeft);

  const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.15), windowGlowMat);
  winRight.position.set(1.1, 1.8, 1.72);
  group.add(winRight);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.5, 0.18), woodMat);
  door.position.set(0, 1.2, 1.72);
  group.add(door);

  // Part 8 & 9: Rotating Wooden Waterwheel on the Side
  const waterwheel = new THREE.Group();
  waterwheel.position.set(2.35, 1.4, 0);
  group.add(waterwheel);

  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 8, 16), woodMat);
  wheelRim.rotation.y = Math.PI / 2;
  waterwheel.add(wheelRim);

  for (let i = 0; i < 8; i++) {
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 2.3), woodMat);
    paddle.rotation.x = (i * Math.PI) / 4;
    waterwheel.add(paddle);
  }

  return { group, waterwheel };
}

/**
 * 4. Composite 9-Part Blossoming Cherry Tree with Hanging Wooden Swing
 */
export function createBlossomTreeWithSwing(
  barkMat: THREE.Material,
  blossomPrimaryMat: THREE.Material,
  blossomSecondaryMat: THREE.Material,
  woodMat: THREE.Material,
  ropeMat: THREE.Material,
  contactShadowTex: THREE.Texture
): { group: THREE.Group; swingPivot: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'BlossomTree';

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 24),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.52,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  // Part 1: Flared Roots Base
  const roots = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.25, 0.9, 7), barkMat);
  roots.position.y = 0.45;
  roots.castShadow = true;
  group.add(roots);

  // Part 2: Main Gnarled Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 3.6, 7), barkMat);
  trunk.position.y = 2.4;
  trunk.castShadow = true;
  group.add(trunk);

  // Part 3: Horizontal Swing Branch
  const swingBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 3.2, 6), barkMat);
  swingBranch.position.set(-1.3, 3.8, 0);
  swingBranch.rotation.z = Math.PI / 2.2;
  swingBranch.castShadow = true;
  group.add(swingBranch);

  // Parts 4-7: Stepped Voxel Blossom Canopy Clusters
  const canopyConfigs = [
    { x: 0, y: 5.0, z: 0, w: 4.4, h: 2.0, d: 4.2, mat: blossomPrimaryMat },
    { x: -1.6, y: 4.6, z: 0.4, w: 3.0, h: 1.6, d: 3.0, mat: blossomSecondaryMat },
    { x: 1.5, y: 4.5, z: -0.5, w: 2.8, h: 1.6, d: 2.8, mat: blossomSecondaryMat },
    { x: 0, y: 6.2, z: 0, w: 3.0, h: 1.3, d: 2.8, mat: blossomPrimaryMat },
  ];

  canopyConfigs.forEach((cfg) => {
    const cluster = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), cfg.mat);
    cluster.position.set(cfg.x, cfg.y, cfg.z);
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    group.add(cluster);
  });

  // Parts 8-9: Hanging Swing Ropes & Wooden Seat
  const swingPivot = new THREE.Group();
  swingPivot.position.set(-2.1, 3.7, 0);
  group.add(swingPivot);

  const ropeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), ropeMat);
  ropeLeft.position.set(-0.38, -1.1, 0);
  swingPivot.add(ropeLeft);

  const ropeRight = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), ropeMat);
  ropeRight.position.set(0.38, -1.1, 0);
  swingPivot.add(ropeRight);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.42), woodMat);
  seat.position.set(0, -2.2, 0);
  seat.castShadow = true;
  swingPivot.add(seat);

  return { group, swingPivot };
}

/**
 * 5. Cute 7-Part Voxel Sheep
 */
export function createVoxelSheep(
  woolMat: THREE.Material,
  faceMat: THREE.Material,
  contactShadowTex: THREE.Texture
): THREE.Group {
  const sheep = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, 12),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.42,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  sheep.add(shadow);

  // Fluffy Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 1.05), woolMat);
  body.position.y = 0.55;
  body.castShadow = true;
  sheep.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.48), faceMat);
  head.position.set(0, 0.72, 0.62);
  head.castShadow = true;
  sheep.add(head);

  // Wool Top Tuft
  const tuft = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.42), woolMat);
  tuft.position.set(0, 0.96, 0.58);
  sheep.add(tuft);

  // 4 Legs
  const legGeo = new THREE.BoxGeometry(0.16, 0.35, 0.16);
  const legPositions = [
    [-0.22, 0.175, 0.32],
    [0.22, 0.175, 0.32],
    [-0.22, 0.175, -0.32],
    [0.22, 0.175, -0.32],
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, faceMat);
    leg.position.set(lx, ly, lz);
    sheep.add(leg);
  });

  return sheep;
}

/**
 * 6. Arched Wooden Footbridge Over the Stream
 */
export function createWoodenBridge(
  woodMat: THREE.Material,
  darkWoodMat: THREE.Material
): THREE.Group {
  const bridge = new THREE.Group();
  bridge.name = 'WoodenBridge';

  for (let i = -4; i <= 4; i++) {
    const t = i / 4;
    const archY = Math.cos(t * (Math.PI / 2)) * 0.45;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 2.2), woodMat);
    plank.position.set(i * 0.62, 0.25 + archY, 0);
    plank.rotation.z = -Math.sin(t * (Math.PI / 2)) * 0.15;
    plank.castShadow = true;
    plank.receiveShadow = true;
    bridge.add(plank);
  }

  // Side posts & rails
  const postPositions = [-2.4, 0, 2.4];
  postPositions.forEach((px) => {
    const archY = px === 0 ? 0.45 : 0.05;
    [-1.0, 1.0].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), darkWoodMat);
      post.position.set(px, 0.65 + archY, pz);
      post.castShadow = true;
      bridge.add(post);
    });
  });

  [-1.0, 1.0].forEach((pz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 0.12), darkWoodMat);
    rail.position.set(0, 1.15, pz);
    bridge.add(rail);
  });

  return bridge;
}

/**
 * 7. Hero 9-Part 3D Flying Love Letter with Wax Heart Seal, Flapping Pixel Wings, and Rising Sheet
 */
export function createFlyingLoveLetter(
  letterSheetTex: THREE.Texture
): {
  group: THREE.Group;
  flapPivot: THREE.Group;
  sheetMesh: THREE.Mesh;
  leftWingPivot: THREE.Group;
  rightWingPivot: THREE.Group;
  sealMesh: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = 'FlyingLoveLetter';

  const envelopeMat = new THREE.MeshStandardMaterial({
    color: 0xfff3db,
    roughness: 0.72,
    metalness: 0.05,
  });

  const envelopeInnerMat = new THREE.MeshStandardMaterial({
    color: 0xf5d6ba,
    roughness: 0.85,
    metalness: 0.02,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf4b942,
    roughness: 0.28,
    metalness: 0.78,
  });

  const waxSealMat = new THREE.MeshStandardMaterial({
    color: 0xd92644,
    roughness: 0.22,
    metalness: 0.18,
  });

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.08,
    emissive: 0xfff0f5,
    emissiveIntensity: 0.18,
  });

  // Part 1: Main Envelope Pocket Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.12), envelopeMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Part 2: Gold Metallic Rim Border
  const rim = new THREE.Mesh(new THREE.BoxGeometry(2.46, 1.66, 0.08), goldTrimMat);
  rim.position.z = -0.01;
  group.add(rim);

  // Part 3: Inner Pocket Fold Backing
  const pocketFront = new THREE.Mesh(new THREE.BoxGeometry(2.36, 1.15, 0.06), envelopeInnerMat);
  pocketFront.position.set(0, -0.2, 0.05);
  group.add(pocketFront);

  // Part 4: Rising Proposal Parchment Sheet (displays live CanvasTexture unobstructed in front of open flap)
  const sheetMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: letterSheetTex,
    roughness: 0.55,
    metalness: 0.04,
  });
  const sheetMesh = new THREE.Mesh(new THREE.BoxGeometry(2.18, 1.62, 0.04), sheetMat);
  sheetMesh.position.set(0, 0.05, 0.07);
  sheetMesh.castShadow = true;
  group.add(sheetMesh);

  // Part 5: Animated Top Triangular Flap (folds behind the risen sheet when open)
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, 0.8, 0.02);
  group.add(flapPivot);

  const flapShape = new THREE.Shape();
  flapShape.moveTo(-1.2, 0);
  flapShape.lineTo(1.2, 0);
  flapShape.lineTo(0, -0.95);
  flapShape.closePath();

  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
  });
  const flapMesh = new THREE.Mesh(flapGeo, envelopeMat);
  flapPivot.add(flapMesh);

  // Part 6: Embossed 3D Pixel Heart Wax Seal on the Envelope Front Pocket
  const heartSealGeo = createPixelHeartGeometry(0.75);
  const sealMesh = new THREE.Mesh(heartSealGeo, waxSealMat);
  sealMesh.position.set(0, -0.22, 0.14);
  group.add(sealMesh);

  // Parts 7 & 8: Cute Stepped Pixel-Art Angel Wings on Left & Right
  const buildWing = (dir: 1 | -1): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(dir * 1.22, 0.25, 0);

    const bars = [
      { w: 0.65, h: 0.22, x: dir * 0.32, y: 0.22 },
      { w: 0.85, h: 0.22, x: dir * 0.42, y: 0.0 },
      { w: 0.6, h: 0.2, x: dir * 0.3, y: -0.22 },
      { w: 0.38, h: 0.18, x: dir * 0.19, y: -0.4 },
    ];
    bars.forEach((b) => {
      const feather = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, 0.08), wingMat);
      feather.position.set(b.x, b.y, 0);
      feather.castShadow = true;
      pivot.add(feather);
    });
    return pivot;
  };

  const leftWingPivot = buildWing(-1);
  const rightWingPivot = buildWing(1);
  group.add(leftWingPivot);
  group.add(rightWingPivot);

  return {
    group,
    flapPivot,
    sheetMesh,
    leftWingPivot,
    rightWingPivot,
    sealMesh,
  };
}
