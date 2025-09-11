'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function LogoBarsWave({
  src,
  height = 300,
  paddingY,
  bars = 160,
  background = 'transparent',
  fit = 'contain',       // contain | cover | stretch
  amplitude = 50,
  frequency = 0.02,
  baseSpeed = 1,
  hoverRadius = 200,
  falloff = 0.008,
  maxSpeed = 3,
  accelRate = 1.2,       // montée vitesse en appui
  releaseRate = 0.2,     // descente vitesse au relâchement
  idleInfluence = 0.12,  // micro-mouvement au repos (0 = totalement à l’arrêt)
}) {
  const padYProp = paddingY ?? amplitude;

  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const rafRef = useRef(null);
  const [img, setImg] = useState(null);

  // pointeur + lissages + vitesse
  const mouseRef = useRef({ x: 0, y: 0, inside: false, holding: false });
  const smoothRef = useRef({
    x: 0, y: 0,
    influence: idleInfluence, targetInfluence: idleInfluence,
    speed: baseSpeed, targetSpeed: baseSpeed,
  });
  const holdRef = useRef({ t: 0 }); // temps d’appui cumulé

  // charge l'image
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    const onLoad = () => setImg(image);
    image.addEventListener('load', onLoad);
    return () => image.removeEventListener('load', onLoad);
  }, [src]);

  // offscreen (une fois)
  useEffect(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
  }, []);

  // responsive largeur (100%)
  useEffect(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (!canvas || !offscreen) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth || window.innerWidth;
      const cssHeight = height + 2 * padYProp;

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.height = `${cssHeight}px`;

      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [height, padYProp]);

  // souris + maintenir
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.width / r.width;
      const sy = canvas.height / r.height;
      mouseRef.current.x = (e.clientX - r.left) * sx;
      mouseRef.current.y = (e.clientY - r.top) * sy;
    };
    const onEnter = () => {
      mouseRef.current.inside = true;
      smoothRef.current.targetInfluence = 1; // hover ON
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
      mouseRef.current.holding = false;
      smoothRef.current.targetInfluence = idleInfluence; // retour idle
    };


    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [idleInfluence]);

  // init vitesse quand baseSpeed change
  useEffect(() => {
    smoothRef.current.speed = baseSpeed;
    smoothRef.current.targetSpeed = baseSpeed;
  }, [baseSpeed]);

  // animation principale (sans phases)
  useEffect(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (!canvas || !offscreen) return;

    const ctx = canvas.getContext('2d');
    const octx = offscreen.getContext('2d');

    let last = performance.now();

    function drawLogoToOffscreen(totalW, totalH, dpr) {
      octx.setTransform(1, 0, 0, 1, 0, 0);
      if (background !== 'transparent') {
        octx.fillStyle = background;
        octx.fillRect(0, 0, totalW, totalH);
      } else {
        octx.clearRect(0, 0, totalW, totalH);
      }
      if (!img) return;

      const padY = Math.round(padYProp * dpr);
      const innerH = totalH - 2 * padY;

      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      let dw = totalW, dh = innerH, dx = 0, dy = padY;

      if (fit === 'contain') {
        const s = Math.min(totalW / iw, innerH / ih);
        dw = iw * s; dh = ih * s;
        dx = (totalW - dw) / 2;
        dy = padY + (innerH - dh) / 2;
      } else if (fit === 'cover') {
        const s = Math.max(totalW / iw, innerH / ih);
        dw = iw * s; dh = ih * s;
        dx = (totalW - dw) / 2;
        dy = padY + (innerH - dh) / 2;
      }
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';
      octx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
    }

    const render = (now) => {
      rafRef.current = requestAnimationFrame(render);

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dpr = window.devicePixelRatio || 1;
      const totalW = canvas.width;
      const totalH = canvas.height;
      const padY = Math.round(padYProp * dpr);
      const innerH = totalH - 2 * padY;

      if (img) drawLogoToOffscreen(totalW, totalH, dpr);

      // fond destination
      if (background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, totalW, totalH);
      } else {
        ctx.clearRect(0, 0, totalW, totalH);
      }

      const S = smoothRef.current;
      const M = mouseRef.current;

      // ====== lissages ======
      // souris lissée
      const mouseEase = 10;
      const aMouse = 1 - Math.exp(-mouseEase * dt);
      S.x += (M.x - S.x) * aMouse;
      S.y += (M.y - S.y) * aMouse;

      // influence lissée (idle <-> hover)
      const hoverEase = 6;
      const aInf = 1 - Math.exp(-hoverEase * dt);
      S.influence += (S.targetInfluence - S.influence) * aInf;

      // vitesse selon appui
      if (M.holding) {
        holdRef.current.t += dt;
      } else {
        holdRef.current.t = Math.max(0, holdRef.current.t - dt * releaseRate);
      }
      const accelProgress = 1 - Math.exp(-accelRate * holdRef.current.t);
      const targetSpeed = baseSpeed + (maxSpeed - baseSpeed) * accelProgress;

      const speedEase = 3.5;
      const aSpeed = 1 - Math.exp(-speedEase * dt);
      S.speed += (targetSpeed - S.speed) * aSpeed;

      // ====== dessin des barres ======
const barCount = Math.max(1, Math.floor(bars));      const barW = totalW / barCount;

      for (let i = 0; i < barCount; i++) {
  // bornes source ET destination identiques, à l’entier près
  const sx = Math.floor((i    ) * totalW / barCount);
  const sxNext = Math.floor((i + 1) * totalW / barCount);
  const sw = Math.max(1, sxNext - sx);

  const dx = sx;
  const dw = sw;

  const distX = Math.abs(S.x - (dx + dw * 0.5));
  const fall = Math.exp(-Math.max(0, distX - hoverRadius * dpr) * (falloff / dpr));

  const phase = (now / 1000) * 3 * S.speed + i * frequency * 10;
  const offset = Math.sin(phase) * (amplitude * dpr) * fall * S.influence;

  const sy = padY;
  const sh = innerH;
  const dy = Math.max(-padY, Math.min(padY, offset));

  ctx.drawImage(offscreen, sx, sy, sw, sh, dx, sy + dy, dw, sh);
}
    };

    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [
    img, bars, amplitude, frequency, baseSpeed, maxSpeed, accelRate, releaseRate,
    hoverRadius, falloff, background, fit, padYProp
  ]);

  return (
    <canvas
    className='px-4'
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: `${height + 2 * padYProp}px`,
        cursor: 'pointer',
      }}
    />
  );
}
