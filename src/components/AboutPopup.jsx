// src/components/AboutPopup.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * AboutPopup with continuous upward auto-scroll (no visible scrollbar, no test button)
 *
 * Props:
 *  - open: boolean
 *  - onClose: fn
 *  - useCssFallback?: boolean  // optional: force CSS background instead of WebGL
 */
export default function AboutPopup({ open = false, onClose = () => {}, useCssFallback = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const glRef = useRef(null);
  const contentRef = useRef(null);
  const scrollStateRef = useRef({ running: false, lastTime: 0, offset: 0 });
  const [localOpen, setLocalOpen] = useState(open);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => setLocalOpen(open), [open]);

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  const [items, setItems] = useState(() => [
    { id: 1, html: "Hi — this is the About panel. You can paste more info here and it will scroll if long." },
    { id: 2, html: "• App Name: Mahalasa" },
    { id: 3, html: "• Developer: K. Madhav Bhakta" },
    { id: 4, html: "• Built with love — more info coming soon..." },
    {
      id: 5,
      html:
        `<strong>About Me</strong>
<p class="mb-2">I am Madhav Bhakta, a passionate Graphics Designer by profession, Photographer by heart, and Developer by curiosity.</p>
<p class="mb-2">Originally from the serene town of Kasaragod, Kerala, I am currently residing in Mangalore, Dakshina Kannada, Karnataka. With more than 30 years of experience in Designing and Printing Technology, I have witnessed the evolution of the creative industry — from traditional print methods to the modern digital era — and adapted myself to every transition with enthusiasm and dedication.</p>
<p class="mb-2">Professional Journey: My career began in the printing and design industry, where I honed my skills in layout design, branding, and pre-press technology. Over the decades, I have worked on a wide spectrum of projects, from corporate branding, advertising campaigns, packaging, and publishing to multimedia content creation.</p>
<p class="mb-2">I specialize in using industry-leading software such as:</p>
<ul class="list-disc pl-5 text-sm"><li>CorelDRAW – vector & print-ready layouts</li><li>Adobe Photoshop – photo editing & digital art</li><li>Adobe Illustrator – branding & scalable designs</li><li>Adobe After Effects – motion graphics & VFX</li></ul>
<p class="mb-2">Creative Identity & Values: Experience & Mastery, Adaptability, Creativity, Passion.</p>
<p class="mb-2">Beyond Work: A blend of cultures from Kerala and Karnataka inspires my design philosophy. Lifelong learning keeps my work fresh and impactful.</p>`
    },
  ]);

  // expose quick append helper (optional — harmless)
  useEffect(() => {
    window.__aboutPopup = {
      appendHtml: (html) => {
        setItems((s) => [...s, { id: Date.now(), html }]);
      },
    };
    return () => {
      try { delete window.__aboutPopup; } catch {}
    };
  }, []);

  // WebGL init (lightweight shader). If WebGL not available or useCssFallback, skip.
  useEffect(() => {
    if (!localOpen) return;
    if (useCssFallback || !hasWebGL()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" }) ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;
    glRef.current = gl;

    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fs = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;
      varying vec2 v_uv;
      float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 78.233); return fract(p.x * p.y); }
      void main() {
        vec2 uv = (v_uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);
        float d = length(uv);
        vec3 bg = mix(vec3(0.99,0.97,0.94), vec3(0.98,0.88,0.42), smoothstep(0.0, 1.3, d));
        vec2 p1 = vec2(0.35 * (fract(u_time * 0.02) - 0.5), -0.15);
        vec2 p2 = vec2(-0.25, 0.35 * (fract(u_time * 0.015 + 0.2) - 0.5));
        float b1 = 1.0 - smoothstep(0.0, 0.6, length(uv - p1));
        float b2 = 1.0 - smoothstep(0.0, 0.6, length(uv - p2));
        vec3 col = bg + (b1 * 0.12) * vec3(1.0, 0.95, 0.7) + (b2 * 0.08) * vec3(1.0, 0.85, 0.45);
        float n = (hash21(gl_FragCoord.xy * 0.01) - 0.5) * 0.02;
        col += n;
        col = clamp(col,0.0,1.0);
        gl_FragColor = vec4(col,1.0);
      }
    `;

    function compileShader(type, source) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vsh = compileShader(gl.VERTEX_SHADER, vs);
    const fsh = compileShader(gl.FRAGMENT_SHADER, fs);
    const program = gl.createProgram();
    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const DPR = 1;
    function resize() {
      const w = Math.max(1, Math.floor(canvas.clientWidth * DPR));
      const h = Math.max(1, Math.floor(canvas.clientHeight * DPR));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    let start = performance.now();
    function frame(now) {
      resize();
      const t = (now - start) * 0.001;
      gl.uniform1f(uTime, t * 0.6);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      try {
        gl.deleteBuffer(buf);
        gl.deleteProgram(program);
        gl.deleteShader(vsh);
        gl.deleteShader(fsh);
      } catch (e) {}
      glRef.current = null;
    };
  }, [localOpen, useCssFallback]);

  // CONTINUOUS AUTO-SCROLL logic (upwards)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    let animationId = null;
    const speed = 18; // pixels per second (configurable)

    function needsScroll() {
      return el.scrollHeight > el.clientHeight + 2;
    }

    function step(now) {
      if (!scrollStateRef.current.running) {
        scrollStateRef.current.lastTime = now;
        animationId = requestAnimationFrame(step);
        return;
      }

      const last = scrollStateRef.current.lastTime || now;
      const dt = Math.max(0, (now - last) / 1000);
      scrollStateRef.current.lastTime = now;

      if (!needsScroll()) {
        scrollStateRef.current.offset = 0;
        el.scrollTop = 0;
        animationId = requestAnimationFrame(step);
        return;
      }

      if (isHovering) {
        animationId = requestAnimationFrame(step);
        return;
      }

      scrollStateRef.current.offset += dt * speed;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (scrollStateRef.current.offset >= maxScroll) {
        scrollStateRef.current.offset = scrollStateRef.current.offset - maxScroll;
      }
      el.scrollTop = scrollStateRef.current.offset;
      animationId = requestAnimationFrame(step);
    }

    scrollStateRef.current.running = true;
    scrollStateRef.current.lastTime = performance.now();
    animationId = requestAnimationFrame(step);

    return () => {
      scrollStateRef.current.running = false;
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [items, isHovering, localOpen]);

  function handleMouseEnter() {
    setIsHovering(true);
  }
  function handleMouseLeave() {
    setIsHovering(false);
  }

  if (!localOpen) return null;
  const showCss = useCssFallback || !hasWebGL();

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* background */}
      {showCss ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(120deg,#fff7ed 0%, #fff1e0 30%, #fff7ed 60%, #fffaf0 100%)",
            backgroundSize: "300% 300%",
            animation: "css-gradient-shift 14s ease infinite",
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
      )}

      {/* centered card */}
      <div role="dialog" aria-modal="true" className="relative z-10 flex items-center justify-center min-h-full p-6">
        <div
          className="max-w-lg w-full rounded-2xl shadow-2xl p-6 text-center"
          style={{
            background: "linear-gradient(90deg,#f59e0b,#f97316)",
            color: "white",
            animation: "about-enter 420ms cubic-bezier(.2,.9,.2,1)",
          }}
        >
          <div className="text-2xl font-semibold mb-2">Mahalasa</div>
          <div className="text-sm opacity-95 mb-4">Developed and Designed by</div>

          {/* Auto-scrolling content area (scrollbar hidden) */}
          <div
            ref={contentRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="mx-auto max-h-56 overflow-auto px-3 py-2 rounded-md no-scrollbar"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "left",
            }}
          >
            {items.map((it) => (
              <div key={it.id} className="mb-3 text-sm text-white/90" dangerouslySetInnerHTML={{ __html: it.html }} />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded bg-white text-yellow-600 font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* helper styles */}
      <style>{`
        @keyframes about-enter {
          0% { opacity: 0; transform: translateY(8px) scale(0.96); }
          60% { opacity: 1; transform: translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes css-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* hide scrollbar cross-browser */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
