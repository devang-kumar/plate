"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Smartphone, Car, Bike, Video } from 'lucide-react';
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
  { id: 's4', name: 'Ajman', emirate: 'Ajman', borderColor: '#8B0000', type: 'ajm-white' }
];

export default function PlateGenerator({ templates: initialTemplates }: { templates: any[] }) {
  const templates: Template[] = initialTemplates.map(t => ({
    ...t,
    aspect: t.plate_width || 4,
    corners: t.perspective_coords ? JSON.parse(t.perspective_coords) : [[0, 0], [100, 0], [100, 50], [0, 50]]
  }));

  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [currentStyle, setCurrentStyle] = useState<PlateStyle>(STYLES[0]);
  const [plateNumber, setPlateNumber] = useState('12345');
  const [plateCode, setPlateCode] = useState('A');
  
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoOverlayRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (currentTemplate) {
      renderPreview();
    }
  }, [currentTemplate, currentStyle, plateNumber, plateCode]);

  const renderPreview = () => {
    if (!currentTemplate) return;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    if (currentTemplate.media_type === 'video') {
      renderVideoOverlay();
    } else {
      renderImagePreview();
    }
  };

  const drawPlateInternal = (canvas: HTMLCanvasElement, s: PlateStyle, num: string, code: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Base Plate Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#fdfdfd');
    grad.addColorStop(0.2, '#f5f5f5');
    grad.addColorStop(0.5, '#e0e0e0');
    grad.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = grad;
    ctx.beginPath();
    // RoundRect shim for older environments or just use standard
    (ctx as any).roundRect?.(0, 0, W, H, 8) || ctx.rect(0, 0, W, H);
    ctx.fill();

    // 2. Embossed Plate Border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    // 3. Emirate Specific Layouts
    if (s.type === 'dubai-white') {
      // Top Center "DUBAI" with gradient effect
      ctx.textAlign = 'center';
      const dubaiGrad = ctx.createLinearGradient(0, 10, 0, 30);
      dubaiGrad.addColorStop(0, '#00a8cc');
      dubaiGrad.addColorStop(0.5, '#00a8cc');
      dubaiGrad.addColorStop(0.51, '#e91e8c');
      dubaiGrad.addColorStop(1, '#e91e8c');
      ctx.fillStyle = dubaiGrad;
      ctx.font = '900 22px "Arial Black", sans-serif';
      ctx.fillText('DUBAI', W / 2, 28);
      
      // Category Box
      const boxW = 55, boxH = 45;
      const boxX = 20, boxY = H / 2 - boxH / 2 + 5;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      (ctx as any).roundRect?.(boxX, boxY, boxW, boxH, 4) || ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      
      // Code inside box
      ctx.fillStyle = 'white';
      ctx.font = '900 32px "Arial Black", sans-serif';
      ctx.fillText(code.toUpperCase(), boxX + boxW / 2, boxY + boxH / 2 + 12);

      // Numbers
      ctx.fillStyle = '#111';
      ctx.font = '900 75px "Arial Black", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(num, 95, H / 2 + 25);
    } else if (s.type === 'ad-white') {
      ctx.fillStyle = '#c62828';
      ctx.fillRect(10, 10, 60, H - 20);
      ctx.fillStyle = 'white';
      ctx.font = '900 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ABU DHABI', 40, H / 2 + 5);
      ctx.fillStyle = '#111';
      ctx.font = '900 70px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(num, (W + 70) / 2, H / 2 + 25);
    } else {
      const logoW = 85;
      ctx.fillStyle = s.borderColor;
      ctx.font = '900 18px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.emirate.toUpperCase(), logoW / 2, H / 2 + 7);
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.font = '900 32px "Arial Black", sans-serif';
      ctx.fillText(code.toUpperCase(), logoW + 45, H / 2 + 15);
      ctx.font = '900 70px "Arial Black", sans-serif';
      ctx.fillText(num, logoW + 200, H / 2 + 25);
    }

    // Environmental Effects
    const shine = ctx.createLinearGradient(0, 0, W, H);
    shine.addColorStop(0, 'rgba(255,255,255,0)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, 0); ctx.lineTo(W * 0.6, 0); ctx.lineTo(W * 0.4, H); ctx.lineTo(W * 0.1, H);
    ctx.fill();
  };

  const drawPerspective = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, srcW: number, srcH: number, dst: [number, number][]) => {
    const [p0, p1, p2, p3] = dst;
    function getTransform(src: [number, number][], dst: [number, number][]) {
      const matrix: number[][] = [];
      for (let i = 0; i < 4; i++) {
        const [sx, sy] = src[i];
        const [dx, dy] = dst[i];
        matrix.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx, dx]);
        matrix.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy, dy]);
      }
      const n = 8;
      const a = matrix.map(row => row.slice(0, 8));
      const b = matrix.map(row => row[8]);
      for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[max][i])) max = j;
        [a[i], a[max]] = [a[max], a[i]];
        [b[i], b[max]] = [b[max], b[i]];
        for (let j = i + 1; j < n; j++) {
          const factor = a[j][i] / a[i][i];
          b[j] -= factor * b[i];
          for (let k = i; k < n; k++) a[j][k] -= factor * a[i][k];
        }
      }
      const x = new Array(n);
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) sum += a[i][j] * x[j];
        x[i] = (b[i] - sum) / a[i][i];
      }
      return [...x, 1];
    }

    const h = getTransform([[0, 0], [srcW, 0], [srcW, srcH], [0, srcH]], [p0, p1, p2, p3]);
    const div = 8;
    for (let y = 0; y < div; y++) {
      for (let x = 0; x < div; x++) {
        const s0: [number, number] = [x * srcW / div, y * srcH / div];
        const s1: [number, number] = [(x + 1) * srcW / div, y * srcH / div];
        const s2: [number, number] = [(x + 1) * srcW / div, (y + 1) * srcH / div];
        const s3: [number, number] = [x * srcW / div, (y + 1) * srcH / div];
        const project = (p: [number, number]): [number, number] => {
          const w = h[6] * p[0] + h[7] * p[1] + 1;
          return [(h[0] * p[0] + h[1] * p[1] + h[2]) / w, (h[3] * p[0] + h[4] * p[1] + h[5]) / w];
        };
        drawTriangle(ctx, img, s0, s1, s3, project(s0), project(s1), project(s3));
        drawTriangle(ctx, img, s1, s2, s3, project(s1), project(s2), project(s3));
      }
    }
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, s0: [number, number], s1: [number, number], s2: [number, number], d0: [number, number], d1: [number, number], d2: [number, number]) => {
    const det = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
    if (Math.abs(det) < 1e-6) return;
    const a = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / det;
    const b = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / det;
    const c = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / det;
    const d = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / det;
    const e = d0[0] - a * s0[0] - b * s0[1];
    const f = d0[1] - c * s0[0] - d * s0[1];
    ctx.save();
    ctx.beginPath(); ctx.moveTo(d0[0], d0[1]); ctx.lineTo(d1[0], d1[1]); ctx.lineTo(d2[0], d2[1]); ctx.closePath();
    ctx.clip(); ctx.transform(a, c, b, d, e, f); ctx.drawImage(img, 0, 0); ctx.restore();
  };

  const renderImagePreview = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !currentTemplate) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentTemplate.media_url;
    img.onload = () => {
      const aspect = img.height / img.width;
      canvas.height = canvas.width * aspect;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const plateCanvas = document.createElement('canvas');
      const plateH = 100;
      const plateW = plateH * (currentTemplate.aspect || 4);
      plateCanvas.width = plateW;
      plateCanvas.height = plateH;
      drawPlateInternal(plateCanvas, currentStyle, plateNumber, plateCode);

      const scaleX = canvas.width / img.naturalWidth;
      const scaleY = canvas.height / img.naturalHeight;
      const scaledCorners = currentTemplate.corners!.map(p => [p[0] * scaleX, p[1] * scaleY] as [number, number]);
      drawPerspective(ctx, plateCanvas, plateW, plateH, scaledCorners);
    };
  };

  const renderVideoOverlay = () => {
    const video = videoRef.current;
    const overlay = videoOverlayRef.current;
    if (!video || !overlay || !currentTemplate) return;
    const oCtx = overlay.getContext('2d');
    if (!oCtx) return;

    const plateCanvas = document.createElement('canvas');
    const plateH = 100;
    const plateW = plateH * (currentTemplate.aspect || 4);
    plateCanvas.width = plateW;
    plateCanvas.height = plateH;
    drawPlateInternal(plateCanvas, currentStyle, plateNumber, plateCode);

    const step = () => {
      if (!currentTemplate || currentTemplate.media_type !== 'video') return;
      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      const scaleX = overlay.width / video.videoWidth;
      const scaleY = overlay.height / video.videoHeight;
      const scaledCorners = currentTemplate.corners!.map(p => [p[0] * scaleX, p[1] * scaleY] as [number, number]);
      drawPerspective(oCtx, plateCanvas, plateW, plateH, scaledCorners);
      animationFrameId.current = requestAnimationFrame(step);
    };
    step();
  };

  const downloadImage = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(canvas, 0, 0);
    const watermarkText = "PLATES.AE";
    tCtx.font = "bold 30px Arial";
    tCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
    tCtx.textAlign = "right";
    tCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
    tCtx.shadowBlur = 4;
    tCtx.fillText(watermarkText, tempCanvas.width - 30, tempCanvas.height - 30);

    const link = document.createElement('a');
    link.download = `plate-preview-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-5">
      <div className="text-center mb-10">
        <h2 className="text-[24px] font-bold text-[#333] mb-5">Select a Vehicle to Start</h2>
        <Link href="/drawmultiemi" className="inline-block bg-primary-red text-white px-6 py-3 rounded font-bold hover:bg-[#aa1111] transition-colors mb-8">
          Open Multi Emirate Maker
        </Link>
      </div>

      {/* Step 1: Vehicle Selection Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mb-10">
        {templates.map(tmp => (
          <div 
            key={tmp.id}
            onClick={() => {
              setCurrentTemplate(tmp);
              setTimeout(() => {
                document.getElementById('previewSection')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className={`bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentTemplate?.id === tmp.id ? 'border-primary-red' : 'border-transparent'}`}
          >
            <div className="h-[180px] w-full relative">
              {tmp.media_type === 'video' ? (
                <video src={tmp.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={tmp.media_url} alt={tmp.type} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3 text-center font-bold">{tmp.type}</div>
          </div>
        ))}
      </div>

      {/* Step 2: Live Preview & Editing */}
      {currentTemplate && (
        <div id="previewSection" className="mt-5">
          <div className="bg-white p-7 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-center mb-8 relative">
            <div className="font-bold text-xl mb-4">{currentTemplate.type}</div>
            
            <div className="mb-5">
              <button 
                onClick={downloadImage}
                className="bg-[#555] text-white px-5 py-2.5 rounded font-bold hover:bg-[#444] transition-colors inline-flex items-center gap-2"
              >
                <Download size={18} /> Download Preview with Watermark
              </button>
            </div>

            <div className="relative w-full bg-[#eee] rounded-lg overflow-hidden">
              <canvas 
                ref={mainCanvasRef} 
                width={1200} 
                height={800} 
                className="w-full h-auto object-contain" 
                style={{ display: currentTemplate.media_type === 'video' ? 'none' : 'block' }} 
              />
              {currentTemplate.media_type === 'video' && (
                <div className="relative w-full">
                  <video 
                    ref={videoRef} 
                    src={currentTemplate.media_url} 
                    muted loop autoPlay 
                    className="w-full h-auto object-contain"
                    onLoadedMetadata={(e) => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-7 pt-7 border-t border-[#eee] text-left">
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#666] uppercase mb-2">Choose Emirate Style</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setCurrentStyle(s)}
                        className={`px-4 py-2 rounded border text-[14px] transition-colors ${currentStyle.id === s.id ? 'bg-primary-red text-white border-primary-red' : 'bg-[#f0f0f0] border-[#ddd] text-[#333]'}`}
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
                  className="w-full bg-[#555] text-white py-3 rounded font-bold hover:bg-[#444] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Generate Random Number
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#666] uppercase mb-2">Plate Code</label>
                  <input 
                    type="text" 
                    value={plateCode} 
                    onChange={e => setPlateCode(e.target.value)}
                    className="w-full p-3 border border-[#ddd] rounded text-[18px] font-bold outline-none focus:border-primary-red transition-colors"
                    placeholder="A"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#666] uppercase mb-2">Plate Number</label>
                  <input 
                    type="text" 
                    value={plateNumber} 
                    onChange={e => setPlateNumber(e.target.value)}
                    className="w-full p-3 border border-[#ddd] rounded text-[18px] font-bold outline-none focus:border-primary-red transition-colors"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
