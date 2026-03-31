"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: number;
  type: string;
  media_url: string;
  media_type: 'image' | 'video';
  perspective_coords: string;
  plate_width?: number;
  aspect?: number;
  corners?: [number, number][];
}

interface PlateStyle {
  id: string;
  name: string;
  emirate: string;
  borderColor: string;
  type: string;
}

const STYLES: PlateStyle[] = [
  { id: 's1', name: 'Dubai Standard', emirate: 'Dubai', borderColor: '#e53935', type: 'dubai-white' },
  { id: 's2', name: 'Abu Dhabi', emirate: 'Abu Dhabi', borderColor: '#1A3A6B', type: 'ad-white' },
  { id: 's3', name: 'Sharjah', emirate: 'Sharjah', borderColor: '#006400', type: 'shj-white' },
  { id: 's4', name: 'Ajman', emirate: 'Ajman', borderColor: '#8B0000', type: 'ajm-white' },
];

export default function PlateGenerator({ templates: initialTemplates }: { templates: any[] }) {
  const templates: Template[] = initialTemplates.map(t => ({
    ...t,
    aspect: t.plate_width || 4,
    corners: t.perspective_coords ? JSON.parse(t.perspective_coords) : [[0, 0], [100, 0], [100, 50], [0, 50]],
  }));

  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [currentStyle, setCurrentStyle] = useState<PlateStyle>(STYLES[0]);
  const [plateNumber, setPlateNumber] = useState('12345');
  const [plateCode, setPlateCode] = useState('A');
  const [loading, setLoading] = useState(false);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoOverlayRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const renderPreview = useCallback(() => {
    if (!currentTemplate) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (currentTemplate.media_type === 'video') {
      renderVideoOverlay();
    } else {
      renderImagePreview();
    }
  }, [currentTemplate, currentStyle, plateNumber, plateCode]);

  useEffect(() => {
    if (currentTemplate) renderPreview();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [renderPreview]);

  /** Draw a polished, accurate UAE plate onto a canvas */
  const drawPlate = (canvas: HTMLCanvasElement, s: PlateStyle, num: string, code: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Metallic background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#fdfdfd');
    grad.addColorStop(0.15, '#f8f8f8');
    grad.addColorStop(0.5, '#ebebeb');
    grad.addColorStop(0.85, '#f5f5f5');
    grad.addColorStop(1, '#d8d8d8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    (ctx as any).roundRect?.(0, 0, W, H, H * 0.07) || ctx.rect(0, 0, W, H);
    ctx.fill();

    // Outer border shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = H * 0.045;
    ctx.beginPath();
    (ctx as any).roundRect?.(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth, H * 0.06) || ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.stroke();

    // Inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = H * 0.02;
    const il = ctx.lineWidth;
    ctx.beginPath();
    (ctx as any).roundRect?.(il * 2.5, il * 2.5, W - il * 5, H - il * 5, H * 0.05) || ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.stroke();

    if (s.type === 'dubai-white') {
      // ─── DUBAI plate (accurate layout) ───
      const sideW = W * 0.145;   // left column width
      const divX = sideW;

      // Left column background (white, separated by thin line)
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, sideW, H);

      // Left divider line
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(divX, H * 0.08); ctx.lineTo(divX, H * 0.92); ctx.stroke();

      // "UAE" flag strip — thin colored band at top of left col
      const flagH = H * 0.18;
      // Green
      ctx.fillStyle = '#009639';
      ctx.fillRect(0, 0, sideW * 0.18, flagH);
      // White
      ctx.fillStyle = '#fff';
      ctx.fillRect(sideW * 0.18, 0, sideW * 0.64, flagH);
      // Red
      ctx.fillStyle = '#EF3340';
      ctx.fillRect(sideW * 0.82, 0, sideW * 0.18, flagH);
      // Black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, flagH, sideW * 0.18, flagH * 0.6);

      // Emirate name "DUBAI" in left col (gradient text)
      ctx.textAlign = 'center';
      const emiGrad = ctx.createLinearGradient(sideW / 2, H * 0.35, sideW / 2, H * 0.65);
      emiGrad.addColorStop(0, '#00a8cc');
      emiGrad.addColorStop(0.49, '#00a8cc');
      emiGrad.addColorStop(0.5, '#e91e8c');
      emiGrad.addColorStop(1, '#e91e8c');
      ctx.fillStyle = emiGrad;
      ctx.font = `900 ${H * 0.22}px "Arial Black", Arial, sans-serif`;
      ctx.fillText('DUBAI', sideW / 2, H * 0.62);

      // Plate number area (right side)
      const numAreaX = divX + W * 0.03;

      // Code box (letter) — small red box
      const boxW = W * 0.1, boxH = H * 0.52;
      const boxX = numAreaX, boxY = H * 0.24;
      ctx.fillStyle = '#cc2222';
      ctx.beginPath();
      (ctx as any).roundRect?.(boxX, boxY, boxW, boxH, H * 0.05) || ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = `900 ${boxH * 0.65}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(code.toUpperCase().charAt(0), boxX + boxW / 2, boxY + boxH * 0.72);

      // Plate number (large)
      ctx.fillStyle = '#111';
      const numFontSize = H * 0.56;
      ctx.font = `900 ${numFontSize}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      const numX = boxX + boxW + W * 0.03;
      const maxNumW = W - numX - W * 0.03;
      let displayNum = num;
      ctx.font = `900 ${numFontSize}px "Arial Black", Arial, sans-serif`;
      while (ctx.measureText(displayNum).width > maxNumW && Number(ctx.font.split('px')[0].split(' ').pop()) > 20) {
        const fs = Number(ctx.font.split('px')[0].split(' ').pop()) - 2;
        ctx.font = `900 ${fs}px "Arial Black", Arial, sans-serif`;
      }
      ctx.fillText(displayNum, numX, H * 0.74);

    } else if (s.type === 'ad-white') {
      // ─── ABU DHABI ───
      const colW = W * 0.18;
      ctx.fillStyle = '#EF3340';
      ctx.fillRect(0, 0, colW, H);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${H * 0.13}px Arial`;
      ctx.textAlign = 'center';
      ctx.save(); ctx.translate(colW / 2, H / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText('ABU DHABI', 0, 0); ctx.restore();

      ctx.fillStyle = '#111';
      ctx.font = `900 ${H * 0.45}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(code.toUpperCase(), colW + W * 0.1, H * 0.68);
      ctx.font = `900 ${H * 0.6}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(num, colW + W * 0.22, H * 0.74);

    } else {
      // ─── Other Emirates ───
      ctx.fillStyle = s.borderColor;
      ctx.font = `900 ${H * 0.2}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.emirate.toUpperCase(), W * 0.12, H * 0.55);
      ctx.fillStyle = '#111';
      ctx.font = `900 ${H * 0.44}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(code.toUpperCase(), W * 0.28, H * 0.72);
      ctx.font = `900 ${H * 0.62}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(num, W * 0.37, H * 0.75);
    }

    // Gloss overlay
    const gloss = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    gloss.addColorStop(0, 'rgba(255,255,255,0.18)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, W, H * 0.5);
  };

  /** Perspective transform helpers */
  const getTransform = (src: [number,number][], dst: [number,number][]) => {
    const matrix: number[][] = [];
    for (let i = 0; i < 4; i++) {
      const [sx, sy] = src[i], [dx, dy] = dst[i];
      matrix.push([sx, sy, 1, 0, 0, 0, -sx*dx, -sy*dx, dx]);
      matrix.push([0, 0, 0, sx, sy, 1, -sx*dy, -sy*dy, dy]);
    }
    const n = 8, a = matrix.map(r => r.slice(0,8)), b = matrix.map(r => r[8]);
    for (let i = 0; i < n; i++) {
      let max = i;
      for (let j = i+1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[max][i])) max = j;
      [a[i],a[max]] = [a[max],a[i]]; [b[i],b[max]] = [b[max],b[i]];
      for (let j = i+1; j < n; j++) { const f = a[j][i]/a[i][i]; b[j] -= f*b[i]; for (let k=i;k<n;k++) a[j][k] -= f*a[i][k]; }
    }
    const x = new Array(n);
    for (let i=n-1;i>=0;i--) { let s=0; for (let j=i+1;j<n;j++) s+=a[i][j]*x[j]; x[i]=(b[i]-s)/a[i][i]; }
    return [...x, 1];
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, s0:[number,number], s1:[number,number], s2:[number,number], d0:[number,number], d1:[number,number], d2:[number,number]) => {
    const det = (s1[0]-s0[0])*(s2[1]-s0[1]) - (s2[0]-s0[0])*(s1[1]-s0[1]);
    if (Math.abs(det) < 1e-6) return;
    const a=((d1[0]-d0[0])*(s2[1]-s0[1])-(d2[0]-d0[0])*(s1[1]-s0[1]))/det;
    const b=((d2[0]-d0[0])*(s1[0]-s0[0])-(d1[0]-d0[0])*(s2[0]-s0[0]))/det;
    const c=((d1[1]-d0[1])*(s2[1]-s0[1])-(d2[1]-d0[1])*(s1[1]-s0[1]))/det;
    const d=((d2[1]-d0[1])*(s1[0]-s0[0])-(d1[1]-d0[1])*(s2[0]-s0[0]))/det;
    const e=d0[0]-a*s0[0]-b*s0[1], f=d0[1]-c*s0[0]-d*s0[1];
    ctx.save(); ctx.beginPath(); ctx.moveTo(d0[0],d0[1]); ctx.lineTo(d1[0],d1[1]); ctx.lineTo(d2[0],d2[1]); ctx.closePath();
    ctx.clip(); ctx.transform(a,c,b,d,e,f); ctx.drawImage(img,0,0); ctx.restore();
  };

  const drawPerspective = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, srcW: number, srcH: number, dst: [number,number][]) => {
    const [p0,p1,p2,p3] = dst;
    const h = getTransform([[0,0],[srcW,0],[srcW,srcH],[0,srcH]], [p0,p1,p2,p3]);
    const div = 10;
    for (let y=0;y<div;y++) for (let x=0;x<div;x++) {
      const s0:[number,number] = [x*srcW/div, y*srcH/div];
      const s1:[number,number] = [(x+1)*srcW/div, y*srcH/div];
      const s2:[number,number] = [(x+1)*srcW/div, (y+1)*srcH/div];
      const s3:[number,number] = [x*srcW/div, (y+1)*srcH/div];
      const proj = (p:[number,number]):[number,number] => { const w=h[6]*p[0]+h[7]*p[1]+1; return [(h[0]*p[0]+h[1]*p[1]+h[2])/w,(h[3]*p[0]+h[4]*p[1]+h[5])/w]; };
      drawTriangle(ctx, img, s0,s1,s3, proj(s0),proj(s1),proj(s3));
      drawTriangle(ctx, img, s1,s2,s3, proj(s1),proj(s2),proj(s3));
    }
  };

  const renderImagePreview = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !currentTemplate) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentTemplate.media_url;
    img.onload = () => {
      canvas.height = canvas.width * (img.height / img.width);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pH = 120, pW = pH * (currentTemplate.aspect || 4);
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = pW; plateCanvas.height = pH;
      drawPlate(plateCanvas, currentStyle, plateNumber, plateCode);
      const sx = canvas.width / img.naturalWidth, sy = canvas.height / img.naturalHeight;
      const sc = currentTemplate.corners!.map(p => [p[0]*sx, p[1]*sy] as [number,number]);
      drawPerspective(ctx, plateCanvas, pW, pH, sc);
      setLoading(false);
    };
    img.onerror = () => setLoading(false);
  };

  const renderVideoOverlay = () => {
    const video = videoRef.current, overlay = videoOverlayRef.current;
    if (!video || !overlay || !currentTemplate) return;
    const oCtx = overlay.getContext('2d');
    if (!oCtx) return;
    const pH = 120, pW = pH * (currentTemplate.aspect || 4);
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = pW; plateCanvas.height = pH;
    drawPlate(plateCanvas, currentStyle, plateNumber, plateCode);
    const step = () => {
      if (!currentTemplate || currentTemplate.media_type !== 'video') return;
      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      const sx = overlay.width / (video.videoWidth || 1), sy = overlay.height / (video.videoHeight || 1);
      const sc = currentTemplate.corners!.map(p => [p[0]*sx, p[1]*sy] as [number,number]);
      drawPerspective(oCtx, plateCanvas, pW, pH, sc);
      animFrameRef.current = requestAnimationFrame(step);
    };
    step();
  };

  const downloadImage = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    const tCtx = tmp.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(canvas, 0, 0);
    tCtx.font = 'bold 28px Arial';
    tCtx.fillStyle = 'rgba(255,255,255,0.65)';
    tCtx.textAlign = 'right';
    tCtx.shadowColor = 'rgba(0,0,0,0.4)';
    tCtx.shadowBlur = 4;
    tCtx.fillText('PLATES.AE', tmp.width - 20, tmp.height - 20);
    const a = document.createElement('a');
    a.download = `plate-${Date.now()}.png`;
    a.href = tmp.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="max-w-[1100px] mx-auto px-3 sm:px-5 py-5">
      <div className="text-center mb-6">
        <h2 className="text-[18px] sm:text-[24px] font-bold text-[#333] mb-4">Select a Vehicle to Preview Your Plate</h2>
        <Link
          href="/drawmultiemi"
          className="inline-block bg-primary-red text-white px-5 py-2.5 rounded font-bold hover:bg-[#aa1111] transition-colors text-sm sm:text-base"
        >
          Open Multi-Emirate Plate Maker
        </Link>
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {templates.map(tmp => (
          <div
            key={tmp.id}
            onClick={() => {
              setCurrentTemplate(tmp);
              setTimeout(() => document.getElementById('previewSection')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className={`bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow hover:shadow-md hover:-translate-y-0.5 ${currentTemplate?.id === tmp.id ? 'border-primary-red' : 'border-transparent'}`}
          >
            <div className="h-[160px] sm:h-[180px] w-full relative bg-gray-100">
              {tmp.media_type === 'video'
                ? <video src={tmp.media_url} className="w-full h-full object-cover" muted />
                : <img src={tmp.media_url} alt={tmp.type} className="w-full h-full object-cover" />}
            </div>
            <div className="p-3 text-center font-bold text-sm text-[#444]">{tmp.type}</div>
          </div>
        ))}
      </div>

      {/* Preview & Controls */}
      {currentTemplate && (
        <div id="previewSection" className="mt-4">
          <div className="bg-white p-4 sm:p-7 rounded-xl shadow-lg text-center relative">
            <div className="font-bold text-lg mb-3 text-[#333]">{currentTemplate.type}</div>

            <button
              onClick={downloadImage}
              className="mb-4 bg-[#555] text-white px-4 py-2 rounded font-bold hover:bg-[#444] transition flex items-center gap-2 mx-auto text-sm"
            >
              <Download size={16} /> Download with Watermark
            </button>

            {/* Canvas preview */}
            <div className="relative w-full bg-[#eee] rounded-lg overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                  <div className="w-8 h-8 border-4 border-primary-red/20 border-t-primary-red rounded-full animate-spin" />
                </div>
              )}
              <canvas
                ref={mainCanvasRef}
                width={1200} height={800}
                className="w-full h-auto"
                style={{ display: currentTemplate.media_type === 'video' ? 'none' : 'block' }}
              />
              {currentTemplate.media_type === 'video' && (
                <div className="relative w-full">
                  <video
                    ref={videoRef}
                    src={currentTemplate.media_url}
                    muted loop autoPlay
                    className="w-full h-auto"
                    onLoadedMetadata={e => {
                      if (videoOverlayRef.current) {
                        videoOverlayRef.current.width = e.currentTarget.clientWidth;
                        videoOverlayRef.current.height = e.currentTarget.clientHeight;
                        renderVideoOverlay();
                      }
                    }}
                  />
                  <canvas ref={videoOverlayRef} className="absolute top-0 left-0 pointer-events-none w-full h-full" />
                </div>
              )}
            </div>

            {/* Controls grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-6 border-t border-[#eee] text-left">
              {/* Style picker */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-2 tracking-wider">Emirate Style</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setCurrentStyle(s)}
                        className={`px-3 py-1.5 rounded border text-[13px] font-medium transition ${currentStyle.id === s.id ? 'bg-primary-red text-white border-primary-red' : 'bg-[#f0f0f0] border-[#ddd] text-[#333] hover:border-primary-red'}`}
                      >
                        {s.emirate}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPlateNumber(Math.floor(1000 + Math.random() * 90000).toString());
                    setPlateCode(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
                  }}
                  className="w-full bg-[#555] text-white py-2.5 rounded font-bold hover:bg-[#444] transition flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw size={16} /> Random Plate
                </button>
              </div>

              {/* Number inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-2 tracking-wider">Plate Code</label>
                  <input
                    type="text" maxLength={2} value={plateCode}
                    onChange={e => setPlateCode(e.target.value)}
                    className="w-full p-3 border border-[#ddd] rounded text-[18px] font-bold outline-none focus:border-primary-red transition"
                    placeholder="A"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#666] uppercase mb-2 tracking-wider">Plate Number</label>
                  <input
                    type="text" value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    className="w-full p-3 border border-[#ddd] rounded text-[18px] font-bold outline-none focus:border-primary-red transition"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">No vehicle templates added yet.</p>
          <Link href="/admin" className="text-primary-red text-sm font-bold hover:underline mt-2 inline-block">Go to Admin to add templates</Link>
        </div>
      )}
    </div>
  );
}
