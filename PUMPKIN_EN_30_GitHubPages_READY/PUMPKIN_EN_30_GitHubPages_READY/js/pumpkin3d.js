(function () {
  'use strict';

  const canvas = document.getElementById('pumpkinCanvas');
  const fallback = document.getElementById('pumpkinFallback');
  const pumpkin = window.__CURRENT_PUMPKIN;
  if (!canvas || !pumpkin) return;

  function showFallback(reason) {
    if (fallback) {
      fallback.hidden = false;
      fallback.dataset.renderer = 'fallback';
    }
    canvas.style.visibility = 'hidden';
    if (reason) console.warn('[Pumpkin renderer] fallback:', reason);
  }

  function markWebGLReady() {
    canvas.style.visibility = 'visible';
    if (fallback) {
      fallback.classList.add('webgl-ready');
      fallback.dataset.renderer = 'webgl';
    }
    document.documentElement.dataset.pumpkinRenderer = 'webgl';
  }

  try {
    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false
    });
    if (!gl) {
      showFallback('WebGL context unavailable');
      return;
    }

    const vertexSource = `
      attribute vec3 aPosition;
      uniform mat4 uMVP;
      void main(void) {
        gl_Position = uMVP * vec4(aPosition, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform vec4 uColor;
      void main(void) {
        gl_FragColor = uColor;
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compile failed';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
    }
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const uMVP = gl.getUniformLocation(program, 'uMVP');
    const uColor = gl.getUniformLocation(program, 'uColor');

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);

    function identity() {
      return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
      ]);
    }

    function multiply(a, b) {
      const out = new Float32Array(16);
      for (let c = 0; c < 4; c += 1) {
        for (let r = 0; r < 4; r += 1) {
          out[c * 4 + r] =
            a[0 * 4 + r] * b[c * 4 + 0] +
            a[1 * 4 + r] * b[c * 4 + 1] +
            a[2 * 4 + r] * b[c * 4 + 2] +
            a[3 * 4 + r] * b[c * 4 + 3];
        }
      }
      return out;
    }

    function translation(x, y, z) {
      const m = identity();
      m[12] = x || 0;
      m[13] = y || 0;
      m[14] = z || 0;
      return m;
    }

    function scale(x, y, z) {
      const m = identity();
      m[0] = x;
      m[5] = y;
      m[10] = z;
      return m;
    }

    function rotateX(rad) {
      const c = Math.cos(rad), s = Math.sin(rad);
      return new Float32Array([
        1,0,0,0,
        0,c,s,0,
        0,-s,c,0,
        0,0,0,1
      ]);
    }

    function rotateY(rad) {
      const c = Math.cos(rad), s = Math.sin(rad);
      return new Float32Array([
        c,0,-s,0,
        0,1,0,0,
        s,0,c,0,
        0,0,0,1
      ]);
    }

    function rotateZ(rad) {
      const c = Math.cos(rad), s = Math.sin(rad);
      return new Float32Array([
        c,s,0,0,
        -s,c,0,0,
        0,0,1,0,
        0,0,0,1
      ]);
    }

    function perspective(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      return new Float32Array([
        f / aspect,0,0,0,
        0,f,0,0,
        0,0,(far + near) * nf,-1,
        0,0,(2 * far * near) * nf,0
      ]);
    }

    function normalize(v) {
      const len = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / len, v[1] / len, v[2] / len];
    }

    function cross(a, b) {
      return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
      ];
    }

    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function lookAt(eye, center, up) {
      const z = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
      const x = normalize(cross(up, z));
      const y = cross(z, x);
      return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
      ]);
    }

    function transform(t) {
      let m = translation(t.x || 0, t.y || 0, t.z || 0);
      if (t.rx) m = multiply(m, rotateX(t.rx));
      if (t.ry) m = multiply(m, rotateY(t.ry));
      if (t.rz) m = multiply(m, rotateZ(t.rz));
      m = multiply(m, scale(
        t.sx == null ? 1 : t.sx,
        t.sy == null ? 1 : t.sy,
        t.sz == null ? 1 : t.sz
      ));
      return m;
    }

    function hex(hexValue, alpha) {
      let raw = String(hexValue || '#ffffff').replace('#', '');
      if (raw.length === 3) raw = raw.split('').map(ch => ch + ch).join('');
      const n = parseInt(raw, 16);
      return new Float32Array([
        ((n >> 16) & 255) / 255,
        ((n >> 8) & 255) / 255,
        (n & 255) / 255,
        alpha == null ? 1 : alpha
      ]);
    }

    function createMesh(positions, indices) {
      const mesh = {
        position: gl.createBuffer(),
        index: gl.createBuffer(),
        count: indices.length
      };
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      return mesh;
    }

    function sphereMesh(uSeg, vSeg) {
      const positions = [];
      const indices = [];
      uSeg = uSeg || 30;
      vSeg = vSeg || 20;
      for (let y = 0; y <= vSeg; y += 1) {
        const phi = (y / vSeg) * Math.PI;
        for (let x = 0; x <= uSeg; x += 1) {
          const theta = (x / uSeg) * Math.PI * 2;
          positions.push(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
          );
        }
      }
      for (let y = 0; y < vSeg; y += 1) {
        for (let x = 0; x < uSeg; x += 1) {
          const a = y * (uSeg + 1) + x;
          const b = a + uSeg + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return createMesh(positions, indices);
    }

    function cylinderMesh(topRadius, bottomRadius, height, segments) {
      topRadius = topRadius == null ? 1 : topRadius;
      bottomRadius = bottomRadius == null ? 1 : bottomRadius;
      height = height == null ? 1 : height;
      segments = segments || 24;
      const p = [];
      const idx = [];
      const half = height / 2;
      for (let ring = 0; ring < 2; ring += 1) {
        const r = ring === 0 ? bottomRadius : topRadius;
        const py = ring === 0 ? -half : half;
        for (let i = 0; i <= segments; i += 1) {
          const a = (i / segments) * Math.PI * 2;
          p.push(Math.cos(a) * r, py, Math.sin(a) * r);
        }
      }
      for (let i = 0; i < segments; i += 1) {
        const a = i;
        const b = i + segments + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
      return createMesh(p, idx);
    }

    function torusMesh(radius, tube, radial, tubular, start, arc) {
      radius = radius || 1;
      tube = tube || 0.12;
      radial = radial || 10;
      tubular = tubular || 30;
      start = start || 0;
      arc = arc == null ? Math.PI * 2 : arc;
      const p = [];
      const idx = [];
      for (let j = 0; j <= radial; j += 1) {
        const v = (j / radial) * Math.PI * 2;
        for (let i = 0; i <= tubular; i += 1) {
          const u = start + (i / tubular) * arc;
          const rr = radius + tube * Math.cos(v);
          p.push(rr * Math.cos(u), rr * Math.sin(u), tube * Math.sin(v));
        }
      }
      for (let j = 0; j < radial; j += 1) {
        for (let i = 0; i < tubular; i += 1) {
          const a = j * (tubular + 1) + i;
          const b = (j + 1) * (tubular + 1) + i;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return createMesh(p, idx);
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
      const idx = [];
      for (let f = 0; f < 6; f += 1) {
        const o = f * 4;
        idx.push(o,o+1,o+2,o,o+2,o+3);
      }
      return createMesh(p, idx);
    }

    function flatMesh(points) {
      const p = [0,0,0];
      const idx = [];
      points.forEach(pt => p.push(pt[0], pt[1], 0));
      for (let i = 0; i < points.length; i += 1) {
        idx.push(0, i + 1, ((i + 1) % points.length) + 1);
      }
      return createMesh(p, idx);
    }

    function starPoints() {
      const pts = [];
      for (let i = 0; i < 10; i += 1) {
        const r = i % 2 === 0 ? 1 : 0.48;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return pts;
    }

    const meshes = {
      sphere: sphereMesh(),
      cylinder: cylinderMesh(1, 1, 1, 24),
      cone: cylinderMesh(0.04, 1, 1, 24),
      torus: torusMesh(1, 0.12, 10, 30),
      smile: torusMesh(1, 0.13, 8, 20, Math.PI, Math.PI),
      frown: torusMesh(1, 0.13, 8, 20, 0, Math.PI),
      box: boxMesh(),
      star: flatMesh(starPoints()),
      leaf: flatMesh([[0.58,0],[0.20,0.24],[-0.52,0.10],[-0.20,-0.20]]),
      wing: flatMesh([[0,0],[-0.45,0.30],[-0.95,0.05],[-0.68,-0.18],[-0.82,-0.48],[-0.38,-0.32],[-0.15,-0.58]])
    };

    const camera = [0, 0.7, 7.0];
    const view = lookAt(camera, [0, 0.25, 0], [0, 1, 0]);
    let projection = identity();

    function draw(mesh, t, color, root) {
      let model = transform(t || {});
      if (root) model = multiply(root, model);
      const mvp = multiply(projection, multiply(view, model));
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniform4fv(uColor, color);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = Math.max(rect.width || 0, 320);
      const cssHeight = Math.max(rect.height || 0, 340);
      const width = Math.max(320, Math.floor(cssWidth * dpr));
      const height = Math.max(340, Math.floor(cssHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      projection = perspective(38 * Math.PI / 180, width / height, 0.1, 100);
    }

    function render(root, elapsed) {
      const shell = hex(pumpkin.palette.shell);
      const shell2 = hex(pumpkin.palette.shell2);
      const stem = hex(pumpkin.palette.stem);
      const accent = hex(pumpkin.palette.accent);
      const eye = hex(pumpkin.palette.eye);

      // Dark rear lobes first, then brighter front lobes for stronger 3D depth.
      for (let i = -3; i <= 3; i += 1) {
        const depth = Math.abs(i) * 0.035;
        draw(meshes.sphere, {
          x: i * 0.30,
          y: -0.03,
          z: -depth,
          sx: 0.80,
          sy: 0.95,
          sz: 1.02
        }, i % 2 === 0 ? shell2 : shell, root);
      }

      // Soft front highlight.
      draw(meshes.sphere, { x: 0.43, y: 0.30, z: 0.84, sx: 0.38, sy: 0.55, sz: 0.20 }, hex(pumpkin.palette.shell2, 0.32), root);

      draw(meshes.cylinder, { y: 1.48, rz: 0.22, sx: 0.20, sy: 0.72, sz: 0.20 }, stem, root);
      draw(meshes.torus, { x: 0.30, y: 1.38, z: 0.05, rx: 1.2, rz: -0.55, sx: 0.24, sy: 0.24, sz: 0.24 }, hex('#75b84f'), root);

      draw(meshes.sphere, { x: -0.42, y: 0.28, z: 1.02, sx: 0.13, sy: 0.16, sz: 0.07 }, eye, root);
      if (pumpkin.id === 3 || pumpkin.id === 8) {
        draw(meshes.box, { x: 0.38, y: 0.27, z: 1.03, rz: pumpkin.id === 3 ? -0.18 : 0, sx: 0.11, sy: 0.018, sz: 0.025 }, eye, root);
      } else {
        draw(meshes.sphere, { x: 0.38, y: 0.28, z: 1.02, sx: 0.13, sy: 0.16, sz: 0.07 }, eye, root);
      }
      draw(pumpkin.id === 6 ? meshes.frown : meshes.smile, { y: -0.18, z: 1.01, sx: 0.34, sy: 0.26, sz: 0.34 }, eye, root);

      switch (pumpkin.accessory) {
        case 'cape':
          draw(meshes.cone, { y: -0.30, z: -0.74, sx: 1.42, sy: 1.65, sz: 0.40, rx: Math.PI }, accent, root);
          break;
        case 'leaf':
          draw(meshes.leaf, { x: 0.50, y: 1.48, z: 0.10, rz: -0.45, sx: 0.72, sy: 0.66, sz: 0.70 }, accent, root);
          break;
        case 'star':
          draw(meshes.star, { x: 0.74, y: 0.76, z: 1.06, sx: 0.27, sy: 0.27, sz: 0.27, rz: elapsed * 0.25 }, accent, root);
          break;
        case 'crown':
          draw(meshes.cylinder, { y: 1.67, sx: 0.76, sy: 0.22, sz: 0.76 }, accent, root);
          [-0.34, 0, 0.34].forEach((x, idx) => {
            draw(meshes.cone, { x: x, y: 1.96 + (idx === 1 ? 0.08 : 0), sx: 0.15, sy: 0.52, sz: 0.15 }, accent, root);
          });
          break;
        case 'glasses':
          draw(meshes.torus, { x: -0.42, y: 0.28, z: 1.07, sx: 0.22, sy: 0.22, sz: 0.22 }, accent, root);
          draw(meshes.torus, { x: 0.38, y: 0.28, z: 1.07, sx: 0.22, sy: 0.22, sz: 0.22 }, accent, root);
          draw(meshes.box, { x: -0.02, y: 0.28, z: 1.07, sx: 0.10, sy: 0.018, sz: 0.02 }, accent, root);
          break;
        case 'batwings':
          draw(meshes.wing, { x: -1.15, y: 0.30, z: -0.35, ry: -0.28, sx: 1.25, sy: 1.25, sz: 1.25 }, accent, root);
          draw(meshes.wing, { x: 1.15, y: 0.30, z: -0.35, ry: 0.28, sx: -1.25, sy: 1.25, sz: 1.25 }, accent, root);
          break;
        case 'bow':
          draw(meshes.sphere, { x: -0.22, y: 1.23, z: 0.93, rz: 0.2, sx: 0.28, sy: 0.16, sz: 0.10 }, accent, root);
          draw(meshes.sphere, { x: 0.22, y: 1.23, z: 0.93, rz: -0.2, sx: 0.28, sy: 0.16, sz: 0.10 }, accent, root);
          draw(meshes.sphere, { y: 1.23, z: 0.97, sx: 0.10, sy: 0.10, sz: 0.08 }, accent, root);
          break;
        case 'sleepcap':
          draw(meshes.cone, { x: -0.13, y: 2.03, rz: 0.45, sx: 0.72, sy: 1.55, sz: 0.72 }, accent, root);
          draw(meshes.sphere, { x: 0.48, y: 2.58, sx: 0.14, sy: 0.14, sz: 0.14 }, hex('#ffffff'), root);
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
        draw(meshes.sphere, {
          x: Math.cos(angle) * 2.0,
          y: -0.70 + (i % 4) * 0.74 + Math.sin(elapsed * 1.4 + i) * 0.10,
          z: Math.sin(angle) * 0.55,
          sx: 0.055, sy: 0.055, sz: 0.055
        }, accent, root);
      }
    }

    let pointerDown = false;
    let lastX = 0;
    let targetRotation = 0.34;
    let currentRotation = 0.34;

    canvas.addEventListener('pointerdown', function (event) {
      pointerDown = true;
      lastX = event.clientX;
    });
    window.addEventListener('pointerup', function () { pointerDown = false; });
    window.addEventListener('pointercancel', function () { pointerDown = false; });
    window.addEventListener('pointermove', function (event) {
      if (!pointerDown) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      targetRotation += dx * 0.012;
    });

    let firstSuccessfulFrame = false;
    const start = performance.now();

    function frame(now) {
      resize();
      const elapsed = (now - start) / 1000;
      currentRotation += (targetRotation - currentRotation) * 0.09;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      let root = translation(0, Math.sin(elapsed * 1.1) * 0.07, 0);
      root = multiply(root, rotateY(currentRotation + Math.sin(elapsed * 0.65) * 0.035));
      root = multiply(root, rotateX(Math.sin(elapsed * 0.9) * 0.035));
      render(root, elapsed);

      const err = gl.getError();
      if (err !== gl.NO_ERROR) throw new Error('WebGL error: ' + err);

      if (!firstSuccessfulFrame) {
        firstSuccessfulFrame = true;
        markWebGLReady();
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  } catch (error) {
    console.error('[Pumpkin renderer]', error);
    showFallback(error && error.message ? error.message : String(error));
  }
})();
