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
 * 3. Composite Cozy Farmhouse Cottage with Covered Front Porch (Alpendre), Porch Toys & Waterwheel
 */
export function createCottageGroup(
  plasterMat: THREE.Material,
  woodMat: THREE.Material,
  darkWoodMat: THREE.Material,
  roofMat: THREE.Material,
  stoneMat: THREE.Material,
  windowGlowMat: THREE.Material,
  whiteTrimMat: THREE.Material,
  contactShadowTex: THREE.Texture
): {
  group: THREE.Group;
  waterwheel: THREE.Group;
  rockingHorsePivot: THREE.Group;
} {
  const group = new THREE.Group();
  group.name = 'CozyCottageWithPorch';

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(6.4, 24),
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

  // Part 1: Stone Base of House
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 3.8), stoneMat);
  base.position.y = 0.225;
  base.receiveShadow = true;
  group.add(base);

  // Part 2: Main Cream Plaster Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.7, 3.4), plasterMat);
  walls.position.y = 1.8;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Part 3 & 4: Pitched Shingled Roof
  const roof1 = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.28, 4.1), roofMat);
  roof1.position.set(-1.15, 3.7, 0);
  roof1.rotation.z = Math.PI / 4.5;
  roof1.castShadow = true;
  group.add(roof1);

  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.28, 4.1), roofMat);
  roof2.position.set(1.15, 3.7, 0);
  roof2.rotation.z = -Math.PI / 4.5;
  roof2.castShadow = true;
  group.add(roof2);

  // Gable Triangle Fill
  const gable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 3.36), plasterMat);
  gable.position.set(0, 3.35, 0);
  group.add(gable);

  // Part 5: Stone Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.5, 0.75), stoneMat);
  chimney.position.set(-1.4, 3.9, -0.9);
  chimney.castShadow = true;
  group.add(chimney);

  // Part 6: Warm Glowing Pixel Windows & Front Door
  const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.16), windowGlowMat);
  winLeft.position.set(-1.25, 1.85, 1.72);
  group.add(winLeft);

  const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.16), windowGlowMat);
  winRight.position.set(1.25, 1.85, 1.72);
  group.add(winRight);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.18), darkWoodMat);
  door.position.set(0, 1.25, 1.72);
  group.add(door);

  // Part 7: Covered Front Porch (Alpendre) — Wooden Deck, Steps, Columns, Railing & Sloped Roof
  const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.42, 2.3), woodMat);
  porchDeck.position.set(0, 0.21, 2.8);
  porchDeck.castShadow = true;
  porchDeck.receiveShadow = true;
  group.add(porchDeck);

  // Porch Front Steps
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 0.38), woodMat);
  step1.position.set(0, 0.14, 4.1);
  step1.receiveShadow = true;
  group.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.38), woodMat);
  step2.position.set(0, 0.07, 4.42);
  step2.receiveShadow = true;
  group.add(step2);

  // 4 Wooden Porch Columns supporting the Alpendre Roof
  const colPositions = [-2.15, -0.78, 0.78, 2.15];
  colPositions.forEach((cx) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.15, 0.2), whiteTrimMat);
    col.position.set(cx, 1.48, 3.78);
    col.castShadow = true;
    group.add(col);
  });

  // Porch Railings (Guarda-corpo do alpendre)
  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.12), whiteTrimMat);
  railLeft.position.set(-1.46, 0.95, 3.78);
  group.add(railLeft);

  const railRight = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.12), whiteTrimMat);
  railRight.position.set(1.46, 0.95, 3.78);
  group.add(railRight);

  const railSideL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.1), whiteTrimMat);
  railSideL.position.set(-2.15, 0.95, 2.75);
  group.add(railSideL);

  const railSideR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.1), whiteTrimMat);
  railSideR.position.set(2.15, 0.95, 2.75);
  group.add(railSideR);

  // Sloped Overhang Porch Roof (Telhado do Alpendre)
  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.22, 2.55), roofMat);
  porchRoof.position.set(0, 2.68, 2.82);
  porchRoof.rotation.x = 0.24;
  porchRoof.castShadow = true;
  porchRoof.receiveShadow = true;
  group.add(porchRoof);

  // Part 8: Brinquedos no Alpendre (Toys on the Porch Deck!)
  const toyRedMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.45 });
  const toyBlueMat = new THREE.MeshStandardMaterial({ color: 0x3a86ff, roughness: 0.45 });
  const toyYellowMat = new THREE.MeshStandardMaterial({ color: 0xffbe0b, roughness: 0.4 });
  const toyGreenMat = new THREE.MeshStandardMaterial({ color: 0x2ec4b6, roughness: 0.45 });

  // Toy A: Animated Wooden Rocking Horse (Cavalinho de Balanço) on left side of porch
  const rockingHorsePivot = new THREE.Group();
  rockingHorsePivot.position.set(-1.35, 0.44, 2.75);
  rockingHorsePivot.rotation.y = 0.35;
  group.add(rockingHorsePivot);

  const rockerL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.95), toyRedMat);
  rockerL.position.set(-0.18, 0.04, 0);
  rockingHorsePivot.add(rockerL);

  const rockerR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.95), toyRedMat);
  rockerR.position.set(0.18, 0.04, 0);
  rockingHorsePivot.add(rockerR);

  const horseBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.55), whiteTrimMat);
  horseBody.position.set(0, 0.34, 0);
  horseBody.castShadow = true;
  rockingHorsePivot.add(horseBody);

  const horseSaddle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.24), toyRedMat);
  horseSaddle.position.set(0, 0.44, -0.02);
  rockingHorsePivot.add(horseSaddle);

  const horseNeck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.22), whiteTrimMat);
  horseNeck.position.set(0, 0.56, 0.22);
  horseNeck.rotation.x = -0.3;
  rockingHorsePivot.add(horseNeck);

  const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.32), whiteTrimMat);
  horseHead.position.set(0, 0.72, 0.32);
  rockingHorsePivot.add(horseHead);

  // Toy B: Colorful Stacked Building Blocks (Bloquinhos de Montar) on right side of porch
  const blockGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
  const block1 = new THREE.Mesh(blockGeo, toyRedMat);
  block1.position.set(1.05, 0.55, 2.55);
  block1.castShadow = true;
  group.add(block1);

  const block2 = new THREE.Mesh(blockGeo, toyBlueMat);
  block2.position.set(1.34, 0.55, 2.58);
  block2.rotation.y = 0.25;
  block2.castShadow = true;
  group.add(block2);

  const block3 = new THREE.Mesh(blockGeo, toyYellowMat);
  block3.position.set(1.2, 0.81, 2.56);
  block3.rotation.y = -0.2;
  block3.castShadow = true;
  group.add(block3);

  // Toy C: Wooden Toy Train & Colorful Ball on the porch
  const trainBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.52), toyBlueMat);
  trainBase.position.set(1.65, 0.53, 3.15);
  trainBase.rotation.y = -0.4;
  trainBase.castShadow = true;
  group.add(trainBase);

  const trainCab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.24), toyRedMat);
  trainCab.position.set(1.7, 0.72, 3.22);
  trainCab.rotation.y = -0.4;
  group.add(trainCab);

  const trainStack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), toyYellowMat);
  trainStack.position.set(1.58, 0.7, 3.05);
  group.add(trainStack);

  const toyBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), toyGreenMat);
  toyBall.position.set(-0.65, 0.6, 3.25);
  toyBall.castShadow = true;
  group.add(toyBall);

  // Part 9: Rotating Wooden Waterwheel on the Side
  const waterwheel = new THREE.Group();
  waterwheel.position.set(2.45, 1.4, -0.2);
  group.add(waterwheel);

  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 8, 16), woodMat);
  wheelRim.rotation.y = Math.PI / 2;
  waterwheel.add(wheelRim);

  for (let i = 0; i < 8; i++) {
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 2.3), woodMat);
    paddle.rotation.x = (i * Math.PI) / 4;
    waterwheel.add(paddle);
  }

  return { group, waterwheel, rockingHorsePivot };
}

/**
 * 4. Composite Tree with Prominent Hanging Wooden Swing (Árvore com Balanço)
 */
export function createBlossomTreeWithSwing(
  barkMat: THREE.Material,
  canopyPrimaryMat: THREE.Material,
  canopySecondaryMat: THREE.Material,
  woodMat: THREE.Material,
  ropeMat: THREE.Material,
  contactShadowTex: THREE.Texture
): { group: THREE.Group; swingPivot: THREE.Group } {
  const group = new THREE.Group();
  group.name = 'TreeWithSwing';

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
  const roots = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.35, 0.9, 7), barkMat);
  roots.position.y = 0.45;
  roots.castShadow = true;
  group.add(roots);

  // Part 2: Main Gnarled Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.85, 3.8, 7), barkMat);
  trunk.position.y = 2.5;
  trunk.castShadow = true;
  group.add(trunk);

  // Part 3: Strong Horizontal Swing Branch
  const swingBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 3.6, 6), barkMat);
  swingBranch.position.set(-1.5, 3.85, 0);
  swingBranch.rotation.z = Math.PI / 2.15;
  swingBranch.castShadow = true;
  group.add(swingBranch);

  // Parts 4-7: Stepped Voxel Canopy Clusters
  const canopyConfigs = [
    { x: 0, y: 5.1, z: 0, w: 4.5, h: 2.0, d: 4.3, mat: canopyPrimaryMat },
    { x: -1.65, y: 4.75, z: 0.4, w: 3.1, h: 1.6, d: 3.1, mat: canopySecondaryMat },
    { x: 1.55, y: 4.6, z: -0.5, w: 2.9, h: 1.6, d: 2.9, mat: canopySecondaryMat },
    { x: 0, y: 6.3, z: 0, w: 3.1, h: 1.3, d: 2.9, mat: canopyPrimaryMat },
  ];

  canopyConfigs.forEach((cfg) => {
    const cluster = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), cfg.mat);
    cluster.position.set(cfg.x, cfg.y, cfg.z);
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    group.add(cluster);
  });

  // Parts 8-9: Prominent Hanging Swing Ropes & Wooden Seat with Red Cushion
  const swingPivot = new THREE.Group();
  swingPivot.position.set(-2.25, 3.75, 0);
  group.add(swingPivot);

  const ropeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.35, 6), ropeMat);
  ropeLeft.position.set(-0.44, -1.17, 0);
  swingPivot.add(ropeLeft);

  const ropeRight = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.35, 6), ropeMat);
  ropeRight.position.set(0.44, -1.17, 0);
  swingPivot.add(ropeRight);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.52), woodMat);
  seat.position.set(0, -2.35, 0);
  seat.castShadow = true;
  swingPivot.add(seat);

  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.6 });
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.44), cushionMat);
  cushion.position.set(0, -2.26, 0);
  swingPivot.add(cushion);

  return { group, swingPivot };
}

/**
 * 4B. Composite 10-Part Backyard Trampoline (Pula-Pula no Quintal)
 */
export function createTrampolineGroup(
  metalMat: THREE.Material,
  contactShadowTex: THREE.Texture
): { group: THREE.Group; jumperGroup: THREE.Group; jumpMatMesh: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = 'BackyardTrampoline';

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 24),
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

  const padBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0096c7,
    roughness: 0.42,
    metalness: 0.1,
  });

  const matDarkMat = new THREE.MeshStandardMaterial({
    color: 0x222629,
    roughness: 0.85,
    metalness: 0.05,
  });

  const poleYellowMat = new THREE.MeshStandardMaterial({
    color: 0xffbe0b,
    roughness: 0.4,
  });

  const netMat = new THREE.MeshStandardMaterial({
    color: 0x1b263b,
    transparent: true,
    opacity: 0.26,
    roughness: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Part 1: Circular Blue Safety Spring Pad Ring
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.24, 10, 24), padBlueMat);
  padRing.rotation.x = Math.PI / 2;
  padRing.position.y = 0.78;
  padRing.castShadow = true;
  padRing.receiveShadow = true;
  group.add(padRing);

  // Part 2: Elastic Center Jumping Mat
  const jumpMatMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.68, 1.68, 0.06, 20),
    matDarkMat
  );
  jumpMatMesh.position.y = 0.76;
  jumpMatMesh.receiveShadow = true;
  group.add(jumpMatMesh);

  // Part 3: 6 Steel Support Legs & Enclosure Poles with Yellow Foam Sleeves
  const poleCount = 6;
  for (let i = 0; i < poleCount; i++) {
    const angle = (i / poleCount) * Math.PI * 2;
    const px = Math.cos(angle) * 1.92;
    const pz = Math.sin(angle) * 1.92;

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 8), metalMat);
    leg.position.set(px, 0.39, pz);
    leg.castShadow = true;
    group.add(leg);

    // Leave front entrance gap on the net poles or place poles around
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 1.85, 8),
      poleYellowMat
    );
    pole.position.set(px, 1.7, pz);
    pole.castShadow = true;
    group.add(pole);

    const poleCap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), padBlueMat);
    poleCap.position.set(px, 2.65, pz);
    group.add(poleCap);
  }

  // Part 4: Safety Enclosure Net Cylinder
  const netMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 1.9, 1.7, 20, 1, true, 0.4, Math.PI * 1.75),
    netMat
  );
  netMesh.position.y = 1.65;
  group.add(netMesh);

  // Top Colorful Bunting Ring
  const topRing = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.04, 6, 20), poleYellowMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = 2.52;
  group.add(topRing);

  // Part 5: Mini Access Ladder at the Front
  const ladderRailL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), metalMat);
  ladderRailL.position.set(-0.22, 0.42, 2.15);
  ladderRailL.rotation.x = -0.35;
  group.add(ladderRailL);

  const ladderRailR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.06), metalMat);
  ladderRailR.position.set(0.22, 0.42, 2.15);
  ladderRailR.rotation.x = -0.35;
  group.add(ladderRailR);

  const rung1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.1), padBlueMat);
  rung1.position.set(0, 0.3, 2.2);
  group.add(rung1);

  const rung2 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.1), padBlueMat);
  rung2.position.set(0, 0.56, 2.1);
  group.add(rung2);

  // Part 6: Cute Bouncing Voxel Teddy / Plush Bear & Beach Ball inside the Trampoline!
  const jumperGroup = new THREE.Group();
  jumperGroup.position.set(0, 0.9, 0);
  group.add(jumperGroup);

  const bearMat = new THREE.MeshStandardMaterial({ color: 0xd48c46, roughness: 0.7 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xff2a55, roughness: 0.4 });

  const bearTorso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.38), bearMat);
  bearTorso.position.y = 0.26;
  bearTorso.castShadow = true;
  jumperGroup.add(bearTorso);

  const bearHead = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.4, 0.4), bearMat);
  bearHead.position.y = 0.72;
  bearHead.castShadow = true;
  jumperGroup.add(bearHead);

  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), bearMat);
  earL.position.set(-0.18, 0.96, 0);
  jumperGroup.add(earL);

  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), bearMat);
  earR.position.set(0.18, 0.96, 0);
  jumperGroup.add(earR);

  const bow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.12), ribbonMat);
  bow.position.set(0, 0.5, 0.2);
  jumperGroup.add(bow);

  return { group, jumperGroup, jumpMatMesh };
}

/**
 * 4C. Composite 11-Part Fruit Tree in the Backyard (Árvore de Frutas no Quintal)
 */
export function createFruitTreeGroup(
  barkMat: THREE.Material,
  woodMat: THREE.Material,
  contactShadowTex: THREE.Texture
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BackyardFruitTree';

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 24),
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

  const leafPrimaryMat = new THREE.MeshStandardMaterial({
    color: 0x388e3c,
    roughness: 0.75,
    metalness: 0.02,
  });

  const leafLightMat = new THREE.MeshStandardMaterial({
    color: 0x4caf50,
    roughness: 0.72,
    metalness: 0.02,
  });

  const redAppleMat = new THREE.MeshStandardMaterial({
    color: 0xe62e2d,
    roughness: 0.25,
    metalness: 0.08,
  });

  const goldenFruitMat = new THREE.MeshStandardMaterial({
    color: 0xff9f1c,
    roughness: 0.3,
    metalness: 0.06,
  });

  // Part 1 & 2: Roots and Sturdy Trunk
  const roots = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 1.15, 0.8, 7), barkMat);
  roots.position.y = 0.4;
  roots.castShadow = true;
  group.add(roots);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.72, 3.2, 7), barkMat);
  trunk.position.y = 2.1;
  trunk.castShadow = true;
  group.add(trunk);

  // Parts 3-6: Multi-Tiered Lush Green Voxel Canopy
  const canopyBlocks = [
    { x: 0, y: 4.2, z: 0, w: 3.9, h: 1.9, d: 3.9, mat: leafPrimaryMat },
    { x: -1.35, y: 3.85, z: 0.5, w: 2.5, h: 1.5, d: 2.5, mat: leafLightMat },
    { x: 1.35, y: 3.9, z: -0.4, w: 2.5, h: 1.5, d: 2.5, mat: leafLightMat },
    { x: 0, y: 5.35, z: 0, w: 2.7, h: 1.25, d: 2.7, mat: leafLightMat },
  ];

  canopyBlocks.forEach((b) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), b.mat);
    mesh.position.set(b.x, b.y, b.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // Parts 7-10: 16 Vibrant 3D Voxel Apples & Golden Oranges Hanging Around the Canopy
  const fruitGeo = new THREE.BoxGeometry(0.32, 0.34, 0.32);
  const fruitCoords: [number, number, number, boolean][] = [
    [-1.4, 3.3, 1.85, true],
    [-0.4, 3.5, 1.98, false],
    [0.65, 3.35, 1.95, true],
    [1.55, 3.2, 1.2, true],
    [-1.95, 3.4, 0.85, false],
    [-2.1, 3.8, -0.2, true],
    [2.1, 3.5, 0.25, true],
    [1.8, 4.2, 1.1, false],
    [-0.95, 4.4, 1.95, true],
    [0.85, 4.5, 1.92, true],
    [-0.2, 5.1, 1.4, false],
    [1.2, 3.4, -1.7, true],
    [-1.1, 3.5, -1.85, true],
    [0, 4.2, -1.98, false],
  ];

  fruitCoords.forEach(([fx, fy, fz, isRed]) => {
    const fruit = new THREE.Mesh(fruitGeo, isRed ? redAppleMat : goldenFruitMat);
    fruit.position.set(fx, fy, fz);
    fruit.castShadow = true;
    group.add(fruit);
  });

  // Part 11: Woven Wooden Harvest Basket Filled with Fruits at the Base of the Tree
  const basketGroup = new THREE.Group();
  basketGroup.position.set(1.25, 0, 1.15);
  group.add(basketGroup);

  const basketBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.52, 0.78), woodMat);
  basketBox.position.y = 0.26;
  basketBox.castShadow = true;
  basketGroup.add(basketBox);

  const basketFruits = [
    [-0.2, 0.56, -0.1, true],
    [0.18, 0.58, -0.12, false],
    [0, 0.6, 0.14, true],
    [-0.22, 0.55, 0.16, false],
    [0.22, 0.56, 0.15, true],
  ] as const;

  basketFruits.forEach(([bx, by, bz, isRed]) => {
    const bf = new THREE.Mesh(fruitGeo, isRed ? redAppleMat : goldenFruitMat);
    bf.scale.setScalar(0.82);
    bf.position.set(bx, by, bz);
    basketGroup.add(bf);
  });

  return group;
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
