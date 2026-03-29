"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Smartphone, Phone, CreditCard, MessageSquare, Logo } from 'lucide-react';

const EMIRATES = [
  { name: 'DUBAI', color: '#e53935', short: 'DXB' },
  { name: 'ABU DHABI', color: '#1A3A6B', short: 'AUH' },
  { name: 'SHARJAH', color: '#006400', short: 'SHJ' },
  { name: 'AJMAN', color: '#8B0000', short: 'AJM' },
  { name: 'RAK', color: '#4B0082', short: 'RAK' },
  { name: 'FUJAIRAH', color: '#8B4513', short: 'FUJ' },
  { name: 'UAQ', color: '#2F4F4F', short: 'UAQ' }
];

export default function MultiEmirateMaker() {
  const [plateCode, setPlateCode] = useState('A');
  const [plateNumber, setPlateNumber] = useState('12345');
  const [price, setPrice] = useState('00,000 AED');
  const [contact, setContact] = useState('0500000000');
  const [comment, setComment] = useState('Call for more details');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [barColor, setBarColor] = useState('#0056b3');
  const [logoType, setLogoType] = useState('standard');

  const drawSinglePlate = (canvas: HTMLCanvasElement, emi: any) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Metallic Body Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.15, '#f9f9f9');
    grad.addColorStop(0.5, '#eeeeee');
    grad.addColorStop(0.85, '#f5f5f5');
    grad.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = grad;
    ctx.beginPath();
    (ctx as any).roundRect?.(0, 0, W, H, 6) || ctx.rect(0, 0, W, H);
    ctx.fill();

    // 2. Embossed Border
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, W - 6, H - 6);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // 3. Left Emirate Section
    const logoW = 100;
    if (logoType !== 'none') {
      ctx.fillStyle = logoType === 'vip' ? '#D4AF37' : emi.color;
      let emiFontSize = 18;
      ctx.font = '900 ' + emiFontSize + 'px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      let emiName = emi.name;
      let emiMetrics = ctx.measureText(emiName);
      if (emiMetrics.width > logoW - 15) {
        emiFontSize = Math.floor(emiFontSize * ((logoW - 15) / emiMetrics.width));
        ctx.font = '900 ' + emiFontSize + 'px "Arial Black", sans-serif';
      }
      ctx.fillText(emiName, logoW / 2, H / 2 + 6);
    }

    // Divider
    ctx.beginPath();
    ctx.moveTo(logoW, 12); ctx.lineTo(logoW, H - 12);
    ctx.strokeStyle = '#bbbbbb'; ctx.lineWidth = 1.5; ctx.stroke();

    // 4. Code & Number
    const maxCodeW = 60;
    const maxNumW = W - logoW - 80;
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.font = '300 48px Arial';
    let dCode = plateCode.toUpperCase();
    let cM = ctx.measureText(dCode);
    if (cM.width > maxCodeW) ctx.font = '300 ' + Math.floor(48 * (maxCodeW / cM.width)) + 'px Arial';
    ctx.fillText(dCode, logoW + 45, H / 2 + 15);

    ctx.font = '900 65px "Arial Black", sans-serif';
    let dNum = plateNumber;
    let nM = ctx.measureText(dNum);
    if (nM.width > maxNumW) ctx.font = '900 ' + Math.floor(65 * (maxNumW / nM.width)) + 'px "Arial Black", sans-serif';
    ctx.fillText(dNum, logoW + (W - logoW + 10) / 2, H / 2 + 20);

    // Reflection
    const refl = ctx.createLinearGradient(0, 0, W, H);
    refl.addColorStop(0, 'rgba(255,255,255,0)');
    refl.addColorStop(0.48, 'rgba(255,255,255,0)');
    refl.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    refl.addColorStop(0.52, 'rgba(255,255,255,0)');
    refl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = refl;
    ctx.fillRect(0, 0, W, H);
  };

  const downloadRowImage = (emi: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 110;
    drawSinglePlate(canvas, emi);
    const link = document.createElement('a');
    link.download = `${emi.name}-plate.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 items-start">
        {/* Controls Column */}
        <div className="space-y-5">
          {/* Step 1: Data */}
          <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-[#f8f9fa] border-l-4 border-primary-red p-3 -mx-6 -mt-6 mb-5 text-[#333] text-[18px] font-bold">
              Step 1: Fill Plate Data
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#666]">Plate Code</label>
                  <input 
                    type="text" 
                    value={plateCode} 
                    onChange={e => setPlateCode(e.target.value)}
                    className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none focus:border-primary-red"
                    placeholder="A"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#666]">Plate Number</label>
                  <input 
                    type="text" 
                    value={plateNumber} 
                    onChange={e => setPlateNumber(e.target.value)}
                    className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none focus:border-primary-red"
                    placeholder="12345"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#666]">Price (AED)</label>
                <input 
                  type="text" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)}
                  className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none focus:border-primary-red text-primary-red font-bold"
                  placeholder="00,000 AED"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#666]">Contact Number</label>
                <input 
                  type="text" 
                  value={contact} 
                  onChange={e => setContact(e.target.value)}
                  className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none focus:border-primary-red"
                  placeholder="0500000000"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Customization */}
          <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-[#f8f9fa] border-l-4 border-primary-red p-3 -mx-6 -mt-6 mb-5 text-[#333] text-[18px] font-bold">
              Step 2: Settings & Customization
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#666]">Communication & Comment</label>
                <textarea 
                  value={comment} 
                  onChange={e => setComment(e.target.value)}
                  className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none h-[60px] resize-none focus:border-primary-red"
                  placeholder="Add a comment..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#666]">Emirate Logo</label>
                <select 
                  value={logoType} 
                  onChange={e => setLogoType(e.target.value)}
                  className="p-2.5 border border-[#ddd] rounded text-[15px] outline-none focus:border-primary-red"
                >
                  <option value="standard">Standard Emirate Logo</option>
                  <option value="vip">VIP Gold Logo</option>
                  <option value="none">No Logo</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#666]">Background</label>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={e => setBgColor(e.target.value)}
                    className="h-[40px] w-full p-0.5 border border-[#ddd] cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#666]">Contact Bar</label>
                  <input 
                    type="color" 
                    value={barColor} 
                    onChange={e => setBarColor(e.target.value)}
                    className="h-[40px] w-full p-0.5 border border-[#ddd] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert('Please use individual download buttons for each plate.')}
            className="w-full bg-primary-red text-white p-4 rounded font-bold text-[16px] hover:bg-[#d32f2f] transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} /> Download Image
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:sticky lg:top-5">
          <div className="space-y-5 p-5 rounded-xl transition-colors duration-500" style={{ backgroundColor: bgColor }}>
            {EMIRATES.map((emi, i) => (
              <div key={i} className="bg-white p-5 rounded-xl flex flex-col md:flex-row items-center gap-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eee] hover:translate-y-[-2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all">
                <div className="shrink-0">
                  <canvas 
                    ref={el => { if (el) drawSinglePlate(el, emi); }}
                    width={480} height={110} 
                    className="w-full max-w-[400px] h-auto rounded border border-[#eee]" 
                  />
                </div>
                <div className="flex-grow flex flex-col gap-1 text-center md:text-left">
                  <div className="text-primary-red text-[22px] font-bold">
                    {price.includes('AED') ? price : `${price} AED`}
                  </div>
                  <div className="text-[#666] text-[13px] italic">{comment}</div>
                  <div 
                    className="mt-2 text-white px-4 py-2 rounded font-bold text-[15px] inline-block min-w-[150px] self-center md:self-start"
                    style={{ backgroundColor: barColor }}
                  >
                    {contact}
                  </div>
                </div>
                <div className="shrink-0">
                  <button 
                    onClick={() => downloadRowImage(emi)}
                    className="w-[45px] h-[45px] rounded-full bg-[#f0f0f0] border border-[#ddd] flex items-center justify-center hover:bg-primary-red hover:text-white hover:border-primary-red transition-all"
                    title={`Download ${emi.name} Plate`}
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
