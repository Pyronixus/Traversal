const BOARD_SIZE = 10,
  BOARD_BASE_HEIGHT = 0.3,
  TERRAIN_HEIGHT_SCALE = 0.3,
  getElement = (id) => document.getElementById(id),
  BOARD_CENTER_OFFSET = (BOARD_SIZE - 1) / 2;
const ORTHOGONAL_DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ],
  PIECE_MOVEMENT_RANGE = { e: 5, v: 4, s: 3 },
  PIECE_STRENGTH = { e: 1, v: 2, s: 3 },
  PIECE_DISPLAY_NAMES = { e: "Explorer", v: "Vanguard", s: "Sentinel" };
const STARTING_PIECE_SETUP = [
  ["s", 2],
  ["v", 3],
  ["e", 4],
  ["e", 5],
  ["v", 6],
  ["s", 7],
];
let TERRAIN_HEIGHTS,
  PIECES,
  GAME_STATE,
  PIECE_MESHES,
  ACTIVE_PLAYER,
  IS_ANIMATING,
  SELECTED_PIECE,
  COMPLETED_MOVE_COUNT = 0,
  GAME_WORLD,
  GAME_MODE = 1,
  TERRAIN_TILE_MESHES;

/* ---------- game rules ---------- */
const findPieceAt = (PIECES, r, c) =>
  PIECES.find((x) => x.on && x.r == r && x.c == c);
const calculateMovementCost = (a, b, c, d) => {
  const h = TERRAIN_HEIGHTS[c][d] - TERRAIN_HEIGHTS[a][b];
  return h ? Math.abs(h) + 1 : 1;
};
function resolveCombat(PIECES, a, d) {
  const hd = TERRAIN_HEIGHTS[a.r][a.c] - TERRAIN_HEIGHTS[d.r][d.c];
  let A = PIECE_STRENGTH[a.t] + (hd > 0 ? 1 : hd < 0 ? -1 : 0),
    D = PIECE_STRENGTH[d.t];
  for (const [dr, dc] of ORTHOGONAL_DIRECTIONS) {
    const x = findPieceAt(PIECES, d.r + dr, d.c + dc);
    if (x) {
      if (x.p == a.p && x !== a) A += PIECE_STRENGTH[x.t];
      else if (x.p == d.p) D++;
    }
  }
  return [A, D];
}
function generateLegalMoves(PIECES, pc) {
  const out = [],
    m0 = PIECE_MOVEMENT_RANGE[pc.t],
    goal = pc.p == 1 ? 0 : BOARD_SIZE - 1,
    best = new Map([[pc.r * BOARD_SIZE + pc.c, m0]]),
    mp = new Map(),
    tg = new Map(),
    ex = new Set();
  if (pc.r == goal) ex.add(pc.c);
  const q = [[pc.r, pc.c, m0]];
  let queueHead = 0;
  while (queueHead < q.length) {
    const [r, c, rem] = q[queueHead++];
    if (rem < (best.get(r * BOARD_SIZE + c) ?? -1)) continue;
    if (rem >= 1 && r == goal && (r != pc.r || c != pc.c)) ex.add(c);
    for (const [dr, dc] of ORTHOGONAL_DIRECTIONS) {
      const a = r + dr,
        b = c + dc;
      if (a < 0 || b < 0 || a >= BOARD_SIZE || b >= BOARD_SIZE) continue;
      const k = calculateMovementCost(r, c, a, b);
      if (k > rem) continue;
      const o = findPieceAt(PIECES, a, b);
      if (o) {
        if (o.p != pc.p) {
          const ac = m0 - rem + k,
            e = tg.get(a * BOARD_SIZE + b);
          if (!e || ac < e.ac) tg.set(a * BOARD_SIZE + b, { ac, o });
        }
        continue;
      }
      const nr = rem - k,
        key = a * BOARD_SIZE + b;
      if (nr > (best.get(key) ?? -1)) {
        best.set(key, nr);
        if (a != pc.r || b != pc.c) mp.set(key, { r: a, c: b, cost: m0 - nr });
        if (nr > 0) q.push([a, b, nr]);
      }
    }
  }
  for (const m of mp.values()) out.push(m);
  for (const [, { ac, o }] of tg) {
    const [A, D] = resolveCombat(PIECES, pc, o);
    if (A + (pc.t == "v" && ac == 4 ? 1 : 0) >= D)
      out.push({ r: o.r, c: o.c, atk: o, cost: ac });
  }
  for (const c of ex)
    out.push({ exit: true, c, r: pc.p == 1 ? -1 : BOARD_SIZE });
  if (pc.t == "e")
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [-2, 0],
      [0, -2],
      [2, 0],
      [0, 2],
    ]) {
      const a = pc.r + dr,
        b = pc.c + dc;
      if (Math.abs(dr) == 2 || Math.abs(dc) == 2) {
        const jr = pc.r + dr / 2,
          jc = pc.c + dc / 2;
        if (
          jr < 0 ||
          jc < 0 ||
          jr >= BOARD_SIZE ||
          jc >= BOARD_SIZE ||
          findPieceAt(PIECES, jr, jc)
        )
          continue;
      }
      if (a < 0 || a >= BOARD_SIZE) {
        if (
          b >= 0 &&
          b < BOARD_SIZE &&
          (pc.p == 1 ? dr < 0 : dr > 0) &&
          !ex.has(b)
        ) {
          ex.add(b);
          out.push({ exit: true, c: b, r: pc.p == 1 ? -1 : BOARD_SIZE });
        }
        continue;
      }
      if (b < 0 || b >= BOARD_SIZE) continue;
      const key = a * BOARD_SIZE + b;
      if (best.has(key) || tg.has(key)) continue;
      const o = findPieceAt(PIECES, a, b);
      if (!o) out.push({ r: a, c: b, cost: m0 });
      else if (o.p != pc.p) {
        const [A, D] = resolveCombat(PIECES, pc, o);
        if (A >= D) out.push({ r: a, c: b, atk: o, cost: m0 });
      }
    }
  return out;
}
function applyMoveToState(PIECES, pc, m, s) {
  if (m.atk) PIECES[m.atk.i].on = false;
  if (m.exit) {
    pc.on = false;
    s.scores[pc.p - 1] += PIECE_STRENGTH[pc.t];
    s.piecesExited++;
    if (!s.firstExitOccurred) {
      s.firstExitOccurred = 1;
      if (pc.t == "s") {
        s.isGameOver = 1;
        s.winningPlayer = pc.p;
      }
    }
  } else {
    pc.r = m.r;
    pc.c = m.c;
  }
  if (!s.isGameOver && s.piecesExited >= 2) {
    s.isGameOver = 1;
    s.winningPlayer =
      s.scores[0] > s.scores[1] ? 1 : s.scores[1] > s.scores[0] ? 2 : 0;
  }
  if (!s.isGameOver) {
    const a = PIECES.filter((x) => x.on && x.p == 1),
      b = PIECES.filter((x) => x.on && x.p == 2);
    if (!a.length || !b.length) {
      s.isGameOver = 1;
      const mx = (l) =>
        l.length ? Math.max(...l.map((x) => PIECE_STRENGTH[x.t])) : 0;
      s.scores[0] += mx(a);
      s.scores[1] += mx(b);
      s.winningPlayer =
        s.scores[0] > s.scores[1] ? 1 : s.scores[1] > s.scores[0] ? 2 : 0;
    }
  }
}
function resolveMoveLimit() {
  GAME_STATE.isGameOver = 1;
  if (GAME_STATE.scores[0] != GAME_STATE.scores[1])
    GAME_STATE.winningPlayer =
      GAME_STATE.scores[0] > GAME_STATE.scores[1] ? 1 : 2;
  else {
    const f = (p) =>
        Math.max(
          -1,
          ...PIECES.filter((x) => x.on && x.p == p).map(
            (x) =>
              (p == 1 ? BOARD_SIZE - 1 - x.r : x.r) * 10 + PIECE_STRENGTH[x.t],
          ),
        ),
      a = f(1),
      b = f(2);
    GAME_STATE.winningPlayer = a > b ? 1 : b > a ? 2 : 0;
  }
}
/* ---------- computer player (asynchronous; keeps rendering responsive) ---------- */
function evaluatePosition(PIECES, s) {
  if (s.isGameOver)
    return s.winningPlayer == 2 ? 1e6 : s.winningPlayer == 1 ? -1e6 : 0;
  let v = (s.scores[1] - s.scores[0]) * 60;
  for (const x of PIECES)
    if (x.on) {
      const adv = x.p == 2 ? x.r : BOARD_SIZE - 1 - x.r,
        w = PIECE_STRENGTH[x.t],
        k = w * 8 + adv * (1 + w * 0.6) + (x.t == "s" ? adv * adv * 0.15 : 0);
      v += x.p == 2 ? k : -k;
    }
  return v;
}
function* generateComputerMove() {
  const cl = (PIECES) => PIECES.map((x) => ({ ...x }));
  let best = -1e9,
    bm = null;
  for (const pc of PIECES)
    if (pc.on && pc.p == 2)
      for (const m of generateLegalMoves(PIECES, pc)) {
        const P2 = cl(PIECES),
          s2 = { ...GAME_STATE, scores: [...GAME_STATE.scores] };
        applyMoveToState(P2, P2[pc.i], m, s2);
        let v;
        if (s2.isGameOver) v = evaluatePosition(P2, s2);
        else {
          v = 1e9;
          let any = 0;
          for (const h of P2)
            if (h.on && h.p == 1)
              for (const hm of generateLegalMoves(P2, h)) {
                any = 1;
                const P3 = cl(P2),
                  s3 = { ...s2, scores: [...s2.scores] };
                applyMoveToState(P3, P3[h.i], hm, s3);
                const e = evaluatePosition(P3, s3);
                if (e < v) v = e;
              }
          if (!any) v = evaluatePosition(P2, s2);
        }
        v += Math.random() * 3;
        if (v > best) {
          best = v;
          bm = { pc, m };
        }
        yield;
      }
  return bm;
}
function runComputerTurn() {
  const it = generateComputerMove();
  (function step() {
    const t0 = performance.now();
    let r;
    do {
      r = it.next();
    } while (!r.done && performance.now() - t0 < 6);
    if (r.done) {
      const b = r.value;
      b ? animatePieceMove(b.pc, b.m, finishTurn) : finishTurn();
    } else requestAnimationFrame(step);
  })();
}

/* ---------- rendering and post-processing ---------- */
const prefersDarkColorScheme = matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches,
  sceneBackgroundColor = prefersDarkColorScheme ? 0x20150d : 0x6b4a2e;
const gameCanvas = getElement("game-canvas"),
  webGLRenderer = new THREE.WebGLRenderer({
    canvas: gameCanvas,
    antialias: true,
    powerPreference: "high-performance",
  });
webGLRenderer.outputEncoding = THREE.sRGBEncoding;
webGLRenderer.setClearColor(sceneBackgroundColor);
webGLRenderer.shadowMap.enabled = true;
webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
const gameScene = new THREE.Scene(),
  gameCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
gameScene.fog = new THREE.Fog(sceneBackgroundColor, 26, 62);
let sceneRenderTarget,
  renderResolutionScale = Math.min(
    Math.max(window.devicePixelRatio || 1, 1),
    2,
  ),
  maximumRenderResolutionScale = renderResolutionScale;
const postProcessingMaterial = new THREE.ShaderMaterial({
  depthTest: false,
  uniforms: {
    tD: { value: null },
    px: { value: new THREE.Vector2() },
    t: { value: 0 },
  },
  vertexShader:
    "varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}",
  fragmentShader: `uniform sampler2D tD;uniform vec2 px;uniform float t;varying vec2 v;
 vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
 void main(){
  vec3 center=texture2D(tD,v).rgb;
  vec3 neighbours=(texture2D(tD,v+vec2(px.x,0.)).rgb+texture2D(tD,v-vec2(px.x,0.)).rgb+texture2D(tD,v+vec2(0.,px.y)).rgb+texture2D(tD,v-vec2(0.,px.y)).rgb)*.25;
  vec3 col=clamp(center+(center-neighbours)*.22,0.,1.);
  float vignette=smoothstep(1.12,.28,length((v-.5)*vec2(1.08,1.)));
  col*=mix(.9,1.,vignette);
  col=aces(col*1.02);
  col=mix(vec3(dot(col,vec3(.299,.587,.114))),col,1.08)*vec3(1.025,1.,.975);
  gl_FragColor=vec4(col,1.);
  #include <encodings_fragment>
 }`,
});
const postProcessingScene = new THREE.Scene(),
  postProcessingCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
  postProcessingQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    postProcessingMaterial,
  );
postProcessingQuad.frustumCulled = false;
postProcessingScene.add(postProcessingQuad);
function resizeRenderer() {
  const w = innerWidth,
    h = innerHeight,
    W = Math.round(w * renderResolutionScale),
    Hh = Math.round(h * renderResolutionScale);
  webGLRenderer.setPixelRatio(1);
  webGLRenderer.setSize(W, Hh, false);
  gameCamera.aspect = w / h;
  gameCamera.updateProjectionMatrix();
  sceneRenderTarget && sceneRenderTarget.dispose();
  sceneRenderTarget = webGLRenderer.capabilities.isWebGL2
    ? new THREE.WebGLMultisampleRenderTarget(W, Hh, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      })
    : new THREE.WebGLRenderTarget(W, Hh, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });
  if (webGLRenderer.capabilities.isWebGL2) {
    sceneRenderTarget.samples = Math.min(
      4,
      webGLRenderer.capabilities.maxSamples || 4,
    );
  }
  postProcessingMaterial.uniforms.px.value.set(1 / W, 1 / Hh);
  targetCameraDistance = Math.max(15, 17 / gameCamera.aspect);
}
/* environment (polished-surface reflections) */
{
  const environmentMapGenerator = new THREE.PMREMGenerator(webGLRenderer),
    environmentScene = new THREE.Scene(),
    g = document.createElement("canvas");
  g.width = 512;
  g.height = 256;
  const x = g.getContext("2d"),
    gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#fff5e3");
  gr.addColorStop(0.28, "#d3b28d");
  gr.addColorStop(0.56, "#76523a");
  gr.addColorStop(1, "#171a25");
  x.fillStyle = gr;
  x.fillRect(0, 0, 512, 256);
  for (const [panelX, panelWidth, panelColor] of [
    [38, 34, "rgba(255,250,238,.86)"],
    [142, 20, "rgba(180,220,255,.7)"],
    [238, 42, "rgba(255,255,255,.9)"],
    [366, 24, "rgba(255,191,125,.72)"],
    [455, 30, "rgba(235,245,255,.82)"],
  ]) {
    const panelGradient = x.createLinearGradient(
      panelX,
      0,
      panelX + panelWidth,
      0,
    );
    panelGradient.addColorStop(0, "rgba(255,255,255,0)");
    panelGradient.addColorStop(0.35, panelColor);
    panelGradient.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = panelGradient;
    x.fillRect(panelX, 22, panelWidth, 210);
  }
  const horizonGlow = x.createLinearGradient(0, 80, 0, 175);
  horizonGlow.addColorStop(0, "rgba(255,255,255,0)");
  horizonGlow.addColorStop(0.5, "rgba(255,255,255,.22)");
  horizonGlow.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = horizonGlow;
  x.fillRect(0, 80, 512, 95);
  const environmentTexture = new THREE.CanvasTexture(g);
  environmentTexture.encoding = THREE.sRGBEncoding;
  environmentScene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(30, 48, 24),
      new THREE.MeshBasicMaterial({
        map: environmentTexture,
        side: THREE.BackSide,
      }),
    ),
  );
  for (const [px, py, pz, w] of [
    [10, 12, 8, 10],
    [-12, 8, -4, 8],
    [2, 9, -14, 12],
  ]) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w * 0.5),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(7, 6, 5),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(px, py, pz);
    m.lookAt(0, 0, 0);
    environmentScene.add(m);
  }
  gameScene.environment = environmentMapGenerator.fromScene(
    environmentScene,
    0.03,
  ).texture;
  environmentMapGenerator.dispose();
}
gameScene.add(new THREE.HemisphereLight(0xffe9cc, 0x4a2c18, 0.25));
const key = new THREE.DirectionalLight(0xffdfb0, 0.85);
key.position.set(7, 14, 9);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 3;
Object.assign(key.shadow.camera, {
  left: -9,
  right: 9,
  top: 9,
  bottom: -9,
  near: 2,
  far: 40,
});
key.shadow.camera.updateProjectionMatrix();
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.02;
gameScene.add(key);
const rim = new THREE.DirectionalLight(0xffb070, 0.4);
rim.position.set(-8, 5, -10);
gameScene.add(rim);
const pieceSelectionLight = new THREE.PointLight(0xffa850, 0, 7, 1.6);
gameScene.add(pieceSelectionLight);

/* ---------- wood textures ---------- */
function createWoodTexture(base, ln, rings = 40, sz = 1024, rep = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = sz;
  const g = c.getContext("2d");
  g.fillStyle = base;
  g.fillRect(0, 0, sz, sz);
  for (let i = 0; i < rings * 3; i++) {
    const y = Math.random() * sz,
      a = Math.random() * 0.16 + 0.02,
      currentCameraPolarAngle = Math.random() * 6,
      am = 3 + Math.random() * 10,
      fq = 0.006 + Math.random() * 0.01;
    g.strokeStyle = `rgba(${ln},${a})`;
    g.lineWidth = 0.4 + Math.random() * 3;
    g.beginPath();
    for (let x = 0; x <= sz; x += 8)
      g.lineTo(x, y + Math.sin(x * fq + currentCameraPolarAngle) * am);
    g.stroke();
  }
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = `rgba(${ln},${Math.random() * 0.13})`;
    g.fillRect(
      Math.random() * sz,
      Math.random() * sz,
      Math.random() * 16 + 2,
      1,
    );
  }
  const gr = g.createLinearGradient(0, 0, 0, sz);
  gr.addColorStop(0, "rgba(255,255,255,.07)");
  gr.addColorStop(1, "rgba(0,0,0,.09)");
  g.fillStyle = gr;
  g.fillRect(0, 0, sz, sz);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = Math.min(16, webGLRenderer.capabilities.getMaxAnisotropy());
  t.repeat.set(rep, rep);
  return t;
}
const TERRAIN_CELL_TEXTURES = [0, 1, 2].map((i) =>
    createWoodTexture(
      ["#e8cda4", "#e0c298", "#ebd2ab"][i],
      "120,80,40",
      40,
      1024,
    ),
  ),
  BOARD_FRAME_TEXTURE = createWoodTexture("#4d2d19", "20,8,2", 50),
  TABLE_SURFACE_TEXTURE = createWoodTexture("#2f1c10", "10,4,0", 60, 1024, 7);
const createWoodMaterial = (baseColor, grainColor) => {
  const woodTexture = createWoodTexture(baseColor, grainColor, 44);
  return new THREE.MeshPhysicalMaterial({
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.14,
    roughness: 0.25,
    metalness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.15,
    flatShading: false,
  });
};
const WOOD_PIECE_MATERIALS = [
    null,
    createWoodMaterial("#efd4a2", "150,100,50"),
    createWoodMaterial("#4b2a16", "25,10,3"),
  ],
  WOOD_INSET_MATERIALS = [
    null,
    createWoodMaterial("#5a3319", "25,10,3"),
    createWoodMaterial("#ecd0a0", "150,100,50"),
  ];

/* ---------- piece materials and skins ---------- */
function createMarbleTexture(baseColor, veinColor) {
  const textureSize = 1024;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = textureCanvas.height = textureSize;
  const textureContext = textureCanvas.getContext("2d");
  textureContext.fillStyle = baseColor;
  textureContext.fillRect(0, 0, textureSize, textureSize);

  for (let veinIndex = 0; veinIndex < 64; veinIndex++) {
    const startingY = Math.random() * textureSize;
    const phase = Math.random() * Math.PI * 2;
    const primaryAmplitude = 10 + Math.random() * 32;
    const secondaryAmplitude = 4 + Math.random() * 18;
    const primaryFrequency = 0.0045 + Math.random() * 0.002;
    const secondaryFrequency = 0.012 + Math.random() * 0.008;
    textureContext.beginPath();
    for (let x = 0; x <= textureSize; x += 4) {
      const y =
        startingY +
        Math.sin(x * primaryFrequency + phase) * primaryAmplitude +
        Math.sin(x * secondaryFrequency + phase * 1.7) * secondaryAmplitude;
      if (x === 0) textureContext.moveTo(x, y);
      else textureContext.lineTo(x, y);
    }
    textureContext.strokeStyle = veinColor;
    textureContext.globalAlpha = 0.06 + Math.random() * 0.16;
    textureContext.lineWidth = 1 + Math.random() * 4;
    textureContext.stroke();
    if (veinIndex % 3 === 0) {
      textureContext.globalAlpha *= 0.55;
      textureContext.lineWidth *= 0.45;
      textureContext.stroke();
    }
  }
  textureContext.globalAlpha = 1;

  const surfaceGradient = textureContext.createLinearGradient(
    0,
    0,
    textureSize,
    textureSize,
  );
  surfaceGradient.addColorStop(0, "rgba(255,255,255,0.13)");
  surfaceGradient.addColorStop(1, "rgba(0,0,0,0.13)");
  textureContext.fillStyle = surfaceGradient;
  textureContext.fillRect(0, 0, textureSize, textureSize);

  const marbleTexture = new THREE.CanvasTexture(textureCanvas);
  marbleTexture.encoding = THREE.sRGBEncoding;
  marbleTexture.wrapS = marbleTexture.wrapT = THREE.RepeatWrapping;
  marbleTexture.anisotropy = Math.min(
    16,
    webGLRenderer.capabilities.getMaxAnisotropy(),
  );
  return marbleTexture;
}

function createFinishTexture(baseColor, detailColor, finish) {
  const textureSize = 1024;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = textureCanvas.height = textureSize;
  const textureContext = textureCanvas.getContext("2d");
  const ctx = textureContext;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, textureSize, textureSize);

  if (finish === "obsidian") {
    const depthGradient = ctx.createLinearGradient(
      0,
      0,
      textureSize,
      textureSize,
    );
    depthGradient.addColorStop(0, "rgba(0,0,0,.48)");
    depthGradient.addColorStop(0.42, "rgba(90,62,125,.12)");
    depthGradient.addColorStop(1, "rgba(0,0,0,.62)");
    ctx.fillStyle = depthGradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    for (let crackIndex = 0; crackIndex < 72; crackIndex++) {
      let x = Math.random() * textureSize;
      let y = Math.random() * textureSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let segment = 0; segment < 7; segment++) {
        x += (Math.random() - 0.5) * 100;
        y += (Math.random() - 0.5) * 130;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = detailColor;
      ctx.globalAlpha = 0.09 + Math.random() * 0.2;
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.stroke();
    }
  } else if (finish === "jade") {
    const jadeDepth = ctx.createLinearGradient(0, 0, textureSize, textureSize);
    jadeDepth.addColorStop(0, "rgba(172,255,211,.18)");
    jadeDepth.addColorStop(0.45, "rgba(3,54,40,.12)");
    jadeDepth.addColorStop(1, "rgba(0,24,19,.36)");
    ctx.fillStyle = jadeDepth;
    ctx.fillRect(0, 0, textureSize, textureSize);
    for (let patchIndex = 0; patchIndex < 90; patchIndex++) {
      const x = Math.random() * textureSize;
      const y = Math.random() * textureSize;
      const radius = 12 + Math.random() * 85;
      const patch = ctx.createRadialGradient(x, y, 1, x, y, radius);
      patch.addColorStop(
        0,
        `rgba(180,255,219,${0.025 + Math.random() * 0.055})`,
      );
      patch.addColorStop(1, "rgba(0,28,19,0)");
      ctx.fillStyle = patch;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let veinIndex = 0; veinIndex < 38; veinIndex++) {
      let x = Math.random() * textureSize;
      let y = Math.random() * textureSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let segment = 0; segment < 12; segment++) {
        x += (Math.random() - 0.5) * 70;
        y += (Math.random() - 0.5) * 55;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = detailColor;
      ctx.globalAlpha = 0.07 + Math.random() * 0.12;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.stroke();
    }
  } else if (finish === "chrome") {
    const metalGradient = ctx.createLinearGradient(
      0,
      0,
      textureSize,
      textureSize * 0.18,
    );
    metalGradient.addColorStop(0, "rgba(255,255,255,.58)");
    metalGradient.addColorStop(0.16, "rgba(35,58,78,.48)");
    metalGradient.addColorStop(0.31, "rgba(255,255,255,.8)");
    metalGradient.addColorStop(0.52, "rgba(65,87,109,.4)");
    metalGradient.addColorStop(0.72, "rgba(255,255,255,.72)");
    metalGradient.addColorStop(1, "rgba(24,34,49,.35)");
    ctx.fillStyle = metalGradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    for (let streakIndex = 0; streakIndex < 240; streakIndex++) {
      const y = Math.random() * textureSize;
      ctx.strokeStyle =
        streakIndex % 3 ? "rgba(255,255,255,.035)" : "rgba(0,12,28,.045)";
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(textureSize, y + (Math.random() - 0.5) * 18);
      ctx.stroke();
    }
  } else if (finish === "bronze") {
    const patinaTint = ctx.createLinearGradient(0, 0, textureSize, textureSize);
    patinaTint.addColorStop(0, "rgba(255,218,150,.22)");
    patinaTint.addColorStop(0.48, "rgba(99,46,25,.06)");
    patinaTint.addColorStop(1, "rgba(19,16,14,.36)");
    ctx.fillStyle = patinaTint;
    ctx.fillRect(0, 0, textureSize, textureSize);
    for (let patinaIndex = 0; patinaIndex < 100; patinaIndex++) {
      const x = Math.random() * textureSize;
      const y = Math.random() * textureSize;
      const radius = 5 + Math.random() * 55;
      const patina = ctx.createRadialGradient(x, y, 0, x, y, radius);
      patina.addColorStop(0, `rgba(63,151,119,${0.12 + Math.random() * 0.22})`);
      patina.addColorStop(0.6, "rgba(49,102,80,.08)");
      patina.addColorStop(1, "rgba(23,54,45,0)");
      ctx.fillStyle = patina;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let scratchIndex = 0; scratchIndex < 400; scratchIndex++) {
      const y = Math.random() * textureSize;
      ctx.strokeStyle =
        Math.random() > 0.5 ? "rgba(255,232,178,.07)" : "rgba(34,17,9,.06)";
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * textureSize, y);
      ctx.lineTo(Math.random() * textureSize, y + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }
  } else if (finish === "neon") {
    const darkBase = ctx.createLinearGradient(0, 0, textureSize, textureSize);
    darkBase.addColorStop(0, "rgba(2,7,22,.55)");
    darkBase.addColorStop(1, "rgba(0,0,0,.4)");
    ctx.fillStyle = darkBase;
    ctx.fillRect(0, 0, textureSize, textureSize);
    for (let traceIndex = 0; traceIndex < 90; traceIndex++) {
      let x = Math.random() * textureSize;
      let y = Math.random() * textureSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let segment = 0; segment < 4; segment++) {
        if (Math.random() > 0.5)
          x += (Math.random() > 0.5 ? 1 : -1) * (24 + Math.random() * 90);
        else y += (Math.random() > 0.5 ? 1 : -1) * (24 + Math.random() * 90);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = detailColor;
      ctx.globalAlpha = 0.24 + Math.random() * 0.38;
      ctx.lineWidth = 1.5 + Math.random() * 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fillStyle = detailColor;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  const finishTexture = new THREE.CanvasTexture(textureCanvas);
  finishTexture.encoding = THREE.sRGBEncoding;
  finishTexture.wrapS = finishTexture.wrapT = THREE.RepeatWrapping;
  finishTexture.anisotropy = Math.min(
    16,
    webGLRenderer.capabilities.getMaxAnisotropy(),
  );
  return finishTexture;
}

function createSkinMaterial({
  color,
  finish = "ceramic",
  roughness = 0.22,
  metalness = 0.12,
  clearcoat = 0.9,
  clearcoatRoughness = 0.16,
  veinColor = "#ffffff",
  emissive = "#000000",
  emissiveIntensity = 0,
}) {
  const materialTexture =
    finish === "marble"
      ? createMarbleTexture(color, veinColor)
      : ["obsidian", "jade", "chrome", "bronze", "neon"].includes(finish)
        ? createFinishTexture(color, veinColor, finish)
        : null;

  const material = new THREE.MeshPhysicalMaterial({
    color: materialTexture ? 0xffffff : color,
    map: materialTexture,
    bumpMap: materialTexture,
    bumpScale: materialTexture ? 0.025 : 0,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness,
    envMapIntensity: ["metal", "chrome"].includes(finish)
      ? 1.8
      : finish === "bronze"
        ? 1.45
        : finish === "obsidian"
          ? 1.4
          : finish === "neon"
            ? 1.25
            : 1.1,
    emissive,
    emissiveIntensity,
    flatShading: false,
  });
  material.name = `${finish}-${color}`;
  return material;
}

const PIECE_SKINS = {
  wood: {
    label: "Classic Wood",
    players: [
      {
        body: WOOD_PIECE_MATERIALS[1],
        inset: WOOD_INSET_MATERIALS[1],
        accent: createSkinMaterial({
          color: "#d7a65b",
          finish: "metal",
          roughness: 0.22,
          metalness: 0.72,
        }),
      },
      {
        body: WOOD_PIECE_MATERIALS[2],
        inset: WOOD_INSET_MATERIALS[2],
        accent: createSkinMaterial({
          color: "#d7b18a",
          finish: "metal",
          roughness: 0.25,
          metalness: 0.58,
        }),
      },
    ],
  },
  obsidian: {
    label: "Obsidian",
    players: [
      {
        body: createSkinMaterial({
          color: "#201827",
          finish: "obsidian",
          veinColor: "#ae79f4",
          roughness: 0.11,
          metalness: 0.38,
          clearcoat: 1,
        }),
        inset: createSkinMaterial({
          color: "#a879e8",
          finish: "metal",
          roughness: 0.18,
          metalness: 0.74,
        }),
        accent: createSkinMaterial({
          color: "#d4adff",
          finish: "metal",
          roughness: 0.14,
          metalness: 0.62,
          emissive: "#57258a",
          emissiveIntensity: 0.22,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#30313f",
          finish: "obsidian",
          veinColor: "#a9c9f7",
          roughness: 0.13,
          metalness: 0.3,
          clearcoat: 1,
        }),
        inset: createSkinMaterial({
          color: "#34455c",
          finish: "ceramic",
          roughness: 0.18,
          metalness: 0.35,
        }),
        accent: createSkinMaterial({
          color: "#75e3f4",
          finish: "metal",
          roughness: 0.13,
          metalness: 0.55,
          emissive: "#115d73",
          emissiveIntensity: 0.25,
        }),
      },
    ],
  },
  marble: {
    label: "Imperial Marble",
    players: [
      {
        body: createSkinMaterial({
          color: "#e9e4dc",
          finish: "marble",
          veinColor: "#777b89",
          roughness: 0.2,
          metalness: 0.06,
          clearcoat: 0.95,
        }),
        inset: createSkinMaterial({
          color: "#b98743",
          finish: "metal",
          roughness: 0.22,
          metalness: 0.76,
        }),
        accent: createSkinMaterial({
          color: "#77b7b1",
          finish: "ceramic",
          roughness: 0.15,
          clearcoat: 1,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#242b39",
          finish: "marble",
          veinColor: "#a6afc5",
          roughness: 0.18,
          metalness: 0.22,
          clearcoat: 0.95,
        }),
        inset: createSkinMaterial({
          color: "#c58d62",
          finish: "metal",
          roughness: 0.2,
          metalness: 0.72,
        }),
        accent: createSkinMaterial({
          color: "#c2d7f2",
          finish: "ceramic",
          roughness: 0.14,
          clearcoat: 1,
        }),
      },
    ],
  },
  jade: {
    label: "Imperial Jade",
    players: [
      {
        body: createSkinMaterial({
          color: "#17624f",
          finish: "jade",
          veinColor: "#8fe8b5",
          roughness: 0.16,
          metalness: 0.12,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        }),
        inset: createSkinMaterial({
          color: "#d9b766",
          finish: "metal",
          roughness: 0.2,
          metalness: 0.78,
        }),
        accent: createSkinMaterial({
          color: "#b8f2d5",
          finish: "ceramic",
          roughness: 0.14,
          clearcoat: 1,
          emissive: "#164b39",
          emissiveIntensity: 0.1,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#c9dfc9",
          finish: "jade",
          veinColor: "#387c62",
          roughness: 0.17,
          metalness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        }),
        inset: createSkinMaterial({
          color: "#1c7059",
          finish: "ceramic",
          roughness: 0.16,
          clearcoat: 1,
        }),
        accent: createSkinMaterial({
          color: "#e1c778",
          finish: "metal",
          roughness: 0.2,
          metalness: 0.72,
        }),
      },
    ],
  },
  chrome: {
    label: "Polar Chrome",
    players: [
      {
        body: createSkinMaterial({
          color: "#dbe3ed",
          finish: "chrome",
          veinColor: "#eaf7ff",
          roughness: 0.09,
          metalness: 0.98,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        }),
        inset: createSkinMaterial({
          color: "#536f91",
          finish: "metal",
          roughness: 0.16,
          metalness: 0.82,
        }),
        accent: createSkinMaterial({
          color: "#78ddff",
          finish: "metal",
          roughness: 0.12,
          metalness: 0.8,
          emissive: "#165c80",
          emissiveIntensity: 0.18,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#273447",
          finish: "chrome",
          veinColor: "#a7d7ef",
          roughness: 0.1,
          metalness: 0.96,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
        }),
        inset: createSkinMaterial({
          color: "#b8c9dc",
          finish: "metal",
          roughness: 0.16,
          metalness: 0.85,
        }),
        accent: createSkinMaterial({
          color: "#f1b56b",
          finish: "metal",
          roughness: 0.15,
          metalness: 0.72,
        }),
      },
    ],
  },
  bronze: {
    label: "Antique Bronze",
    players: [
      {
        body: createSkinMaterial({
          color: "#c69a55",
          finish: "bronze",
          veinColor: "#559c80",
          roughness: 0.28,
          metalness: 0.82,
          clearcoat: 0.8,
        }),
        inset: createSkinMaterial({
          color: "#54311f",
          finish: "ceramic",
          roughness: 0.24,
          metalness: 0.2,
        }),
        accent: createSkinMaterial({
          color: "#f0d28b",
          finish: "metal",
          roughness: 0.19,
          metalness: 0.82,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#8d4933",
          finish: "bronze",
          veinColor: "#83bea2",
          roughness: 0.3,
          metalness: 0.78,
          clearcoat: 0.8,
        }),
        inset: createSkinMaterial({
          color: "#2d2525",
          finish: "ceramic",
          roughness: 0.22,
          metalness: 0.24,
        }),
        accent: createSkinMaterial({
          color: "#76c8b0",
          finish: "metal",
          roughness: 0.18,
          metalness: 0.68,
        }),
      },
    ],
  },
  neon: {
    label: "Neon",
    players: [
      {
        body: createSkinMaterial({
          color: "#242337",
          finish: "neon",
          veinColor: "#59ffe6",
          roughness: 0.16,
          metalness: 0.3,
          clearcoat: 1,
          emissive: "#061d30",
          emissiveIntensity: 0.12,
        }),
        inset: createSkinMaterial({
          color: "#8c4cff",
          finish: "ceramic",
          roughness: 0.16,
          metalness: 0.25,
          clearcoat: 1,
          emissive: "#4e16a8",
          emissiveIntensity: 0.46,
        }),
        accent: createSkinMaterial({
          color: "#67f5e4",
          finish: "metal",
          roughness: 0.14,
          metalness: 0.5,
          emissive: "#078b8a",
          emissiveIntensity: 0.5,
        }),
      },
      {
        body: createSkinMaterial({
          color: "#172d3b",
          finish: "neon",
          veinColor: "#ff568e",
          roughness: 0.15,
          metalness: 0.36,
          clearcoat: 1,
          emissive: "#170b29",
          emissiveIntensity: 0.16,
        }),
        inset: createSkinMaterial({
          color: "#ff568e",
          finish: "ceramic",
          roughness: 0.16,
          metalness: 0.25,
          clearcoat: 1,
          emissive: "#9b153e",
          emissiveIntensity: 0.42,
        }),
        accent: createSkinMaterial({
          color: "#ffe08a",
          finish: "metal",
          roughness: 0.14,
          metalness: 0.55,
          emissive: "#9a6411",
          emissiveIntensity: 0.3,
        }),
      },
    ],
  },
};

let activeSkinId = "wood";
const getSkinMaterials = (playerNumber) =>
  PIECE_SKINS[activeSkinId].players[playerNumber - 1];

function applySkinToPiece(pieceGroup) {
  const materials = getSkinMaterials(pieceGroup.userData.pc.p);
  for (const childMesh of pieceGroup.children) {
    if (childMesh.userData.skinPart === "body")
      childMesh.material = materials.body;
    else if (childMesh.userData.skinPart === "inset")
      childMesh.material = materials.inset;
    else if (childMesh.userData.skinPart === "accent")
      childMesh.material = materials.accent;
  }
  pieceGroup.userData.skinId = activeSkinId;
}

function applySkinToAllPieces() {
  if (!PIECE_MESHES) return;
  PIECE_MESHES.forEach(applySkinToPiece);
}
const glowTexture = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d"),
    r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,.45)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const beamTexture = (() => {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d"),
    r = g.createLinearGradient(0, 0, 0, 128);
  r.addColorStop(0, "rgba(255,255,255,0)");
  r.addColorStop(1, "rgba(255,255,255,.9)");
  g.fillStyle = r;
  g.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
})();
const getTerrainSurfaceHeight = (r, c) =>
    BOARD_BASE_HEIGHT + TERRAIN_HEIGHTS[r][c] * TERRAIN_HEIGHT_SCALE,
  getBoardPosition = (r, c) =>
    new THREE.Vector3(
      c - BOARD_CENTER_OFFSET,
      getTerrainSurfaceHeight(r, c),
      r - BOARD_CENTER_OFFSET,
    );

function sampleTerrainSurfaceHeight(rowPosition, columnPosition) {
  const clampedRow = Math.max(0, Math.min(BOARD_SIZE - 1, rowPosition));
  const clampedColumn = Math.max(0, Math.min(BOARD_SIZE - 1, columnPosition));
  const upperRow = Math.floor(clampedRow);
  const leftColumn = Math.floor(clampedColumn);
  const lowerRow = Math.min(BOARD_SIZE - 1, upperRow + 1);
  const rightColumn = Math.min(BOARD_SIZE - 1, leftColumn + 1);
  const rowBlend = clampedRow - upperRow;
  const columnBlend = clampedColumn - leftColumn;

  const upperHeight =
    TERRAIN_HEIGHTS[upperRow][leftColumn] * (1 - columnBlend) +
    TERRAIN_HEIGHTS[upperRow][rightColumn] * columnBlend;
  const lowerHeight =
    TERRAIN_HEIGHTS[lowerRow][leftColumn] * (1 - columnBlend) +
    TERRAIN_HEIGHTS[lowerRow][rightColumn] * columnBlend;

  return (
    BOARD_BASE_HEIGHT +
    (upperHeight * (1 - rowBlend) + lowerHeight * rowBlend) *
      TERRAIN_HEIGHT_SCALE
  );
}

/* ---------- pieces ---------- */
const interpolatePoint = (p, q, t) => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];
function createRoundedPolygonShape(n, Rd, rr, rot) {
  const pt = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    pt.push([Math.cos(a) * Rd, Math.sin(a) * Rd]);
  }
  const s = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const p = pt[i],
      a = interpolatePoint(p, pt[(i + n - 1) % n], rr),
      b = interpolatePoint(p, pt[(i + 1) % n], rr);
    i ? s.lineTo(a[0], a[1]) : s.moveTo(a[0], a[1]);
    s.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  }
  s.closePath();
  return s;
}
function smoothGeometryNormals(geometry) {
  geometry.computeVertexNormals();

  const positionAttribute = geometry.attributes.position;
  const normalAttribute = geometry.attributes.normal;
  const accumulatedNormals = new Map();
  const vertexKeys = new Array(positionAttribute.count);

  for (
    let vertexIndex = 0;
    vertexIndex < positionAttribute.count;
    vertexIndex++
  ) {
    const coordinateKey =
      `${Math.round(positionAttribute.getX(vertexIndex) * 10000)},` +
      `${Math.round(positionAttribute.getY(vertexIndex) * 10000)},` +
      `${Math.round(positionAttribute.getZ(vertexIndex) * 10000)}`;
    vertexKeys[vertexIndex] = coordinateKey;

    let summedNormal = accumulatedNormals.get(coordinateKey);
    if (!summedNormal) {
      summedNormal = [0, 0, 0];
      accumulatedNormals.set(coordinateKey, summedNormal);
    }

    summedNormal[0] += normalAttribute.getX(vertexIndex);
    summedNormal[1] += normalAttribute.getY(vertexIndex);
    summedNormal[2] += normalAttribute.getZ(vertexIndex);
  }

  for (
    let vertexIndex = 0;
    vertexIndex < positionAttribute.count;
    vertexIndex++
  ) {
    const summedNormal = accumulatedNormals.get(vertexKeys[vertexIndex]);
    const normalLength =
      Math.hypot(summedNormal[0], summedNormal[1], summedNormal[2]) || 1;

    normalAttribute.setXYZ(
      vertexIndex,
      summedNormal[0] / normalLength,
      summedNormal[1] / normalLength,
      summedNormal[2] / normalLength,
    );
  }

  normalAttribute.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

const createExtrudedGeometry = (s, h, b) => {
  const g = new THREE.ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 10,
    curveSegments: 32,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, b, 0);
  return smoothGeometryNormals(g);
};
const PIECE_SHAPE_SPECIFICATIONS = {
    e: {
      sideCount: 5,
      footprintRadius: 0.27,
      pieceHeight: 0.62,
      rotationOffset: Math.PI / 2,
    },
    v: {
      sideCount: 4,
      footprintRadius: 0.31,
      pieceHeight: 0.82,
      rotationOffset: Math.PI / 4,
    },
    s: {
      sideCount: 3,
      footprintRadius: 0.38,
      pieceHeight: 1.02,
      rotationOffset: Math.PI / 2,
    },
  },
  basePieceGeometries = {},
  insetPieceGeometries = {};
for (const pieceType in PIECE_SHAPE_SPECIFICATIONS) {
  const specification = PIECE_SHAPE_SPECIFICATIONS[pieceType];
  const baseGeometry = createExtrudedGeometry(
    createRoundedPolygonShape(
      specification.sideCount,
      specification.footprintRadius,
      0.26,
      specification.rotationOffset,
    ),
    specification.pieceHeight,
    0.05,
  );
  const positionAttribute = baseGeometry.attributes.position;
  const totalPieceHeight = specification.pieceHeight + 0.1;

  for (
    let vertexIndex = 0;
    vertexIndex < positionAttribute.count;
    vertexIndex++
  ) {
    const taperFactor =
      1 -
      0.45 *
        Math.min(
          1,
          Math.max(0, positionAttribute.getY(vertexIndex) / totalPieceHeight),
        );
    positionAttribute.setX(
      vertexIndex,
      positionAttribute.getX(vertexIndex) * taperFactor,
    );
    positionAttribute.setZ(
      vertexIndex,
      positionAttribute.getZ(vertexIndex) * taperFactor,
    );
  }

  smoothGeometryNormals(baseGeometry);
  basePieceGeometries[pieceType] = baseGeometry;
  insetPieceGeometries[pieceType] = createExtrudedGeometry(
    createRoundedPolygonShape(
      specification.sideCount,
      specification.footprintRadius * 0.3,
      0.32,
      specification.rotationOffset,
    ),
    0.02,
    0.015,
  );
}
const strengthMarkerGeometry = new THREE.SphereGeometry(0.034, 32, 20);
const topTrimRingGeometries = Object.fromEntries(
  Object.entries(PIECE_SHAPE_SPECIFICATIONS).map(
    ([pieceType, specification]) => [
      pieceType,
      new THREE.TorusGeometry(
        specification.footprintRadius * 0.4,
        0.012,
        10,
        48,
      ),
    ],
  ),
);
function createPieceMesh(pc) {
  const shapeSpecification = PIECE_SHAPE_SPECIFICATIONS[pc.t];
  const materials = getSkinMaterials(pc.p);
  const pieceGroup = new THREE.Group();
  const bodyMesh = new THREE.Mesh(basePieceGeometries[pc.t], materials.body);
  bodyMesh.userData.skinPart = "body";
  bodyMesh.castShadow = bodyMesh.receiveShadow = true;
  pieceGroup.add(bodyMesh);

  const insetMesh = new THREE.Mesh(insetPieceGeometries[pc.t], materials.inset);
  insetMesh.userData.skinPart = "inset";
  insetMesh.position.y = shapeSpecification.pieceHeight + 0.1 - 0.015;
  insetMesh.castShadow = insetMesh.receiveShadow = true;
  pieceGroup.add(insetMesh);

  const darkNaturalMaterial = createSkinMaterial({
    color: "#1a1d24",
    finish: "metal",
    roughness: 0.35,
    metalness: 0.85,
    clearcoat: 0.3,
  });

  const topTrimRing = new THREE.Mesh(
    topTrimRingGeometries[pc.t],
    darkNaturalMaterial,
  );
  topTrimRing.rotation.x = Math.PI / 2;
  topTrimRing.position.y = shapeSpecification.pieceHeight + 0.105;
  topTrimRing.userData.skinPart = "accent";
  topTrimRing.castShadow = true;
  topTrimRing.receiveShadow = true;
  pieceGroup.add(topTrimRing);

  for (let markerIndex = 0; markerIndex < PIECE_STRENGTH[pc.t]; markerIndex++) {
    const strengthMarker = new THREE.Mesh(
      strengthMarkerGeometry,
      darkNaturalMaterial,
    );
    strengthMarker.userData.skinPart = "accent";
    strengthMarker.position.set(
      (markerIndex - (PIECE_STRENGTH[pc.t] - 1) / 2) * 0.08,
      shapeSpecification.pieceHeight + 0.14,
      0,
    );
    strengthMarker.castShadow = true;
    pieceGroup.add(strengthMarker);
  }

  pieceGroup.userData = {
    pc,
    lift: 0,
    anim: true,
    yaw: pc.p == 2 ? Math.PI : 0,
    skinId: activeSkinId,
  };
  pieceGroup.rotation.y = pieceGroup.userData.yaw;
  return pieceGroup;
}

/* ---------- effects (object pools) ---------- */
const createEffectPool = (n, f) =>
  Array.from({ length: n }, () => {
    const o = f();
    o.visible = false;
    o.userData = {};
    gameScene.add(o);
    return o;
  });
const sparkleEffectsPool = createEffectPool(
  90,
  () =>
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
);
const captureDebrisPool = createEffectPool(70, () => {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.05, 0.14),
    WOOD_PIECE_MATERIALS[1],
  );
  return m;
});
const shockwaveEffectsPool = createEffectPool(
  6,
  () =>
    new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.32, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xffc070,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
);
const moveDestinationMarkers = createEffectPool(
  64,
  () =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
);
const exitBeaconEffects = createEffectPool(
  10,
  () =>
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 3, 20, 1, true),
      new THREE.MeshBasicMaterial({
        map: beamTexture,
        color: 0x78e070,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    ),
);
const randomOffset = (a = 1) => (Math.random() - 0.5) * a;
function emitSparkEffect(p, v, max, s, o, g = 0, gr = 1, col = 0xffc070) {
  const x = sparkleEffectsPool.find((q) => !q.visible);
  if (!x) return;
  x.visible = true;
  x.position.copy(p);
  x.material.color.setHex(col);
  Object.assign(x.userData, { v, life: 0, max, s, o, g, gr });
  x.scale.setScalar(s);
}
function emitLandingDust(p, n = 9, sp = 1.4) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.28;
    emitSparkEffect(
      new THREE.Vector3(p.x, p.y + 0.08, p.z),
      new THREE.Vector3(
        Math.cos(a) * sp * (0.5 + Math.random()),
        0.3 + Math.random() * 0.6,
        Math.sin(a) * sp * (0.5 + Math.random()),
      ),
      0.7,
      0.5,
      0.35,
      -0.6,
      1.8,
      0xd9b98a,
    );
  }
}
function emitCaptureBurst(p, mat, n = 24) {
  for (let i = 0; i < n; i++) {
    const c = captureDebrisPool.find((q) => !q.visible);
    if (!c) return;
    c.visible = true;
    c.material = mat;
    c.position.set(
      p.x + randomOffset(0.4),
      p.y + 0.3 + Math.random() * 0.3,
      p.z + randomOffset(0.4),
    );
    Object.assign(c.userData, {
      v: new THREE.Vector3(
        randomOffset(5),
        2 + Math.random() * 3.5,
        randomOffset(5),
      ),
      w: Math.random() * 14,
      life: 0,
      max: 1.3 + Math.random(),
    });
    c.scale.setScalar(1);
  }
}
function emitShockwave(p, col = 0xffc070) {
  activeShockwaves.push({ x: p.x, z: p.z, t: performance.now() });
  const r = shockwaveEffectsPool.find((q) => !q.visible);
  if (!r) return;
  r.visible = true;
  r.position.set(p.x, p.y + 0.03, p.z);
  r.material.color.setHex(col);
  r.userData = { life: 0 };
}
function updateVisualEffects(dt) {
  for (const s of sparkleEffectsPool)
    if (s.visible) {
      const u = s.userData;
      u.life += dt;
      const k = u.life / u.max;
      if (k >= 1) {
        s.visible = false;
        continue;
      }
      s.position.addScaledVector(u.v, dt);
      u.v.y -= u.g * dt;
      s.material.opacity = (1 - k) * u.o;
      s.scale.setScalar(u.s * (1 + k * u.gr));
    }
  for (const c of captureDebrisPool)
    if (c.visible) {
      const u = c.userData;
      u.life += dt;
      if (u.life > u.max) {
        c.visible = false;
        continue;
      }
      c.position.addScaledVector(u.v, dt);
      u.v.y -= 10 * dt;
      if (c.position.y < 0.32) {
        c.position.y = 0.32;
        u.v.multiplyScalar(0.35);
        u.v.y = Math.abs(u.v.y) * 0.4;
      }
      c.rotation.x += u.w * dt;
      c.rotation.z += u.w * dt * 0.7;
      const k = u.life / u.max;
      c.scale.setScalar(k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1);
    }
  for (const r of shockwaveEffectsPool)
    if (r.visible) {
      const u = r.userData;
      u.life += dt;
      const k = u.life / 0.7;
      if (k >= 1) {
        r.visible = false;
        continue;
      }
      r.scale.setScalar(1 + k * 4.5);
      r.material.opacity = (1 - k) * 0.8;
    }
}

/* ---------- audio (procedural wood-like synthesis) ---------- */
let ac,
  audioBus,
  noiseBuffer,
  isMuted = false,
  audioEnabledByUser = false;
function A() {
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ac.createDynamicsCompressor(),
    g = ac.createGain();
  g.gain.value = 0.9;
  audioBus = ac.createGain();
  audioBus.connect(comp);
  const d = ac.createDelay(),
    fb = ac.createGain(),
    lp = ac.createBiquadFilter(),
    wet = ac.createGain();
  d.delayTime.value = 0.075;
  fb.gain.value = 0.32;
  lp.frequency.value = 2200;
  wet.gain.value = 0.28;
  audioBus.connect(d);
  d.connect(lp);
  lp.connect(fb);
  fb.connect(d);
  lp.connect(wet);
  wet.connect(comp);
  comp.connect(g);
  g.connect(ac.destination);
  noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const n = noiseBuffer.getChannelData(0);
  for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;
  return ac;
}
function playWoodenImpactSound(f, v = 0.5, dec = 0.14, delay = 0) {
  if (isMuted || !audioEnabledByUser) return;
  try {
    const a = A();
    if (a.state == "suspended") a.resume();
    const t = a.currentTime + delay;
    [
      [1, 1],
      [2.76, 0.5],
      [5.4, 0.27],
      [8.9, 0.1],
    ].forEach(([r, w], i) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.frequency.value = f * r * (1 + randomOffset(0.03));
      g.gain.setValueAtTime(v * w, t);
      g.gain.exponentialRampToValueAtTime(0.0007, t + dec / (1 + i * 0.8));
      o.connect(g);
      g.connect(audioBus);
      o.start(t);
      o.stop(t + dec + 0.05);
    });
    const s = a.createBufferSource(),
      bp = a.createBiquadFilter(),
      g = a.createGain();
    s.buffer = noiseBuffer;
    bp.type = "bandpass";
    bp.frequency.value = f * 5;
    bp.Q.value = 0.9;
    g.gain.setValueAtTime(v * 0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    s.connect(bp);
    bp.connect(g);
    g.connect(audioBus);
    s.start(t, Math.random() * 0.5, 0.06);
  } catch (e) {}
}
function playPieceGlideSound(dur, v = 0.1) {
  if (isMuted || !audioEnabledByUser) return;
  try {
    const a = A(),
      t = a.currentTime,
      s = a.createBufferSource(),
      bp = a.createBiquadFilter(),
      g = a.createGain();
    s.buffer = noiseBuffer;
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(1800, t + dur * 0.6);
    bp.frequency.exponentialRampToValueAtTime(700, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + dur * 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(bp);
    bp.connect(g);
    g.connect(audioBus);
    s.start(t, Math.random() * 0.4, dur + 0.05);
  } catch (e) {}
}
const playLandingSound = () => {
    playWoodenImpactSound(140 + Math.random() * 30, 0.6, 0.17);
    playWoodenImpactSound(430, 0.18, 0.06);
  },
  playSelectionSound = () => playWoodenImpactSound(780, 0.16, 0.06),
  playCaptureSound = () => {
    playWoodenImpactSound(95, 0.95, 0.24);
    playWoodenImpactSound(170, 0.6, 0.16, 0.05);
    for (let i = 0; i < 6; i++)
      playWoodenImpactSound(
        700 + Math.random() * 900,
        0.13,
        0.05,
        0.08 + Math.random() * 0.3,
      );
  },
  playExitSound = () =>
    [784, 988, 1318].forEach((f, i) =>
      playWoodenImpactSound(f, 0.22, 0.55, i * 0.1),
    );

/* ---------- animation ---------- */
const activeAnimations = [],
  ease = (p) => p * p * (3 - 2 * p),
  animateTween = (d, u, e, delay = 0) =>
    activeAnimations.push({ t: performance.now() + delay, d, u, e }),
  bounce = (p) => {
    const n = 7.5625,
      d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  };
const cameraLookTarget = new THREE.Vector3(0, 0.4, 0),
  cameraFocusTarget = new THREE.Vector3(0, 0.4, 0);
let activeShockwaves = [],
  nextTerrainGlowUpdate = 0,
  cameraShakeAmount = 0,
  currentCameraAzimuth = 0,
  currentCameraPolarAngle = 0.88,
  targetCameraAzimuth = 0,
  targetCameraPolarAngle = 0.88,
  cameraDistance = 30,
  targetCameraDistance = 16,
  pointerDragState = null,
  visibleMoveMarkers = [],
  visibleExitBeams = [],
  highlightedTileMeshes = [];

function generateTerrainHeightMap() {
  const g = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => Math.random() * 3.4),
  );
  const h = Array.from({ length: BOARD_SIZE }, (_, r) =>
    Array.from({ length: BOARD_SIZE }, (_, c) => {
      const x = (c / (BOARD_SIZE - 1)) * 4,
        y = (r / (BOARD_SIZE - 1)) * 4,
        i = Math.min(3, x | 0),
        j = Math.min(3, y | 0),
        fx = x - i,
        fy = y - j;
      return Math.round(
        g[j][i] * (1 - fx) * (1 - fy) +
          g[j][i + 1] * fx * (1 - fy) +
          g[j + 1][i] * (1 - fx) * fy +
          g[j + 1][i + 1] * fx * fy,
      );
    }),
  );
  for (let r = 0; r < BOARD_SIZE / 2; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      h[BOARD_SIZE - 1 - r][BOARD_SIZE - 1 - c] = h[r][c];
  return h;
}
const sharedTerrainTileGeometry = new THREE.BoxGeometry(0.97, 1, 0.97);

function disposeGameWorldResources(gameWorldGroup) {
  gameWorldGroup.traverse((object) => {
    if (!object.isMesh) return;

    if (object.userData.disposeGeometry && object.geometry) {
      object.geometry.dispose();
    }

    if (object.userData.disposeMaterial && object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

function buildGameWorld() {
  if (GAME_WORLD) {
    gameScene.remove(GAME_WORLD);
    disposeGameWorldResources(GAME_WORLD);
  }
  GAME_WORLD = new THREE.Group();
  gameScene.add(GAME_WORLD);
  const tb = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: TABLE_SURFACE_TEXTURE,
      bumpMap: TABLE_SURFACE_TEXTURE,
      bumpScale: 0.5,
      roughness: 0.6,
      envMapIntensity: 0.3,
    }),
  );
  tb.receiveShadow = true;
  tb.userData.disposeGeometry = true;
  tb.userData.disposeMaterial = true;
  GAME_WORLD.add(tb);
  const fr = new THREE.Mesh(
    new THREE.BoxGeometry(
      BOARD_SIZE + 0.7,
      BOARD_BASE_HEIGHT - 0.04,
      BOARD_SIZE + 0.7,
    ),
    new THREE.MeshStandardMaterial({
      map: BOARD_FRAME_TEXTURE,
      bumpMap: BOARD_FRAME_TEXTURE,
      bumpScale: 0.5,
      roughness: 0.45,
      envMapIntensity: 0.5,
    }),
  );
  fr.position.y = (BOARD_BASE_HEIGHT - 0.04) / 2 + 0.002;
  fr.castShadow = fr.receiveShadow = true;
  fr.userData.disposeGeometry = true;
  fr.userData.disposeMaterial = true;
  GAME_WORLD.add(fr);
  TERRAIN_TILE_MESHES = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    TERRAIN_TILE_MESHES.push([]);
    for (let c = 0; c < BOARD_SIZE; c++) {
      const t = TERRAIN_CELL_TEXTURES[(r * 7 + c * 3) % 3],
        hh = TERRAIN_HEIGHTS[r][c] * TERRAIN_HEIGHT_SCALE + 0.04,
        m = new THREE.Mesh(
          new THREE.BoxGeometry(0.97, hh, 0.97),
          new THREE.MeshStandardMaterial({
            map: t,
            bumpMap: t,
            bumpScale: 0.5,
            roughness: 0.5,
            envMapIntensity: 0.45,
            emissive: 0x8a5a20,
            emissiveIntensity: 0,
            color: new THREE.Color().setHSL(
              0.085,
              0.55,
              0.5 + TERRAIN_HEIGHTS[r][c] * 0.07 + ((r + c) % 2 ? 0 : 0.05),
            ),
          }),
        );
      m.position.set(
        c - BOARD_CENTER_OFFSET,
        BOARD_BASE_HEIGHT - 0.04 + hh / 2,
        r - BOARD_CENTER_OFFSET,
      );
      m.castShadow = m.receiveShadow = true;
      m.userData.base = m.material.color.clone();
      m.userData.disposeMaterial = true;
      m.scale.y = 0.001 * hh;
      animateTween(
        700,
        (p) => {
          const e = Math.max(0.001, bounce(p));
          m.scale.y = hh * e;
          m.position.y = BOARD_BASE_HEIGHT - 0.04 + (hh * e) / 2;
        },
        () => {
          m.scale.y = hh;
          m.position.y = BOARD_BASE_HEIGHT - 0.04 + hh / 2;
        },
        Math.hypot(r - BOARD_CENTER_OFFSET, c - BOARD_CENTER_OFFSET) * 70,
      );
      GAME_WORLD.add(m);
      TERRAIN_TILE_MESHES[r].push(m);
    }
  }
  PIECE_MESHES = [];
  PIECES.forEach((pc) => {
    const g = createPieceMesh(pc),
      p = getBoardPosition(pc.r, pc.c);
    g.position.copy(p);
    g.visible = false;
    GAME_WORLD.add(g);
    PIECE_MESHES.push(g);
    animateTween(
      900,
      (t) => {
        g.visible = true;
        g.position.y = p.y + 9 * (1 - bounce(t));
      },
      () => {
        g.userData.anim = false;
        playLandingSound();
        emitLandingDust(p, 6, 0.9);
      },
      700 + pc.i * 70,
    );
  });
}
function initializeGame() {
  activeAnimations.length = 0;
  clearMoveHighlights();
  TERRAIN_HEIGHTS = generateTerrainHeightMap();
  PIECES = [];
  for (const p of [1, 2])
    for (const [t, c] of STARTING_PIECE_SETUP)
      PIECES.push({
        i: PIECES.length,
        t,
        p,
        r: p == 1 ? BOARD_SIZE - 1 : 0,
        c,
        on: true,
      });
  GAME_STATE = {
    scores: [0, 0],
    piecesExited: 0,
    firstExitOccurred: 0,
    isGameOver: 0,
    winningPlayer: null,
  };
  ACTIVE_PLAYER = 1;
  IS_ANIMATING = true;
  SELECTED_PIECE = null;
  COMPLETED_MOVE_COUNT = 0;
  targetCameraAzimuth = 0;
  buildGameWorld();
  setTimeout(() => (IS_ANIMATING = false), 2400);
  updateGameHud();
}
function updateGameHud() {
  const t = window.traversalTranslate || ((key) => key);
  const sideName = ACTIVE_PLAYER == 1 ? t("game.light") : t("game.dark");
  const status = GAME_STATE.isGameOver
    ? GAME_STATE.winningPlayer == 0
      ? t("game.draw")
      : GAME_MODE == 2
        ? t("game.playerWins", { player: GAME_STATE.winningPlayer })
        : GAME_STATE.winningPlayer == 1
          ? t("game.victory")
          : t("game.defeat")
    : GAME_MODE == 2
      ? `${t("game.playerTurn", { player: ACTIVE_PLAYER, side: sideName })}`
      : ACTIVE_PLAYER == 1
        ? t("game.yourTurn")
        : t("game.botThinking");
  getElement("game-status").textContent = status;
  getElement("game-score").textContent =
    `${t("game.light")} ${GAME_STATE.scores[0]} · ${t("game.dark")} ${GAME_STATE.scores[1]} · ${t("game.move")} ${COMPLETED_MOVE_COUNT}/200`;
}

function updateGameControlsLanguage() {
  const t = window.traversalTranslate || ((key) => key);
  const modeButton = getElement("game-mode-button");
  const soundButton = getElement("sound-toggle-button");
  const header = (key) => t(`rules.header.${key}`);
  if (modeButton) {
    const label = GAME_MODE == 1 ? header("modePlayers") : header("modeBot");
    modeButton.setAttribute("aria-label", label);
    modeButton.title = label;
  }
  if (soundButton) {
    const label = isMuted ? header("soundOff") : header("soundOn");
    soundButton.setAttribute("aria-label", label);
    soundButton.title = label;
  }
}

function updateSelectedPieceLanguage() {
  if (!SELECTED_PIECE) return;
  const t = window.traversalTranslate || ((key) => key);
  getElement("piece-info").textContent = t("game.pieceInfo", {
    piece: t(`game.pieces.${SELECTED_PIECE.t}`),
    movement: PIECE_MOVEMENT_RANGE[SELECTED_PIECE.t],
    strength: PIECE_STRENGTH[SELECTED_PIECE.t],
  });
}
function clearMoveHighlights() {
  visibleMoveMarkers.forEach((p) => (p.visible = false));
  visibleExitBeams.forEach((b) => (b.visible = false));
  highlightedTileMeshes.forEach((m) => {
    m.userData.lit = 0;
    m.material.emissive.setHex(0x8a5a20);
    m.material.emissiveIntensity = 0;
  });
  visibleMoveMarkers = [];
  visibleExitBeams = [];
  highlightedTileMeshes = [];
  TERRAIN_TILE_MESHES &&
    TERRAIN_TILE_MESHES.forEach((rw) =>
      rw.forEach((m) => m.material.color.copy(m.userData.base)),
    );
}
function selectGamePiece(pc) {
  clearMoveHighlights();
  if (SELECTED_PIECE == pc) {
    SELECTED_PIECE = null;
    getElement("piece-info").textContent = "";
    return;
  }
  SELECTED_PIECE = pc;
  playSelectionSound();
  const t = window.traversalTranslate || ((key) => key);
  getElement("piece-info").textContent = t("game.pieceInfo", {
    piece: t(`game.pieces.${pc.t}`),
    movement: PIECE_MOVEMENT_RANGE[pc.t],
    strength: PIECE_STRENGTH[pc.t],
  });
  for (const m of generateLegalMoves(PIECES, pc)) {
    const pad = moveDestinationMarkers.find((q) => !q.visible);
    if (!pad) break;
    pad.visible = true;
    pad.userData.m = m;
    visibleMoveMarkers.push(pad);
    if (m.exit) {
      pad.position.set(
        m.c - BOARD_CENTER_OFFSET,
        BOARD_BASE_HEIGHT + 0.04,
        m.r - BOARD_CENTER_OFFSET,
      );
      pad.scale.setScalar(1.5);
      pad.material.color.setHex(0x78e070);
      const b = exitBeaconEffects.find((q) => !q.visible);
      if (b) {
        b.visible = true;
        b.position.set(
          m.c - BOARD_CENTER_OFFSET,
          BOARD_BASE_HEIGHT + 1.5,
          m.r - BOARD_CENTER_OFFSET,
        );
        visibleExitBeams.push(b);
      }
    } else {
      const q = getBoardPosition(m.r, m.c),
        cm = TERRAIN_TILE_MESHES[m.r][m.c];
      pad.position.set(q.x, q.y + 0.012, q.z);
      pad.scale.setScalar(1.15);
      pad.material.color.setHex(m.atk ? 0xff4a2e : 0xffb050);
      cm.material.emissive.setHex(m.atk ? 0xa02a14 : 0x9a6418);
      cm.userData.lit = 1;
      highlightedTileMeshes.push(cm);
    }
  }
  TERRAIN_TILE_MESHES.forEach((rw) =>
    rw.forEach((m) =>
      m.material.color
        .copy(m.userData.base)
        .multiplyScalar(m.userData.lit ? 1.35 : 0.36),
    ),
  );
}
function animatePieceMove(pc, m, cb) {
  IS_ANIMATING = true;

  const movingPiece = PIECE_MESHES[pc.i];
  const capturedPiece = m.atk ? PIECE_MESHES[m.atk.i] : null;

  clearMoveHighlights();
  SELECTED_PIECE = null;
  getElement("piece-info").textContent = "";
  movingPiece.userData.anim = true;

  const startPosition = movingPiece.position.clone();
  const targetX = m.c - BOARD_CENTER_OFFSET;
  const targetZ = m.r - BOARD_CENTER_OFFSET;
  const horizontalDistance = Math.hypot(
    targetX - startPosition.x,
    targetZ - startPosition.z,
  );
  const travelDuration = Math.max(220, 190 + horizontalDistance * 90);
  const sourceSurfaceHeight = getTerrainSurfaceHeight(pc.r, pc.c);
  const targetPosition = m.exit
    ? new THREE.Vector3(targetX, sourceSurfaceHeight, targetZ)
    : getBoardPosition(m.r, m.c);
  const horizontalDeltaX = targetX - startPosition.x;
  const horizontalDeltaZ = targetZ - startPosition.z;
  const originalRotationY = movingPiece.userData.yaw;
  const startingLiftOffset = Math.max(
    0,
    startPosition.y - getTerrainSurfaceHeight(pc.r, pc.c),
  );

  applyMoveToState(PIECES, pc, m, GAME_STATE);
  cameraFocusTarget.set(
    (startPosition.x + targetPosition.x) * 0.3,
    0.4,
    (startPosition.z + targetPosition.z) * 0.3,
  );

  playPieceGlideSound(travelDuration / 1000, 0.08);

  animateTween(
    travelDuration,
    (progress) => {
      const easedProgress = ease(progress);
      const currentX = startPosition.x + horizontalDeltaX * easedProgress;
      const currentZ = startPosition.z + horizontalDeltaZ * easedProgress;
      const terrainSurfaceHeight = m.exit
        ? sourceSurfaceHeight
        : sampleTerrainSurfaceHeight(
            currentZ + BOARD_CENTER_OFFSET,
            currentX + BOARD_CENTER_OFFSET,
          );
      const currentSurfaceHeight =
        terrainSurfaceHeight + startingLiftOffset * (1 - easedProgress);

      movingPiece.position.set(currentX, currentSurfaceHeight, currentZ);
      movingPiece.rotation.set(0, originalRotationY, 0);
      movingPiece.scale.setScalar(1);

      if (Math.random() < 0.09) {
        emitSparkEffect(
          movingPiece.position.clone().setY(currentSurfaceHeight + 0.12),
          new THREE.Vector3(
            randomOffset(0.18),
            randomOffset(0.08),
            randomOffset(0.18),
          ),
          0.32,
          0.2,
          0.25,
          0,
          0.8,
        );
      }
    },
    () => {
      movingPiece.position.copy(targetPosition);
      movingPiece.rotation.set(0, originalRotationY, 0);
      movingPiece.scale.setScalar(1);

      if (m.exit) {
        playExitSound();
        emitShockwave(targetPosition, 0x78e070);

        animateTween(
          750,
          (progress) => {
            const easedProgress = ease(progress);
            movingPiece.position.y = targetPosition.y + easedProgress * 3.2;
            movingPiece.rotation.y = originalRotationY + progress * 8;
            movingPiece.scale.setScalar(1 - easedProgress);

            if (Math.random() < 0.45) {
              emitSparkEffect(
                movingPiece.position.clone(),
                new THREE.Vector3(
                  randomOffset(1.2),
                  0.5 + Math.random(),
                  randomOffset(1.2),
                ),
                0.8,
                0.4,
                0.7,
                0,
                1,
                0xa8ff98,
              );
            }
          },
          () => {
            movingPiece.visible = false;
            movingPiece.scale.setScalar(1);
            movingPiece.userData.anim = false;
            cameraFocusTarget.set(0, 0.4, 0);
            cb();
          },
        );

        return;
      }

      playLandingSound();
      emitLandingDust(targetPosition, 7, 0.9);
      emitShockwave(targetPosition, capturedPiece ? 0xff4a2e : 0xffc070);
      cameraShakeAmount = 0.1;

      if (capturedPiece) {
        playCaptureSound();
        emitCaptureBurst(
          capturedPiece.position,
          getSkinMaterials(capturedPiece.userData.pc.p).body,
          18,
        );
        capturedPiece.visible = false;
        cameraShakeAmount = 0.38;

        for (let particleIndex = 0; particleIndex < 10; particleIndex++) {
          emitSparkEffect(
            targetPosition.clone().setY(targetPosition.y + 0.35),
            new THREE.Vector3(
              randomOffset(3.2),
              0.8 + Math.random() * 2.4,
              randomOffset(3.2),
            ),
            0.62,
            0.3,
            0.8,
            4.5,
            1,
            0xff7a40,
          );
        }
      }

      movingPiece.userData.anim = false;
      cameraFocusTarget.set(0, 0.4, 0);
      cb();
    },
  );
}

function finishTurn() {
  if (GAME_STATE.isGameOver || ++COMPLETED_MOVE_COUNT >= 200) {
    if (!GAME_STATE.isGameOver) resolveMoveLimit();
    finishGame();
    return;
  }
  ACTIVE_PLAYER = 3 - ACTIVE_PLAYER;
  if (
    !PIECES.some(
      (x) =>
        x.on && x.p == ACTIVE_PLAYER && generateLegalMoves(PIECES, x).length,
    )
  ) {
    ACTIVE_PLAYER = 3 - ACTIVE_PLAYER;
    COMPLETED_MOVE_COUNT++;
  }
  if (GAME_MODE == 2) targetCameraAzimuth = ACTIVE_PLAYER == 1 ? 0 : Math.PI;
  IS_ANIMATING = false;
  updateGameHud();
  if (GAME_MODE == 1 && ACTIVE_PLAYER == 2) {
    IS_ANIMATING = true;
    setTimeout(runComputerTurn, 380);
  }
}
function finishGame() {
  IS_ANIMATING = true;
  updateGameHud();
  (GAME_STATE.winningPlayer == 1
    ? [523, 659, 784, 1047]
    : GAME_STATE.winningPlayer == 2
      ? [392, 330, 262]
      : [440, 440]
  ).forEach((f, i) => playWoodenImpactSound(f, 0.3, 0.6, i * 0.17));
  PIECE_MESHES.forEach((g, i) => {
    const pc = PIECES[i];
    if (pc.on && pc.p == GAME_STATE.winningPlayer) {
      g.userData.anim = true;
      const y0 = g.position.y;
      animateTween(
        650,
        (p) => {
          g.position.y = y0 + Math.sin(p * Math.PI) * 0.8;
          g.rotation.y = g.userData.yaw + p * Math.PI * 2;
          if (Math.random() < 0.5)
            emitSparkEffect(
              g.position.clone(),
              new THREE.Vector3(randomOffset(2), 1, randomOffset(2)),
              0.9,
              0.4,
              0.8,
              0,
              1,
            );
        },
        () => {
          g.userData.anim = false;
          g.rotation.y = g.userData.yaw;
          playLandingSound();
        },
        i * 140,
      );
    }
  });
}

/* ---------- interaction ---------- */
const ray = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
gameCanvas.addEventListener("pointerdown", (e) => {
  audioEnabledByUser = true;
  pointerDragState = { x: e.clientX, y: e.clientY, m: false };
  gameCanvas.setPointerCapture(e.pointerId);
});
gameCanvas.addEventListener("pointermove", (e) => {
  if (!pointerDragState) return;
  const dx = e.clientX - pointerDragState.x,
    dy = e.clientY - pointerDragState.y;
  if (Math.hypot(dx, dy) > 6) pointerDragState.m = true;
  if (pointerDragState.m) {
    targetCameraAzimuth -= dx * 0.005;
    targetCameraPolarAngle = Math.min(
      1.35,
      Math.max(0.3, targetCameraPolarAngle - dy * 0.004),
    );
    pointerDragState.x = e.clientX;
    pointerDragState.y = e.clientY;
  }
});
gameCanvas.addEventListener("pointerup", (e) => {
  const d = pointerDragState;
  pointerDragState = null;
  if (
    !d ||
    d.m ||
    IS_ANIMATING ||
    GAME_STATE.isGameOver ||
    (GAME_MODE == 1 && ACTIVE_PLAYER != 1)
  )
    return;
  const rc = gameCanvas.getBoundingClientRect();
  mouse.set(
    ((e.clientX - rc.left) / rc.width) * 2 - 1,
    (-(e.clientY - rc.top) / rc.height) * 2 + 1,
  );
  ray.setFromCamera(mouse, gameCamera);
  const hit = ray.intersectObjects(
    [
      ...visibleMoveMarkers,
      ...PIECE_MESHES.filter(
        (g) =>
          g.visible && g.userData.pc.on && g.userData.pc.p == ACTIVE_PLAYER,
      ),
    ],
    true,
  )[0];
  if (!hit) return;
  let o = hit.object;
  if (o.userData.m) {
    animatePieceMove(SELECTED_PIECE, o.userData.m, finishTurn);
    return;
  }
  while (o && !o.userData.pc) o = o.parent;
  o && selectGamePiece(o.userData.pc);
});
getElement("new-board-button").onclick = () => {
  audioEnabledByUser = true;
  initializeGame();
};
const BOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"/></svg>`;
const PLAYERS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M96 192C96 130.1 146.1 80 208 80C269.9 80 320 130.1 320 192C320 253.9 269.9 304 208 304C146.1 304 96 253.9 96 192zM32 528C32 430.8 110.8 352 208 352C305.2 352 384 430.8 384 528L384 534C384 557.2 365.2 576 342 576L74 576C50.8 576 32 557.2 32 534L32 528zM464 128C517 128 560 171 560 224C560 277 517 320 464 320C411 320 368 277 368 224C368 171 411 128 464 128zM464 368C543.5 368 608 432.5 608 512L608 534.4C608 557.4 589.4 576 566.4 576L421.6 576C428.2 563.5 432 549.2 432 534L432 528C432 476.5 414.6 429.1 385.5 391.3C408.1 376.6 435.1 368 464 368z"/></svg>`;
getElement("game-mode-button").onclick = (e) => {
  audioEnabledByUser = true;
  GAME_MODE = 3 - GAME_MODE;
  e.currentTarget.innerHTML = GAME_MODE == 1 ? BOT_SVG : PLAYERS_SVG;
  updateGameControlsLanguage();
  initializeGame();
};
getElement("sound-toggle-button").onclick = (e) => {
  isMuted = !isMuted;
  const button = e.currentTarget;
  updateGameControlsLanguage();

  if (isMuted) {
    button.innerHTML = `<svg id="sound-toggle-btn" data-state="mute" class="sound-toggle-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path fill="currentColor" d="M80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416zM399 239C389.6 248.4 389.6 263.6 399 272.9L446 319.9L399 366.9C389.6 376.3 389.6 391.5 399 400.8C408.4 410.1 423.6 410.2 432.9 400.8L479.9 353.8L526.9 400.8C536.3 410.2 551.5 410.2 560.8 400.8C570.1 391.4 570.2 376.2 560.8 366.9L513.8 319.9L560.8 272.9C570.2 263.5 570.2 248.3 560.8 239C551.4 229.7 536.2 229.6 526.9 239L479.9 286L432.9 239C423.5 229.6 408.3 229.6 399 239z"/>
      </svg>`;
  } else {
    button.innerHTML = `<svg id="sound-toggle-btn" data-state="on" class="sound-toggle-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path fill="currentColor" d="M112 416L160 416L294.1 535.2C300.5 540.9 308.7 544 317.2 544C336.4 544 352 528.4 352 509.2L352 130.8C352 111.6 336.4 96 317.2 96C308.7 96 300.5 99.1 294.1 104.8L160 224L112 224C85.5 224 64 245.5 64 272L64 368C64 394.5 85.5 416 112 416zM505.1 171C494.8 162.6 479.7 164.2 471.3 174.5C462.9 184.8 464.5 199.9 474.8 208.3C507.3 234.7 528 274.9 528 320C528 365.1 507.3 405.3 474.8 431.8C464.5 440.2 463 455.3 471.3 465.6C479.6 475.9 494.8 477.4 505.1 469.1C548.3 433.9 576 380.2 576 320.1C576 260 548.3 206.3 505.1 171.1zM444.6 245.5C434.3 237.1 419.2 238.7 410.8 249C402.4 259.3 404 274.4 414.3 282.8C425.1 291.6 432 305 432 320C432 335 425.1 348.4 414.3 357.3C404 365.7 402.5 380.8 410.8 391.1C419.1 401.4 434.3 402.9 444.6 394.6C466.1 376.9 480 350.1 480 320C480 289.9 466.1 263.1 444.5 245.5z"/>
      </svg>`;
  }
};
addEventListener("resize", resizeRenderer);

let last = performance.now(),
  ema = 16,
  fr = 0;
(function loop(now) {
  requestAnimationFrame(loop);
  if (!sceneRenderTarget || !PIECES) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  ema += (dt * 1000 - ema) * 0.05;
  if (++fr % 90 == 0) {
    if (ema > 26 && renderResolutionScale > 1.01) {
      renderResolutionScale = Math.max(1, renderResolutionScale - 0.1);
      resizeRenderer();
    } else if (
      ema < 14 &&
      renderResolutionScale < maximumRenderResolutionScale - 0.01
    ) {
      renderResolutionScale = Math.min(
        maximumRenderResolutionScale,
        renderResolutionScale + 0.1,
      );
      resizeRenderer();
    }
  }
  for (let i = activeAnimations.length - 1; i >= 0; i--) {
    const w = activeAnimations[i];
    if (now < w.t) continue;
    const p = Math.min(1, (now - w.t) / w.d);
    w.u(p);
    if (p >= 1) {
      activeAnimations.splice(i, 1);
      w.e && w.e();
    }
  }
  updateVisualEffects(dt);
  currentCameraAzimuth +=
    (targetCameraAzimuth +
      Math.sin(now * 0.0003) * 0.04 -
      currentCameraAzimuth) *
    0.08;
  currentCameraPolarAngle +=
    (targetCameraPolarAngle - currentCameraPolarAngle) * 0.08;
  cameraDistance += (targetCameraDistance - cameraDistance) * 0.05;
  cameraLookTarget.lerp(cameraFocusTarget, 0.05);
  cameraShakeAmount *= 0.9;
  gameCamera.position.set(
    cameraLookTarget.x +
      Math.sin(currentCameraPolarAngle) *
        Math.sin(currentCameraAzimuth) *
        cameraDistance +
      randomOffset(cameraShakeAmount),
    cameraLookTarget.y +
      Math.cos(currentCameraPolarAngle) * cameraDistance +
      randomOffset(cameraShakeAmount),
    cameraLookTarget.z +
      Math.sin(currentCameraPolarAngle) *
        Math.cos(currentCameraAzimuth) *
        cameraDistance +
      randomOffset(cameraShakeAmount),
  );
  gameCamera.lookAt(cameraLookTarget);
  const pu = 0.5 + 0.5 * Math.sin(now * 0.005);
  visibleMoveMarkers.forEach((p, i) => {
    p.material.opacity = 0.55 + 0.4 * Math.sin(now * 0.005 + i * 0.4);
  });
  highlightedTileMeshes.forEach(
    (m) => (m.material.emissiveIntensity = 0.7 + 0.6 * pu),
  );
  visibleExitBeams.forEach((b) => (b.material.opacity = 0.5 + 0.3 * pu));
  let tl = 0;
  if (now >= nextTerrainGlowUpdate) {
    nextTerrainGlowUpdate = now + 40;

    if (TERRAIN_TILE_MESHES) {
      for (let rowIndex = 0; rowIndex < BOARD_SIZE; rowIndex++) {
        for (let columnIndex = 0; columnIndex < BOARD_SIZE; columnIndex++) {
          const tileMesh = TERRAIN_TILE_MESHES[rowIndex][columnIndex];
          if (tileMesh.userData.lit) continue;

          let tileGlowIntensity =
            0.1 *
            (0.5 +
              0.5 * Math.sin(now * 0.0013 + (rowIndex + columnIndex) * 0.5));

          for (const shockwave of activeShockwaves) {
            const distanceFromShockwave = Math.hypot(
                columnIndex - BOARD_CENTER_OFFSET - shockwave.x,
                rowIndex - BOARD_CENTER_OFFSET - shockwave.z,
              ),
              shockwaveProgress = (now - shockwave.t) / 900;

            tileGlowIntensity +=
              Math.max(
                0,
                1 -
                  Math.abs(distanceFromShockwave - shockwaveProgress * 9) * 0.9,
              ) *
              (1 - shockwaveProgress) *
              1.4;
          }

          tileMesh.material.emissiveIntensity = tileGlowIntensity;
        }
      }
    }
  }
  activeShockwaves = activeShockwaves.filter(
    (shockwave) => now - shockwave.t < 900,
  );
  PIECE_MESHES &&
    PIECE_MESHES.forEach((g) => {
      const u = g.userData;
      if (u.anim || !u.pc.on) return;
      const s = SELECTED_PIECE == u.pc,
        tg = s ? 0.24 + 0.03 * Math.sin(now * 0.004) : 0;
      u.lift += (tg - u.lift) * 0.15;
      g.position.y = getTerrainSurfaceHeight(u.pc.r, u.pc.c) + u.lift;
      g.rotation.y = u.yaw + (s ? Math.sin(now * 0.002) * 0.15 : 0);
      if (s) {
        tl = 1.1;
        pieceSelectionLight.position.set(
          g.position.x,
          g.position.y + 1.3,
          g.position.z,
        );
      }
    });
  pieceSelectionLight.intensity += (tl - pieceSelectionLight.intensity) * 0.15;
  postProcessingMaterial.uniforms.t.value = (now * 0.001) % 10;
  webGLRenderer.setRenderTarget(sceneRenderTarget);
  webGLRenderer.render(gameScene, gameCamera);
  webGLRenderer.setRenderTarget(null);
  postProcessingMaterial.uniforms.tD.value = sceneRenderTarget.texture;
  webGLRenderer.render(postProcessingScene, postProcessingCamera);
})(performance.now());
/* ---------- Skin modal (one isolated, on-demand preview renderer) ---------- */
const skinModal = getElement("skin-modal");
const skinGrid = getElement("skin-options-grid");
const SKIN_PREVIEW_SIZE = 144;
const SKIN_PREVIEW_FRAME_INTERVAL = 1000 / 30;
const SKIN_PREVIEW_ROTATION_SPEED = 0.16;
let skinModalOpen = false;
let skinPreviewRenderer = null;
let skinPreviewAccentMaterial = null;
let skinPreviewEnvironmentTexture = null;
let skinPreviewFrameId = 0;
let lastSkinPreviewFrame = 0;
let skinPreviewStartTime = 0;
let activeSkinPreviews = [];

function stopSkinPreviewLoop() {
  if (skinPreviewFrameId) cancelAnimationFrame(skinPreviewFrameId);
  skinPreviewFrameId = 0;
  lastSkinPreviewFrame = 0;
}

function destroySkinPreviews() {
  stopSkinPreviewLoop();
  activeSkinPreviews = [];

  if (skinPreviewRenderer) {
    skinPreviewRenderer.dispose();
    skinPreviewRenderer.forceContextLoss();
    skinPreviewRenderer = null;
  }

  if (skinPreviewAccentMaterial) {
    skinPreviewAccentMaterial.dispose();
    skinPreviewAccentMaterial = null;
  }
  if (skinPreviewEnvironmentTexture) {
    skinPreviewEnvironmentTexture.dispose();
    skinPreviewEnvironmentTexture = null;
  }
}

function createSkinPreviewEnvironment() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#fff5e7");
  gradient.addColorStop(0.3, "#c9b9a3");
  gradient.addColorStop(0.58, "#5d5149");
  gradient.addColorStop(1, "#151923");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const [x, width, color] of [
    [42, 34, "rgba(255,255,255,.95)"],
    [142, 18, "rgba(175,215,255,.75)"],
    [244, 42, "rgba(255,248,232,.98)"],
    [369, 22, "rgba(255,190,122,.78)"],
    [454, 28, "rgba(226,239,255,.86)"],
  ]) {
    const strip = context.createLinearGradient(x, 0, x + width, 0);
    strip.addColorStop(0, "rgba(255,255,255,0)");
    strip.addColorStop(0.5, color);
    strip.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = strip;
    context.fillRect(x, 18, width, 220);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.encoding = THREE.sRGBEncoding;
  texture.needsUpdate = true;
  return texture;
}

function updateSkinSelection() {
  if (!skinGrid) return;
  skinGrid.querySelectorAll(".skin-card").forEach((card) => {
    const selected = card.dataset.skinId === activeSkinId;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
}

function createSkinPreviewScene(skinId, index) {
  const scene = new THREE.Scene();
  scene.environment = skinPreviewEnvironmentTexture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.set(2.15, 1.85, 3.7);
  camera.lookAt(0, 0.55, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.25));
  const keyLight = new THREE.DirectionalLight(0xfff0dc, 2.0);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xc9ddff, 0.65);
  rimLight.position.set(-3, 2.5, -3);
  scene.add(rimLight);

  const pieceGroup = new THREE.Group();
  const materials = PIECE_SKINS[skinId].players[0];
  const bodyMesh = new THREE.Mesh(basePieceGeometries.s, materials.body);
  const insetMesh = new THREE.Mesh(insetPieceGeometries.s, materials.inset);
  insetMesh.position.y = PIECE_SHAPE_SPECIFICATIONS.s.pieceHeight + 0.1 - 0.015;
  pieceGroup.add(bodyMesh, insetMesh);
  const topTrim = new THREE.Mesh(
    topTrimRingGeometries.s,
    skinPreviewAccentMaterial,
  );
  topTrim.rotation.x = Math.PI / 2;
  topTrim.position.y = PIECE_SHAPE_SPECIFICATIONS.s.pieceHeight + 0.105;
  pieceGroup.add(topTrim);

  for (let markerIndex = 0; markerIndex < PIECE_STRENGTH.s; markerIndex++) {
    const marker = new THREE.Mesh(
      strengthMarkerGeometry,
      skinPreviewAccentMaterial,
    );
    marker.position.set(
      (markerIndex - (PIECE_STRENGTH.s - 1) / 2) * 0.08,
      PIECE_SHAPE_SPECIFICATIONS.s.pieceHeight + 0.14,
      0,
    );
    pieceGroup.add(marker);
  }

  pieceGroup.rotation.x = -0.09;
  pieceGroup.rotation.z = 0.065;
  pieceGroup.rotation.y = 0.45 + index * 0.12;
  scene.add(pieceGroup);

  return {
    canvas: skinGrid.querySelector(`[data-preview-skin="${skinId}"]`),
    context: skinGrid
      .querySelector(`[data-preview-skin="${skinId}"]`)
      ?.getContext("2d"),
    scene,
    camera,
    pieceGroup,
    initialYaw: pieceGroup.rotation.y,
  };
}

function renderSkinPreviewFrame(now) {
  skinPreviewFrameId = 0;
  if (
    !skinModalOpen ||
    document.hidden ||
    !skinPreviewRenderer ||
    !activeSkinPreviews.length
  ) {
    return;
  }

  if (
    lastSkinPreviewFrame &&
    now - lastSkinPreviewFrame < SKIN_PREVIEW_FRAME_INTERVAL
  ) {
    skinPreviewFrameId = requestAnimationFrame(renderSkinPreviewFrame);
    return;
  }

  if (!skinPreviewStartTime) skinPreviewStartTime = now;
  const elapsedSeconds = (now - skinPreviewStartTime) / 1000;

  for (const preview of activeSkinPreviews) {
    if (!preview.canvas || !preview.context) continue;

    preview.pieceGroup.rotation.y =
      preview.initialYaw + elapsedSeconds * SKIN_PREVIEW_ROTATION_SPEED;

    skinPreviewRenderer.render(preview.scene, preview.camera);
    preview.context.clearRect(0, 0, SKIN_PREVIEW_SIZE, SKIN_PREVIEW_SIZE);
    preview.context.drawImage(
      skinPreviewRenderer.domElement,
      0,
      0,
      SKIN_PREVIEW_SIZE,
      SKIN_PREVIEW_SIZE,
    );
  }

  lastSkinPreviewFrame = now;
  skinPreviewFrameId = requestAnimationFrame(renderSkinPreviewFrame);
}

function startSkinPreviewLoop() {
  if (
    !skinModalOpen ||
    document.hidden ||
    !skinPreviewRenderer ||
    !activeSkinPreviews.length ||
    skinPreviewFrameId
  )
    return;

  skinPreviewStartTime = performance.now();
  lastSkinPreviewFrame = 0;
  skinPreviewFrameId = requestAnimationFrame(renderSkinPreviewFrame);
}

function renderSkinModalOptions() {
  if (!skinGrid || !skinModalOpen) return;

  destroySkinPreviews();
  skinGrid.replaceChildren();

  Object.entries(PIECE_SKINS).forEach(([id, skin]) => {
    const card = document.createElement("div");
    card.className = `skin-card${id === activeSkinId ? " selected" : ""}`;
    card.dataset.skinId = id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    const t = window.traversalTranslate || ((key) => key);
    card.setAttribute("aria-label", t("game.selectSkin", { name: skin.label }));
    card.setAttribute("aria-pressed", String(id === activeSkinId));

    const canvas = document.createElement("canvas");
    canvas.className = "skin-preview-canvas";
    canvas.width = SKIN_PREVIEW_SIZE;
    canvas.height = SKIN_PREVIEW_SIZE;
    canvas.dataset.previewSkin = id;
    canvas.setAttribute("aria-hidden", "true");

    const name = document.createElement("div");
    name.className = "skin-name";
    name.textContent = skin.label;

    card.append(canvas, name);
    card.addEventListener("click", () => selectSkin(id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSkin(id);
      }
    });
    skinGrid.appendChild(card);
  });
  try {
    skinPreviewRenderer = new THREE.WebGLRenderer({
      canvas: document.createElement("canvas"),
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: true,
    });
    skinPreviewRenderer.setPixelRatio(1);
    skinPreviewRenderer.setSize(SKIN_PREVIEW_SIZE, SKIN_PREVIEW_SIZE, false);
    skinPreviewRenderer.outputEncoding = THREE.sRGBEncoding;
    skinPreviewRenderer.setClearColor(0x000000, 0);
    skinPreviewEnvironmentTexture = createSkinPreviewEnvironment();

    skinPreviewAccentMaterial = createSkinMaterial({
      color: "#1a1d24",
      finish: "metal",
      roughness: 0.35,
      metalness: 0.85,
      clearcoat: 0.3,
    });

    let index = 0;
    for (const id of Object.keys(PIECE_SKINS)) {
      const preview = createSkinPreviewScene(id, index++);
      if (preview.canvas && preview.context) activeSkinPreviews.push(preview);
    }
    startSkinPreviewLoop();
  } catch (error) {
    console.warn("Skin previews could not be initialized:", error);
    destroySkinPreviews();
  }

  updateSkinSelection();
}

function selectSkin(skinId) {
  if (!PIECE_SKINS[skinId]) return;

  activeSkinId = skinId;
  applySkinToAllPieces();
  playSelectionSound();
  window.CloseSkinModal();
}

window.OpenSkinModal = function () {
  if (!skinModal || skinModalOpen) return;
  audioEnabledByUser = true;
  skinModalOpen = true;
  skinModal.classList.add("active");
  skinModal.setAttribute("aria-hidden", "false");
  renderSkinModalOptions();
  getElement("close-skin-modal-button")?.focus({ preventScroll: true });
};

window.CloseSkinModal = function () {
  if (!skinModal || !skinModalOpen) return;
  skinModalOpen = false;
  skinModal.classList.remove("active");
  skinModal.setAttribute("aria-hidden", "true");
  destroySkinPreviews();
  getElement("skin-modal-button")?.focus({ preventScroll: true });
};

skinModal?.addEventListener("transitionend", (event) => {
  if (
    event.target === skinModal &&
    event.propertyName === "opacity" &&
    !skinModalOpen
  )
    skinGrid?.replaceChildren();
});
skinModal?.addEventListener("click", (event) => {
  if (event.target === skinModal) window.CloseSkinModal();
});
document.addEventListener("keydown", (event) => {
  if (!skinModalOpen) return;
  if (event.key === "Escape") {
    window.CloseSkinModal();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [
    ...skinModal.querySelectorAll(
      '#close-skin-modal-button, .skin-card[tabindex="0"]',
    ),
  ];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.addEventListener("visibilitychange", () => {
  if (!skinModalOpen) return;
  if (document.hidden) stopSkinPreviewLoop();
  else startSkinPreviewLoop();
});

/* ---------- Interactive rules tutorial (isolated, on-demand Three.js scene) ---------- */
const rulesModal = getElement("rules-modal");
const rulesTrack = getElement("rules-track");
const rulesSlides = rulesTrack
  ? [...rulesTrack.querySelectorAll(".rules-slide")]
  : [];
const RULES_SKIP_STORAGE_KEY = "traversal.rules.skipStartup";
window.addEventListener("traversal:language-changed", () => {
  if (typeof GAME_STATE !== "undefined" && GAME_STATE) updateGameHud();
  if (typeof SELECTED_PIECE !== "undefined" && SELECTED_PIECE)
    updateSelectedPieceLanguage();
  if (typeof rulesCurrentIndex !== "undefined" && rulesVisualCanvas) {
    const t = window.traversalTranslate || ((key) => key);
    rulesVisualCanvas.setAttribute(
      "aria-label",
      t(`rules.slides.${rulesCurrentIndex}.hint`),
    );
  }
  updateGameControlsLanguage();
});
let rulesModalOpen = false;
let rulesCurrentIndex = 0;
let rulesVisualRenderer = null;
let rulesVisualScene = null;
let rulesVisualCamera = null;
let rulesVisualRoot = null;
let rulesVisualCanvas = null;
let rulesVisualEnvironmentTexture = null;
let rulesVisualDrag = null;
let rulesScrollTimer = 0;

function readRulesSkipPreference() {
  try {
    return window.localStorage.getItem(RULES_SKIP_STORAGE_KEY) === "true";
  } catch (_) {
    return false;
  }
}

function writeRulesSkipPreference(enabled) {
  try {
    if (enabled) window.localStorage.setItem(RULES_SKIP_STORAGE_KEY, "true");
    else window.localStorage.removeItem(RULES_SKIP_STORAGE_KEY);
  } catch (error) {
    console.warn("Could not save the rules startup preference:", error);
  }
}

function updateRulesNavigation() {
  const count = rulesSlides.length || 8;
  const current = Math.max(0, Math.min(count - 1, rulesCurrentIndex));
  const stepCount = getElement("rules-step-count");
  const navigationCount = getElement("rules-navigation-count");
  const progressFill = getElement("rules-progress-fill");
  const progressTrack = rulesModal?.querySelector(".rules-progress-track");
  const previous = getElement("rules-prev-button");
  const next = getElement("rules-next-button");

  if (stepCount)
    stepCount.textContent = `${String(current + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
  if (navigationCount)
    navigationCount.textContent = `${current + 1} / ${count}`;
  if (progressFill)
    progressFill.style.width = `${((current + 1) / count) * 100}%`;
  if (progressTrack)
    progressTrack.setAttribute("aria-valuenow", String(current + 1));
  if (previous) previous.disabled = current === 0;
  if (next) next.disabled = current === count - 1;
}

function goToRulesSlide(index, smooth = true) {
  if (!rulesSlides.length || !rulesTrack) return;
  rulesCurrentIndex = Math.max(0, Math.min(rulesSlides.length - 1, index));
  updateRulesNavigation();
  const target = rulesSlides[rulesCurrentIndex];
  rulesTrack.scrollTo({
    left: rulesCurrentIndex * rulesTrack.clientWidth,
    behavior: smooth ? "smooth" : "auto",
  });
  scheduleRulesVisualRefresh(smooth ? 260 : 0);
}

function scheduleRulesVisualRefresh(delay = 140) {
  if (!rulesModalOpen) return;
  if (rulesScrollTimer) clearTimeout(rulesScrollTimer);
  rulesScrollTimer = window.setTimeout(() => {
    rulesScrollTimer = 0;
    if (!rulesTrack || !rulesSlides.length) return;
    const settledIndex = Math.max(
      0,
      Math.min(
        rulesSlides.length - 1,
        Math.round(rulesTrack.scrollLeft / Math.max(1, rulesTrack.clientWidth)),
      ),
    );
    if (settledIndex !== rulesCurrentIndex) {
      rulesCurrentIndex = settledIndex;
      updateRulesNavigation();
    }
    if (rulesModalOpen && !document.hidden) renderRulesVisualForCurrentSlide();
  }, delay);
}

function disposeRulesScene(scene) {
  if (!scene) return;
  const geometries = new Set();
  const materials = new Set();
  scene.traverse((object) => {
    // Actual gameplay piece clones share their geometry and skin materials with
    // PIECE_MESHES. Disposing them here would break the running game.
    if (object.userData?.rulesSharedAsset) return;
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      if (Array.isArray(object.material))
        object.material.forEach((material) => materials.add(material));
      else materials.add(object.material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function disposeRulesVisualScene() {
  disposeRulesScene(rulesVisualScene);
  rulesVisualScene = null;
  rulesVisualCamera = null;
  rulesVisualRoot = null;
}

function destroyRulesVisualRenderer() {
  disposeRulesVisualScene();
  if (rulesVisualCanvas) {
    rulesVisualCanvas.removeEventListener(
      "pointerdown",
      onRulesVisualPointerDown,
    );
    rulesVisualCanvas.removeEventListener(
      "pointermove",
      onRulesVisualPointerMove,
    );
    rulesVisualCanvas.removeEventListener("pointerup", onRulesVisualPointerUp);
    rulesVisualCanvas.removeEventListener(
      "pointercancel",
      onRulesVisualPointerUp,
    );
    rulesVisualCanvas.remove();
    rulesVisualCanvas = null;
  }
  if (rulesVisualRenderer) {
    rulesVisualRenderer.dispose();
    rulesVisualRenderer.forceContextLoss();
    rulesVisualRenderer = null;
  }
  if (rulesVisualEnvironmentTexture) {
    rulesVisualEnvironmentTexture.dispose();
    rulesVisualEnvironmentTexture = null;
  }
  rulesVisualDrag = null;
}

function makeRulesMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.12,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: THREE.DoubleSide,
  });
}

function addRulesMesh(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function rulesTileHeight(level) {
  // Match the live game's coordinate system exactly.
  return BOARD_BASE_HEIGHT + level * TERRAIN_HEIGHT_SCALE;
}

function rulesGridPoint(row, col, size, cell, level = 0) {
  return {
    x: (col - (size - 1) / 2) * cell,
    y: rulesTileHeight(level),
    z: (row - (size - 1) / 2) * cell,
  };
}

function cloneRulesSharedModel(root, source) {
  if (!source) return null;
  const clone = source.clone(true);
  clone.traverse((object) => {
    // A clone has its own transforms, but borrows the game's geometry/materials.
    // Mark every descendant so tutorial cleanup never disposes live-game assets.
    object.userData.rulesSharedAsset = true;
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = false;
    }
  });
  root.add(clone);
  return clone;
}

function addRulesGround(root) {
  const table = GAME_WORLD?.children?.find(
    (object) =>
      object.isMesh &&
      object.geometry?.type === "PlaneGeometry" &&
      object.geometry.parameters?.width === 90,
  );
  if (!table) return null;
  const clone = cloneRulesSharedModel(root, table);
  clone.position.set(0, 0, 0);
  return clone;
}

function addRulesBoard(root, size, options = {}) {
  const cell = options.cell ?? (size >= 9 ? 0.68 : 0.9);
  const heightAt = options.heightAt ?? (() => 0);
  const originMap = [];

  // Use the game's existing table and frame, not tutorial-made substitutes.
  addRulesGround(root);
  const frame = GAME_WORLD?.children?.find(
    (object) =>
      object.isMesh &&
      object.geometry?.type === "BoxGeometry" &&
      (object.geometry.parameters?.width ?? 0) > BOARD_SIZE,
  );
  if (frame) {
    const frameClone = cloneRulesSharedModel(root, frame);
    const frameScale = ((size + 0.7) * cell) / (BOARD_SIZE + 0.7);
    frameClone.scale.set(frameScale, 1, frameScale);
    frameClone.position.set(0, frame.position.y, 0);
  }

  for (let r = 0; r < size; r++) {
    originMap[r] = [];
    for (let c = 0; c < size; c++) {
      const level = Math.max(0, Math.min(3, Math.round(heightAt(r, c))));
      originMap[r][c] = level;
      const sourceCandidates = [];
      for (let sourceR = 0; sourceR < BOARD_SIZE; sourceR++) {
        for (let sourceC = 0; sourceC < BOARD_SIZE; sourceC++) {
          if (
            TERRAIN_HEIGHTS?.[sourceR]?.[sourceC] === level &&
            (sourceR + sourceC) % 2 === (r + c) % 2 &&
            TERRAIN_TILE_MESHES?.[sourceR]?.[sourceC]
          ) {
            sourceCandidates.push(TERRAIN_TILE_MESHES[sourceR][sourceC]);
          }
        }
      }
      const fallbackCandidates =
        TERRAIN_TILE_MESHES?.flat?.().filter(Boolean) ?? [];
      const sources = sourceCandidates.length
        ? sourceCandidates
        : fallbackCandidates;
      const tileSource = sources[(r * 7 + c * 3) % Math.max(1, sources.length)];
      if (!tileSource) continue;

      const tile = cloneRulesSharedModel(root, tileSource);
      const tileHeight = level * TERRAIN_HEIGHT_SCALE + 0.04;
      const sourceGeometryHeight =
        tileSource.geometry?.parameters?.height ?? tileHeight;
      const verticalScale =
        (tileHeight * tileHeight) / Math.max(0.001, sourceGeometryHeight);
      tile.position.set(
        (c - (size - 1) / 2) * cell,
        BOARD_BASE_HEIGHT - 0.04 + tileHeight / 2,
        (r - (size - 1) / 2) * cell,
      );
      tile.scale.set(cell, verticalScale, cell);
      tile.userData.ruleCell = { r, c, level };
    }
  }
  return { size, cell, levels: originMap };
}

function addRulesPiece(
  root,
  type,
  x,
  z,
  tileTop = 0.14,
  color = 0xf0d7ad,
  scale = 1,
) {
  // Reuse a real piece already created by the game. No substitute geometry or
  // duplicate skin materials are generated for the tutorial.
  const playerNumber = color === 0xf0d7ad ? 1 : 2;
  const source =
    PIECE_MESHES?.find(
      (piece) =>
        piece.userData?.pc?.t === type &&
        piece.userData?.pc?.p === playerNumber,
    ) || PIECE_MESHES?.find((piece) => piece.userData?.pc?.t === type);
  if (!source) return null;

  const group = cloneRulesSharedModel(root, source);
  if (!group) return null;
  group.visible = true;
  group.position.set(x, tileTop + 0.02, z);
  group.scale.setScalar(scale);
  group.rotation.set(0, group.userData.pc?.p === 2 ? Math.PI : 0, 0);
  group.userData.anim = false;
  group.userData.lift = 0;
  return group;
}

function addRulesPieceAt(root, board, type, row, col, color, scale = 1) {
  const level = board.levels[row][col];
  const point = rulesGridPoint(row, col, board.size, board.cell, level);
  return addRulesPiece(
    root,
    type,
    point.x,
    point.z,
    point.y,
    color,
    (scale * board.cell) / 0.9,
  );
}

function addRulesMarker(root, x, z, color = 0x70e2a1, scale = 1, y = 0.19) {
  return addRulesMesh(
    root,
    new THREE.CylinderGeometry(0.29 * scale, 0.29 * scale, 0.035, 22),
    makeRulesMaterial(color, {
      roughness: 0.28,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.58,
      transparent: true,
      opacity: 0.92,
    }),
    x,
    y,
    z,
  );
}

function addRulesPath(root, points, color = 0x78e6b0, radius = 0.026) {
  if (!points || points.length < 2) return null;
  const vectors = points.map(
    (point) => new THREE.Vector3(point.x, point.y + 0.11, point.z),
  );
  const curve = new THREE.CatmullRomCurve3(vectors);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(
      curve,
      Math.max(10, points.length * 8),
      radius,
      6,
      false,
    ),
    makeRulesMaterial(color, {
      roughness: 0.3,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.48,
    }),
  );
  root.add(tube);
  const end = vectors[vectors.length - 1];
  const previous = vectors[vectors.length - 2];
  const direction = end.clone().sub(previous).normalize();
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 3.6, radius * 7, 8),
    makeRulesMaterial(color, {
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.4,
    }),
  );
  arrow.position.copy(end).addScaledVector(direction, -radius * 2.6);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  root.add(arrow);
  return tube;
}

function makeRulesSceneBase() {
  const scene = new THREE.Scene();
  // This temporary environment belongs to the tutorial renderer and is disposed
  // as soon as the modal closes; it never borrows the live renderer's GPU data.
  scene.environment = rulesVisualEnvironmentTexture;
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  camera.position.set(0, 7.6, 10.4);
  camera.lookAt(0, 0.32, 0);
  scene.add(new THREE.HemisphereLight(0xffe9cc, 0x4a2c18, 0.25));
  const key = new THREE.DirectionalLight(0xffdfb0, 0.85);
  key.position.set(7, 14, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb070, 0.4);
  rim.position.set(-8, 5, -10);
  scene.add(rim);
  const root = new THREE.Group();
  root.rotation.x = -0.13;
  root.rotation.y = -0.22;
  scene.add(root);
  return { scene, camera, root };
}

function buildRulesSetupVisual(root) {
  const heightAt = (r, c) => {
    const mirroredR = Math.min(r, 9 - r);
    const distance = Math.hypot(mirroredR - 2.2, c - 4.5);
    return distance < 1.25 ? 3 : distance < 2.05 ? 2 : distance < 2.9 ? 1 : 0;
  };
  const board = addRulesBoard(root, 10, { heightAt });
  const types = ["s", "v", "e", "e", "v", "s"];
  const light = 0xf0d7ad;
  const dark = 0x607e9d;
  types.forEach((type, i) => {
    addRulesPieceAt(root, board, type, 9, i + 2, light, 0.94);
    addRulesPieceAt(root, board, type, 0, i + 2, dark, 0.94);
  });
  const cell = board.cell;
  const x = 0;
  addRulesPath(
    root,
    [
      { x, y: rulesTileHeight(board.levels[8][4]), z: (8 - 4.5) * cell },
      { x, y: rulesTileHeight(board.levels[6][4]), z: (6 - 4.5) * cell },
      { x, y: rulesTileHeight(board.levels[4][4]), z: (4 - 4.5) * cell },
    ],
    0x8ae9ac,
    0.018,
  );
}

function buildRulesPiecesVisual(root) {
  addRulesGround(root);
  const positions = [-2.0, 0, 2.0];
  const pieces = ["e", "v", "s"];
  pieces.forEach((type, index) => {
    addRulesPiece(root, type, positions[index], 0, 0.02, 0xf0d7ad, 1.16);
  });
}

function buildRulesMovementVisual(root) {
  const heightAt = (r, c) => {
    if (r < 1 || r > 3) return 0;
    if (c === 2) return 2;
    if (c === 3 || c === 4) return 2;
    return 0;
  };
  const board = addRulesBoard(root, 5, { heightAt, cell: 0.94 });
  const routeCells = [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
  ];
  const points = routeCells.map(([r, c]) => {
    const p = rulesGridPoint(r, c, board.size, board.cell, board.levels[r][c]);
    addRulesMarker(
      root,
      p.x,
      p.z,
      c === 3 ? 0x72efb1 : 0xe2c178,
      0.82,
      p.y + 0.02,
    );
    return p;
  });
  addRulesPieceAt(root, board, "e", 2, 0, 0xf0d7ad, 1.12);
  addRulesPath(root, points, 0xe9c56e, 0.035);
}

function buildRulesExplorerVisual(root) {
  const board = addRulesBoard(root, 5, { cell: 0.92 });
  addRulesPieceAt(root, board, "e", 2, 2, 0xf0d7ad, 1.18);
  const center = rulesGridPoint(2, 2, board.size, board.cell, 0);
  const diagonal = rulesGridPoint(1, 3, board.size, board.cell, 0);
  const leapGood = rulesGridPoint(2, 4, board.size, board.cell, 0);
  const leapStart = rulesGridPoint(0, 2, board.size, board.cell, 0);
  const blocked = rulesGridPoint(1, 2, board.size, board.cell, 0);
  addRulesMarker(
    root,
    diagonal.x,
    diagonal.z,
    0xf0d16d,
    0.82,
    diagonal.y + 0.02,
  );
  addRulesMarker(
    root,
    leapGood.x,
    leapGood.z,
    0x6edcf0,
    0.82,
    leapGood.y + 0.02,
  );
  addRulesMarker(
    root,
    leapStart.x,
    leapStart.z,
    0xf06f66,
    0.82,
    leapStart.y + 0.02,
  );
  addRulesPath(root, [center, diagonal], 0xf0d16d, 0.032);
  addRulesPath(root, [center, leapGood], 0x6edcf0, 0.032);
  addRulesPieceAt(root, board, "v", 1, 2, 0x607e9d, 0.96);
  addRulesPath(root, [center, blocked, leapStart], 0xf06f66, 0.022);
  const x = addRulesMesh(
    root,
    new THREE.BoxGeometry(0.34, 0.05, 0.05),
    makeRulesMaterial(0xff766e, { emissive: 0xff5f57, emissiveIntensity: 0.8 }),
    blocked.x,
    blocked.y + 0.7,
    blocked.z,
  );
  x.rotation.y = Math.PI / 4;
  const x2 = x.clone();
  x2.geometry = new THREE.BoxGeometry(0.34, 0.05, 0.05);
  x2.material = makeRulesMaterial(0xff766e, {
    emissive: 0xff5f57,
    emissiveIntensity: 0.8,
  });
  x2.rotation.y = -Math.PI / 4;
  x2.position.copy(x.position);
  root.add(x2);
}

function buildRulesCombatVisual(root) {
  const heightAt = (r, c) => (r === 2 && c === 1 ? 2 : 0);
  const board = addRulesBoard(root, 5, { heightAt, cell: 0.94 });
  const attacker = rulesGridPoint(
    2,
    1,
    board.size,
    board.cell,
    board.levels[2][1],
  );
  const target = rulesGridPoint(
    2,
    2,
    board.size,
    board.cell,
    board.levels[2][2],
  );
  const ally = rulesGridPoint(1, 2, board.size, board.cell, board.levels[1][2]);
  const defender = rulesGridPoint(
    3,
    2,
    board.size,
    board.cell,
    board.levels[3][2],
  );
  addRulesPieceAt(root, board, "s", 2, 1, 0xf0d7ad, 1.1);
  addRulesPieceAt(root, board, "s", 2, 2, 0x607e9d, 1.1);
  addRulesPieceAt(root, board, "e", 1, 2, 0xf0d7ad, 0.9);
  addRulesPieceAt(root, board, "e", 3, 2, 0x607e9d, 0.9);
  addRulesPath(root, [attacker, target], 0xffc873, 0.045);
  addRulesPath(root, [ally, target], 0x71e4a4, 0.02);
  addRulesPath(root, [defender, target], 0x7cb2e7, 0.02);
  addRulesMarker(root, target.x, target.z, 0xff8c74, 0.92, target.y + 0.02);
}

function buildRulesExitVisual(root) {
  const board = addRulesBoard(root, 5, { cell: 0.92 });
  for (let c = 0; c < board.size; c++) {
    const top = rulesGridPoint(0, c, board.size, board.cell, 0);
    addRulesMarker(root, top.x, top.z, 0x6be6a1, 0.72, top.y + 0.015);
  }
  const origin = rulesGridPoint(1, 2, board.size, board.cell, 0);
  const edge = rulesGridPoint(0, 2, board.size, board.cell, 0);
  addRulesPieceAt(root, board, "v", 1, 2, 0xf0d7ad, 1.1);
  addRulesPath(
    root,
    [origin, edge, { x: edge.x, y: edge.y + 0.2, z: edge.z - 0.9 }],
    0x77ebb0,
    0.038,
  );
  for (let i = 0; i < 2; i++) {
    addRulesMesh(
      root,
      new THREE.TorusGeometry(0.13 + i * 0.08, 0.018, 5, 28),
      makeRulesMaterial(0xf0c77f, {
        emissive: 0xe6b564,
        emissiveIntensity: 0.6,
        metalness: 0.5,
      }),
      edge.x + 0.34,
      0.44 + i * 0.2,
      edge.z - 0.53,
    ).rotation.x = Math.PI / 2;
  }
}

function buildRulesVictoryVisual(root) {
  const board = addRulesBoard(root, 6, { cell: 0.82 });
  for (let c = 0; c < board.size; c++) {
    const p = rulesGridPoint(0, c, board.size, board.cell, 0);
    addRulesMarker(root, p.x, p.z, 0x6be6a1, 0.72, p.y + 0.015);
  }
  const edge = rulesGridPoint(0, 2, board.size, board.cell, 0);
  addRulesPiece(root, "s", edge.x, edge.z - 0.8, edge.y, 0xf0d7ad, 1.08);
  addRulesMesh(
    root,
    new THREE.TorusGeometry(0.47, 0.025, 7, 42),
    makeRulesMaterial(0xf2c96e, {
      emissive: 0xeec16a,
      emissiveIntensity: 0.8,
      metalness: 0.35,
    }),
    edge.x,
    0.9,
    edge.z - 0.8,
  ).rotation.x = Math.PI / 2;
  addRulesPieceAt(root, board, "v", 3, 3, 0x607e9d, 0.95);
  addRulesPieceAt(root, board, "e", 4, 4, 0x607e9d, 0.95);
  addRulesPath(
    root,
    [
      { x: edge.x, y: edge.y, z: edge.z - 0.45 },
      { x: edge.x, y: edge.y, z: edge.z - 0.75 },
    ],
    0xffd67e,
    0.038,
  );
}

function buildRulesControlsVisual(root) {
  const board = addRulesBoard(root, 6, { cell: 0.82 });
  addRulesPieceAt(root, board, "e", 4, 2, 0xf0d7ad, 1.1);
  const origin = rulesGridPoint(4, 2, board.size, board.cell, 0);
  const destinations = [
    [3, 2],
    [4, 1],
    [4, 3],
    [3, 1],
    [3, 3],
    [2, 2],
    [4, 4],
  ];
  destinations.forEach(([r, c], index) => {
    const p = rulesGridPoint(r, c, board.size, board.cell, 0);
    addRulesMarker(
      root,
      p.x,
      p.z,
      index < 3 ? 0x6ce5a5 : 0xe9c874,
      0.77,
      p.y + 0.02,
    );
    if (index < 5)
      addRulesPath(root, [origin, p], index < 3 ? 0x6ce5a5 : 0xe9c874, 0.018);
  });
}

function buildRulesVisual(type) {
  const setup = makeRulesSceneBase();
  switch (type) {
    case "setup":
      buildRulesSetupVisual(setup.root);
      break;
    case "pieces":
      buildRulesPiecesVisual(setup.root);
      break;
    case "movement":
      buildRulesMovementVisual(setup.root);
      break;
    case "explorer":
      buildRulesExplorerVisual(setup.root);
      break;
    case "combat":
      buildRulesCombatVisual(setup.root);
      break;
    case "exit":
      buildRulesExitVisual(setup.root);
      break;
    case "victory":
      buildRulesVictoryVisual(setup.root);
      break;
    case "controls":
      buildRulesControlsVisual(setup.root);
      break;
    default:
      buildRulesSetupVisual(setup.root);
  }
  if (type === "setup") {
    setup.camera.position.set(0, 9.4, 11.9);
    setup.camera.lookAt(0, 0.45, 0);
  } else if (type === "pieces") {
    setup.camera.position.set(0, 3.7, 7.6);
    setup.camera.lookAt(0, 0.65, 0);
  } else if (
    ["movement", "explorer", "combat", "exit", "victory", "controls"].includes(
      type,
    )
  ) {
    setup.camera.position.set(0, 5.4, 7.4);
    setup.camera.lookAt(0, 0.35, 0);
  }
  return setup;
}

function resizeRulesVisual() {
  if (!rulesVisualRenderer || !rulesVisualCamera || !rulesVisualCanvas) return;
  const holder = rulesVisualCanvas.parentElement;
  if (!holder) return;
  const width = Math.max(1, Math.floor(holder.clientWidth));
  const height = Math.max(1, Math.floor(holder.clientHeight));
  rulesVisualRenderer.setSize(width, height, false);
  rulesVisualCamera.aspect = width / height;
  rulesVisualCamera.updateProjectionMatrix();
  renderRulesVisualFrameOnce();
}

function onRulesVisualPointerDown(event) {
  if (!rulesModalOpen || event.button !== 0) return;
  rulesVisualDrag = {
    x: event.clientX,
    y: event.clientY,
    pointerId: event.pointerId,
  };
  try {
    rulesVisualCanvas.setPointerCapture(event.pointerId);
  } catch (_) {}
  rulesVisualCanvas.style.cursor = "grabbing";
}

function onRulesVisualPointerMove(event) {
  if (
    !rulesVisualDrag ||
    !rulesVisualRoot ||
    rulesVisualDrag.pointerId !== event.pointerId
  )
    return;
  const dx = event.clientX - rulesVisualDrag.x;
  const dy = event.clientY - rulesVisualDrag.y;
  rulesVisualDrag.x = event.clientX;
  rulesVisualDrag.y = event.clientY;
  rulesVisualRoot.rotation.y += dx * 0.009;
  rulesVisualRoot.rotation.x = Math.max(
    -0.9,
    Math.min(0.22, rulesVisualRoot.rotation.x + dy * 0.006),
  );
  renderRulesVisualFrameOnce();
  event.preventDefault();
}

function onRulesVisualPointerUp(event) {
  if (rulesVisualDrag && rulesVisualDrag.pointerId === event.pointerId) {
    rulesVisualDrag = null;
    if (rulesVisualCanvas) rulesVisualCanvas.style.cursor = "grab";
  }
}

function renderRulesVisualForCurrentSlide() {
  if (!rulesModalOpen || document.hidden || !rulesSlides[rulesCurrentIndex])
    return;
  const visualHolder = rulesSlides[rulesCurrentIndex].querySelector(
    ".rules-visual-scene",
  );
  if (!visualHolder) return;
  if (!rulesVisualRenderer) {
    try {
      rulesVisualCanvas = document.createElement("canvas");
      const t = window.traversalTranslate || ((key) => key);
      rulesVisualCanvas.setAttribute(
        "aria-label",
        t(`rules.slides.${rulesCurrentIndex}.hint`),
      );
      rulesVisualCanvas.setAttribute("role", "img");
      rulesVisualRenderer = new THREE.WebGLRenderer({
        canvas: rulesVisualCanvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
      // Allocate the tutorial environment only while this modal is open.
      rulesVisualEnvironmentTexture = createSkinPreviewEnvironment();
      rulesVisualRenderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.35),
      );
      rulesVisualRenderer.outputEncoding = THREE.sRGBEncoding;
      rulesVisualRenderer.setClearColor(0x000000, 0);
      rulesVisualCanvas.addEventListener(
        "pointerdown",
        onRulesVisualPointerDown,
      );
      rulesVisualCanvas.addEventListener(
        "pointermove",
        onRulesVisualPointerMove,
      );
      rulesVisualCanvas.addEventListener("pointerup", onRulesVisualPointerUp);
      rulesVisualCanvas.addEventListener(
        "pointercancel",
        onRulesVisualPointerUp,
      );
    } catch (error) {
      console.warn("The rules 3D visual could not be initialized:", error);
      destroyRulesVisualRenderer();
      const t = window.traversalTranslate || ((key) => key);
      visualHolder.textContent = t("game.webglUnsupported");
      return;
    }
  }
  if (rulesVisualCanvas.parentElement !== visualHolder)
    visualHolder.appendChild(rulesVisualCanvas);
  disposeRulesVisualScene();
  const visualType = visualHolder.dataset.ruleVisual;
  const built = buildRulesVisual(visualType);
  rulesVisualScene = built.scene;
  rulesVisualCamera = built.camera;
  rulesVisualRoot = built.root;
  resizeRulesVisual();
}

function renderRulesVisualFrameOnce() {
  if (
    !rulesModalOpen ||
    document.hidden ||
    !rulesVisualRenderer ||
    !rulesVisualScene ||
    !rulesVisualCamera
  )
    return;
  rulesVisualRenderer.render(rulesVisualScene, rulesVisualCamera);
}

window.OpenRulesModal = function () {
  if (!rulesModal || rulesModalOpen) return;
  rulesModalOpen = true;
  rulesModal.classList.add("active");
  rulesModal.setAttribute("aria-hidden", "false");
  const startupCheckbox = getElement("rules-skip-startup");
  if (startupCheckbox) startupCheckbox.checked = readRulesSkipPreference();
  updateRulesNavigation();
  window.setTimeout(() => {
    if (!rulesModalOpen) return;
    rulesTrack.scrollLeft = rulesCurrentIndex * rulesTrack.clientWidth;
    updateRulesNavigation();
    renderRulesVisualForCurrentSlide();
    getElement("close-rules-modal-button")?.focus({ preventScroll: true });
  }, 50);
};

window.CloseRulesModal = function () {
  if (!rulesModal || !rulesModalOpen) return;
  rulesModalOpen = false;
  rulesModal.classList.remove("active");
  rulesModal.setAttribute("aria-hidden", "true");
  if (rulesScrollTimer) clearTimeout(rulesScrollTimer);
  rulesScrollTimer = 0;
  destroyRulesVisualRenderer();
  getElement("rules-modal-button")?.focus({ preventScroll: true });
};

getElement("close-rules-modal-button")?.addEventListener(
  "click",
  window.CloseRulesModal,
);
getElement("rules-prev-button")?.addEventListener("click", () =>
  goToRulesSlide(rulesCurrentIndex - 1),
);
getElement("rules-next-button")?.addEventListener("click", () =>
  goToRulesSlide(rulesCurrentIndex + 1),
);
getElement("rules-skip-startup")?.addEventListener("change", (event) =>
  writeRulesSkipPreference(event.currentTarget.checked),
);
rulesTrack?.addEventListener(
  "scroll",
  () => {
    scheduleRulesVisualRefresh(130);
  },
  { passive: true },
);
rulesTrack?.addEventListener(
  "wheel",
  (event) => {
    const copy = event.target.closest?.(".rules-copy");
    if (copy && window.matchMedia("(min-width: 761px)").matches) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      rulesTrack.scrollLeft += event.deltaY;
    }
  },
  { passive: false },
);
rulesModal?.addEventListener("click", (event) => {
  if (event.target === rulesModal) window.CloseRulesModal();
});
document.addEventListener("keydown", (event) => {
  if (!rulesModalOpen) return;
  if (event.key === "Escape") {
    window.CloseRulesModal();
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToRulesSlide(rulesCurrentIndex + 1);
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToRulesSlide(rulesCurrentIndex - 1);
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [
    ...rulesModal.querySelectorAll(
      "#close-rules-modal-button, #rules-skip-startup, #rules-prev-button, #rules-next-button",
    ),
  ];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.addEventListener("visibilitychange", () => {
  // Nothing runs in the background. Only repaint if the open modal becomes visible again.
  if (rulesModalOpen && !document.hidden) resizeRulesVisual();
});
window.addEventListener("resize", resizeRulesVisual, { passive: true });

resizeRenderer();
initializeGame();
if (!readRulesSkipPreference())
  window.setTimeout(() => window.OpenRulesModal(), 300);
