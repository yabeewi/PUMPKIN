(function () {
  const canvas = document.getElementById('pumpkinCanvas');
  const pumpkin = window.__CURRENT_PUMPKIN;
  if (!canvas || !pumpkin) return;

  const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
  if (!gl) {
    const parent = canvas.parentElement;
    if (parent) parent.innerHTML = '<div style="padding:32px;text-align:center">🎃<br>此裝置無法啟用 3D 顯示，但南瓜已正常加入收藏。</div>';
    return;
  }

  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uMVP;
    uniform mat4 uModel;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorld = world.xyz;
      vNormal = normalize(mat3(uModel) * aNormal);
      gl_Position = uMVP * vec4(aPosition, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform vec4 uColor;
    uniform vec3 uCamera;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 lightA = normalize(vec3(0.65, 0.95, 0.85));
      vec3 lightB = normalize(vec3(-0.7, 0.25, -0.35));
      float diffuse = max(dot(n, lightA), 0.0);
      float fill = max(dot(n, lightB), 0.0);
      vec3 viewDir = normalize(uCamera - vWorld);
      float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.2);
      vec3 shaded = uColor.rgb * (0.32 + diffuse * 0.72 + fill * 0.18) + vec3(rim * 0.12);
      gl_FragColor = vec4(shaded, uColor.a);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
  }
  gl.useProgram(program);

  const locations = {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal'),
    mvp: gl.getUniformLocation(program, 'uMVP'),
    model: gl.getUniformLocation(program, 'uModel'),
    color: gl.getUniformLocation(program, 'uColor'),
    camera: gl.getUniformLocation(program, 'uCamera')
  };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);

  function mat4Identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }

  function mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col += 1) {
      for (let row = 0; row < 4; row += 1) {
        out[col * 4 + row] =
          a[0 * 4 + row] * b[col * 4 + 0] +
          a[1 * 4 + row] * b[col * 4 + 1] +
          a[2 * 4 + row] * b[col * 4 + 2] +
          a[3 * 4 + row] * b[col * 4 + 3];
      }
    }
    return out;
  }

  function mat4Translation(x, y, z) {
    const out = mat4Identity();
    out[12] = x; out[13] = y; out[14] = z;
    return out;
  }

  function mat4Scale(x, y, z) {
    const out = mat4Identity();
    out[0] = x; out[5] = y; out[10] = z;
    return out;
  }

  function mat4RotationX(r) {
    const c = Math.cos(r), s = Math.sin(r);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  }

  function mat4RotationY(r) {
    const c = Math.cos(r), s = Math.sin(r);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }

  function mat4RotationZ(r) {
    const c = Math.cos(r), s = Math.sin(r);
    return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]);
  }

  function mat4Perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  function cross(a, b) {
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  }

  function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }

  function mat4LookAt(eye, center, up) {
    const z = normalize([eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]]);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);
  }

  function composeTransform(t) {
    let m = mat4Translation(t.x || 0, t.y || 0, t.z || 0);
    if (t.rx) m = mat4Multiply(m, mat4RotationX(t.rx));
    if (t.ry) m = mat4Multiply(m, mat4RotationY(t.ry));
    if (t.rz) m = mat4Multiply(m, mat4RotationZ(t.rz));
    m = mat4Multiply(m, mat4Scale(t.sx == null ? 1 : t.sx, t.sy == null ? 1 : t.sy, t.sz == null ? 1 : t.sz));
    return m;
  }

  function hexToRgba(hex, alpha) {
    const raw = String(hex || '#ffffff').replace('#', '');
    const full = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw;
    const int = parseInt(full, 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255, alpha == null ? 1 : alpha];
  }

  function createMesh(positions, normals, indices) {
    const mesh = {
      positionBuffer: gl.createBuffer(),
      normalBuffer: gl.createBuffer(),
      indexBuffer: gl.createBuffer(),
      count: indices.length
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return mesh;
  }

  function sphereMesh(uSeg = 24, vSeg = 16) {
    const p = [], n = [], idx = [];
    for (let y = 0; y <= vSeg; y += 1) {
      const v = y / vSeg;
      const phi = v * Math.PI;
      for (let x = 0; x <= uSeg; x += 1) {
        const u = x / uSeg;
        const theta = u * Math.PI * 2;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sy = Math.cos(phi);
        const sz = Math.sin(phi) * Math.sin(theta);
        p.push(sx, sy, sz);
        n.push(sx, sy, sz);
      }
    }
    for (let y = 0; y < vSeg; y += 1) {
      for (let x = 0; x < uSeg; x += 1) {
        const a = y * (uSeg + 1) + x;
        const b = a + uSeg + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return createMesh(p, n, idx);
  }

  function cylinderMesh(topRadius = 1, bottomRadius = 1, height = 1, segments = 24) {
    const p = [], n = [], idx = [];
    const half = height / 2;
    for (let y = 0; y <= 1; y += 1) {
      const radius = y === 0 ? bottomRadius : topRadius;
      const py = y === 0 ? -half : half;
      for (let i = 0; i <= segments; i += 1) {
        const a = (i / segments) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        const normal = normalize([Math.cos(a), (bottomRadius - topRadius) / Math.max(height, 0.001), Math.sin(a)]);
        p.push(x, py, z);
        n.push(normal[0], normal[1], normal[2]);
      }
    }
    for (let i = 0; i < segments; i += 1) {
      const a = i;
      const b = i + segments + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }

    const bottomCenter = p.length / 3;
    p.push(0, -half, 0); n.push(0, -1, 0);
    const topCenter = p.length / 3;
    p.push(0, half, 0); n.push(0, 1, 0);
    for (let i = 0; i < segments; i += 1) {
      const a = i;
      const b = i + 1;
      idx.push(bottomCenter, b, a);
      const ta = segments + 1 + i;
      const tb = segments + 1 + i + 1;
      idx.push(topCenter, ta, tb);
    }
    return createMesh(p, n, idx);
  }

  function torusMesh(radius = 1, tube = 0.15, radial = 10, tubular = 32, start = 0, arc = Math.PI * 2) {
    const p = [], n = [], idx = [];
    for (let j = 0; j <= radial; j += 1) {
      const v = (j / radial) * Math.PI * 2;
      for (let i = 0; i <= tubular; i += 1) {
        const u = start + (i / tubular) * arc;
        const cx = Math.cos(u), cy = Math.sin(u);
        const tv = Math.cos(v), sv = Math.sin(v);
        p.push((radius + tube * tv) * cx, (radius + tube * tv) * cy, tube * sv);
        n.push(tv * cx, tv * cy, sv);
      }
    }
    for (let j = 0; j < radial; j += 1) {
      for (let i = 0; i < tubular; i += 1) {
        const a = j * (tubular + 1) + i;
        const b = (j + 1) * (tubular + 1) + i;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return createMesh(p, n, idx);
  }

  function boxMesh() {
    const p = [
      -1,-1,1, 1,-1,1, 1,1,1, -1,1,1,
      1,-1,-1, -1,-1,-1, -1,1,-1, 1,1,-1,
      -1,1,1, 1,1,1, 1,1,-1, -1,1,-1,
      -1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,1,
      1,-1,1, 1,-1,-1, 1,1,-1, 1,1,1,
      -1,-1,-1, -1,-1,1, -1,1,1, -1,1,-1
    ];
    const normals = [];
    [[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]].forEach(v => {
      for (let i = 0; i < 4; i += 1) normals.push(...v);
    });
    const idx = [];
    for (let f = 0; f < 6; f += 1) {
      const o = f * 4;
      idx.push(o,o+1,o+2,o,o+2,o+3);
    }
    return createMesh(p, normals, idx);
  }

  function flatPolygonMesh(points) {
    const p = [0,0,0], n = [0,0,1], idx = [];
    points.forEach(pt => { p.push(pt[0], pt[1], 0); n.push(0,0,1); });
    for (let i = 0; i < points.length; i += 1) idx.push(0, i + 1, ((i + 1) % points.length) + 1);
    return createMesh(p, n, idx);
  }

  function starPoints(outer = 1, inner = 0.48, count = 5) {
    const pts = [];
    for (let i = 0; i < count * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + i * Math.PI / count;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  }

  const meshes = {
    sphere: sphereMesh(),
    cylinder: cylinderMesh(1, 1, 1, 24),
    cone: cylinderMesh(0.06, 1, 1, 24),
    torus: torusMesh(1, 0.12, 10, 32),
    mouthSmile: torusMesh(1, 0.13, 8, 22, Math.PI, Math.PI),
    mouthFrown: torusMesh(1, 0.13, 8, 22, 0, Math.PI),
    box: boxMesh(),
    star: flatPolygonMesh(starPoints()),
    wing: flatPolygonMesh([[0,0],[-0.45,0.30],[-0.95,0.05],[-0.68,-0.18],[-0.82,-0.48],[-0.38,-0.32],[-0.15,-0.58]]),
    leaf: flatPolygonMesh([[0.55,0],[0.18,0.22],[-0.5,0.08],[-0.18,-0.18]])
  };

  const camera = [0, 0.7, 7.0];
  let projection = mat4Identity();
  const view = mat4LookAt(camera, [0, 0.25, 0], [0, 1, 0]);
  gl.uniform3fv(locations.camera, new Float32Array(camera));

  function draw(mesh, transform, color, rootMatrix) {
    let model = composeTransform(transform || {});
    if (rootMatrix) model = mat4Multiply(rootMatrix, model);
    const mvp = mat4Multiply(projection, mat4Multiply(view, model));

    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniformMatrix4fv(locations.mvp, false, mvp);
    gl.uniform4fv(locations.color, new Float32Array(color));

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.enableVertexAttribArray(locations.normal);
    gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width * dpr));
    const height = Math.max(340, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    projection = mat4Perspective(38 * Math.PI / 180, width / height, 0.1, 100);
  }

  function renderPumpkin(root, elapsed) {
    const shell = hexToRgba(pumpkin.palette.shell);
    const shell2 = hexToRgba(pumpkin.palette.shell2);
    const stem = hexToRgba(pumpkin.palette.stem);
    const accent = hexToRgba(pumpkin.palette.accent);
    const eye = hexToRgba(pumpkin.palette.eye);

    draw(meshes.sphere, { sx: 1.18, sy: 0.92, sz: 1.08 }, shell, root);
    for (let i = -3; i <= 3; i += 1) {
      draw(meshes.sphere, { x: i * 0.29, y: -0.02, sx: 0.78, sy: 0.92, sz: 1.0 }, i % 2 === 0 ? shell2 : shell, root);
    }

    draw(meshes.cylinder, { y: 1.48, rz: 0.22, sx: 0.20, sy: 0.72, sz: 0.20 }, stem, root);
    draw(meshes.torus, { x: 0.30, y: 1.38, z: 0.10, rx: 1.2, rz: -0.55, sx: 0.24, sy: 0.24, sz: 0.24 }, hexToRgba('#75b84f'), root);

    draw(meshes.sphere, { x: -0.42, y: 0.28, z: 1.17, sx: 0.13, sy: 0.16, sz: 0.065 }, eye, root);
    if (pumpkin.id === 3 || pumpkin.id === 8) {
      draw(meshes.box, { x: 0.38, y: 0.27, z: 1.18, rz: pumpkin.id === 3 ? -0.18 : 0, sx: 0.11, sy: 0.018, sz: 0.025 }, eye, root);
    } else {
      draw(meshes.sphere, { x: 0.38, y: 0.28, z: 1.17, sx: 0.13, sy: 0.16, sz: 0.065 }, eye, root);
    }

    const mouthMesh = pumpkin.id === 6 ? meshes.mouthFrown : meshes.mouthSmile;
    draw(mouthMesh, { y: -0.18, z: 1.17, sx: 0.34, sy: 0.26, sz: 0.34 }, eye, root);

    switch (pumpkin.accessory) {
      case 'cape':
        draw(meshes.cone, { y: -0.30, z: -0.72, sx: 1.42, sy: 1.65, sz: 0.40, rx: Math.PI }, accent, root);
        break;
      case 'leaf':
        draw(meshes.leaf, { x: 0.50, y: 1.48, z: 0.10, rz: -0.45, sx: 0.70, sy: 0.65, sz: 0.7 }, accent, root);
        break;
      case 'star':
        draw(meshes.star, { x: 0.74, y: 0.76, z: 1.14, sx: 0.27, sy: 0.27, sz: 0.27, rz: elapsed * 0.25 }, accent, root);
        break;
      case 'crown':
        draw(meshes.cylinder, { y: 1.67, sx: 0.76, sy: 0.22, sz: 0.76 }, accent, root);
        [-0.34, 0, 0.34].forEach((x, idx) => draw(meshes.cone, { x, y: 1.96 + (idx === 1 ? 0.08 : 0), sx: 0.15, sy: 0.52, sz: 0.15 }, accent, root));
        break;
      case 'glasses':
        draw(meshes.torus, { x: -0.42, y: 0.28, z: 1.22, sx: 0.22, sy: 0.22, sz: 0.22 }, accent, root);
        draw(meshes.torus, { x: 0.38, y: 0.28, z: 1.22, sx: 0.22, sy: 0.22, sz: 0.22 }, accent, root);
        draw(meshes.box, { x: -0.02, y: 0.28, z: 1.22, sx: 0.10, sy: 0.018, sz: 0.02 }, accent, root);
        break;
      case 'batwings':
        draw(meshes.wing, { x: -1.15, y: 0.30, z: -0.35, ry: -0.28, sx: 1.25, sy: 1.25, sz: 1.25 }, accent, root);
        draw(meshes.wing, { x: 1.15, y: 0.30, z: -0.35, ry: 0.28, sx: -1.25, sy: 1.25, sz: 1.25 }, accent, root);
        break;
      case 'bow':
        draw(meshes.sphere, { x: -0.22, y: 1.23, z: 0.98, rz: 0.2, sx: 0.28, sy: 0.16, sz: 0.10 }, accent, root);
        draw(meshes.sphere, { x: 0.22, y: 1.23, z: 0.98, rz: -0.2, sx: 0.28, sy: 0.16, sz: 0.10 }, accent, root);
        draw(meshes.sphere, { y: 1.23, z: 1.02, sx: 0.10, sy: 0.10, sz: 0.08 }, accent, root);
        break;
      case 'sleepcap':
        draw(meshes.cone, { x: -0.13, y: 2.03, rz: 0.45, sx: 0.72, sy: 1.55, sz: 0.72 }, accent, root);
        draw(meshes.sphere, { x: 0.48, y: 2.58, sx: 0.14, sy: 0.14, sz: 0.14 }, hexToRgba('#ffffff'), root);
        break;
      case 'witchhat':
        draw(meshes.cylinder, { y: 1.62, sx: 1.02, sy: 0.08, sz: 1.02 }, accent, root);
        draw(meshes.cone, { x: 0.08, y: 2.30, rz: -0.12, sx: 0.62, sy: 1.58, sz: 0.62 }, accent, root);
        break;
      case 'halo':
        draw(meshes.torus, { y: 2.14, rx: Math.PI / 2, sx: 0.72, sy: 0.72, sz: 0.72 }, accent, root);
        break;
    }

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + elapsed * 0.18;
      const radius = 2.05;
      const y = -0.65 + (i % 4) * 0.72 + Math.sin(elapsed * 1.4 + i) * 0.12;
      draw(meshes.sphere, { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * 0.7, sx: 0.055, sy: 0.055, sz: 0.055 }, accent, root);
    }
  }

  let isPointerDown = false;
  let lastX = 0;
  let targetRotation = 0.35;
  let currentRotation = 0.35;

  canvas.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    lastX = event.clientX;
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup', () => { isPointerDown = false; });
  canvas.addEventListener('pointercancel', () => { isPointerDown = false; });
  canvas.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    targetRotation += dx * 0.012;
  });

  const start = performance.now();
  function frame(now) {
    resize();
    const elapsed = (now - start) / 1000;
    currentRotation += (targetRotation - currentRotation) * 0.09;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const bob = Math.sin(elapsed * 1.1) * 0.07;
    let root = mat4Translation(0, bob, 0);
    root = mat4Multiply(root, mat4RotationY(currentRotation + Math.sin(elapsed * 0.65) * 0.035));
    root = mat4Multiply(root, mat4RotationX(Math.sin(elapsed * 0.9) * 0.035));

    renderPumpkin(root, elapsed);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
