"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Car, List, Globe, Plus, Edit, Trash2, X, RefreshCw, Video, Image as ImageIcon } from 'lucide-react';
import { saveTemplate, deleteTemplate, saveListing, deleteListing, saveEmirate, deleteEmirate } from '@/app/admin/actions';

export default function AdminDashboard({ 
  templates, 
  listings, 
  emirates 
}: { 
  templates: any[], 
  listings: any[], 
  emirates: any[] 
}) {
  const [section, setSection] = useState<'templates' | 'listings' | 'emirates'>('templates');
  const [modalType, setModalType] = useState<'template' | 'listing' | 'emirate' | null>(null);
  const [editingItem, setEditItem] = useState<any>(null);
  
  // Coordinate Picker State
  const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([]);
  const [previewMedia, setPreviewMedia] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const handleCoordClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedPoints.length >= 4 || !mediaRef.current) return;
    const rect = mediaRef.current.getBoundingClientRect();
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;
    
    const naturalWidth = mediaType === 'video' ? (mediaRef.current as HTMLVideoElement).videoWidth : (mediaRef.current as HTMLImageElement).naturalWidth;
    const naturalHeight = mediaType === 'video' ? (mediaRef.current as HTMLVideoElement).videoHeight : (mediaRef.current as HTMLImageElement).naturalHeight;

    const x = (displayX / rect.width) * naturalWidth;
    const y = (displayY / rect.height) * naturalHeight;
    setSelectedPoints([...selectedPoints, [x, y]]);
  };

  const closeModal = () => {
    setModalType(null);
    setEditItem(null);
    setSelectedPoints([]);
    setPreviewMedia('');
  };

  return (
    <div className="flex min-h-screen bg-bg-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-dark text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black text-primary-red tracking-tighter">PLATES.AE ADMIN</h1>
        </div>
        <nav className="flex-grow py-4">
          <button 
            onClick={() => setSection('templates')}
            className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition ${section === 'templates' ? 'bg-white/10 border-l-4 border-primary-red' : ''}`}
          >
            <Car size={20} /> Templates
          </button>
          <button 
            onClick={() => setSection('listings')}
            className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition ${section === 'listings' ? 'bg-white/10 border-l-4 border-primary-red' : ''}`}
          >
            <List size={20} /> Listings
          </button>
          <button 
            onClick={() => setSection('emirates')}
            className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition ${section === 'emirates' ? 'bg-white/10 border-l-4 border-primary-red' : ''}`}
          >
            <Globe size={20} /> Emirates
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {section === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-800">Manage Templates</h2>
              <button onClick={() => setModalType('template')} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add New Template
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(tmp => (
                <div key={tmp.id} className="card overflow-hidden group">
                  <div className="relative aspect-video bg-gray-100 mb-4 rounded-lg overflow-hidden">
                    {tmp.media_type === 'video' ? (
                      <video src={tmp.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={tmp.media_url} alt={tmp.type} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition gap-3">
                      <button onClick={() => { setEditItem(tmp); setModalType('template'); setSelectedPoints(JSON.parse(tmp.perspective_coords)); setPreviewMedia(tmp.media_url); setMediaType(tmp.media_type); }} className="p-3 bg-white text-gray-800 rounded-full hover:bg-primary-red hover:text-white transition">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => deleteTemplate(tmp.id)} className="p-3 bg-white text-gray-800 rounded-full hover:bg-red-600 hover:text-white transition">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-tight">{tmp.type}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase">{tmp.media_type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Section */}
        {section === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-800">Plate Listings</h2>
              <button onClick={() => setModalType('listing')} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add New Listing
              </button>
            </div>
            <div className="card !p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plate</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Emirate</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-black text-lg text-gray-800">{listing.plate_code} {listing.plate_number}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">{listing.emirate_name}</td>
                      <td className="px-6 py-4 text-sm font-black text-primary-red">AED {listing.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{listing.contact_info}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => { setEditItem(listing); setModalType('listing'); }} className="p-2 text-gray-400 hover:text-primary-red transition"><Edit size={18} /></button>
                        <button onClick={() => deleteListing(listing.id)} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Emirates Section */}
        {section === 'emirates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-800">Manage Emirates</h2>
              <button onClick={() => setModalType('emirate')} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Emirate
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {emirates.map(em => (
                <div key={em.id} className="card flex items-center justify-between group">
                  <span className="font-bold text-gray-800">{em.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => { setEditItem(em); setModalType('emirate'); }} className="p-2 text-gray-400 hover:text-primary-red transition"><Edit size={16} /></button>
                    <button onClick={() => deleteEmirate(em.id)} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {editingItem ? 'Edit' : 'Add New'} {modalType}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} /></button>
            </div>
            
            <form action={async (formData) => {
              if (modalType === 'template') await saveTemplate(formData);
              if (modalType === 'listing') await saveListing(formData);
              if (modalType === 'emirate') await saveEmirate(formData);
              closeModal();
            }} className="p-8 space-y-6">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
              
              {modalType === 'template' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Template Name</label>
                      <input name="type" defaultValue={editingItem?.type} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-red/20 font-bold" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Media Type</label>
                        <select name="media_type" value={mediaType} onChange={e => setMediaType(e.target.value as any)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold">
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Aspect Ratio</label>
                        <select name="aspect_ratio" defaultValue={editingItem?.plate_width || 4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold">
                          <option value="4">4:1 (Long)</option>
                          <option value="2">2:1 (Square)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Upload File</label>
                      <input type="file" name="media_file" accept={mediaType === 'image' ? 'image/*' : 'video/*'} className="w-full text-sm" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setPreviewMedia(URL.createObjectURL(file));
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">OR Media URL</label>
                      <input name="media_url" defaultValue={editingItem?.media_url} value={previewMedia} onChange={e => setPreviewMedia(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-red/20 font-medium" />
                    </div>
                    <input type="hidden" name="perspective_coords" value={JSON.stringify(selectedPoints)} />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Set Perspective Points ({selectedPoints.length}/4)</label>
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-crosshair border-2 border-dashed border-gray-200" onClick={handleCoordClick}>
                      {previewMedia && (
                        mediaType === 'video' ? (
                          <video ref={mediaRef as any} src={previewMedia} className="w-full h-full object-contain" muted autoPlay loop />
                        ) : (
                          <img ref={mediaRef as any} src={previewMedia} className="w-full h-full object-contain" />
                        )
                      )}
                      
                      {/* Visual Points Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
                          {selectedPoints.length > 0 && (
                            <polygon 
                              points={selectedPoints.map(p => {
                                const m = mediaRef.current;
                                if (!m) return '0,0';
                                const rect = m.getBoundingClientRect();
                                const nw = mediaType === 'video' ? (m as HTMLVideoElement).videoWidth : (m as HTMLImageElement).naturalWidth;
                                const nh = mediaType === 'video' ? (m as HTMLVideoElement).videoHeight : (m as HTMLImageElement).naturalHeight;
                                return `${(p[0] / nw) * rect.width},${(p[1] / nh) * rect.height}`;
                              }).join(' ')} 
                              fill="rgba(0,255,0,0.2)" 
                              stroke="#00ff00" 
                              strokeWidth="2" 
                            />
                          )}
                        </svg>
                        {selectedPoints.map((p, i) => {
                          const m = mediaRef.current;
                          if (!m) return null;
                          const rect = m.getBoundingClientRect();
                          const nw = mediaType === 'video' ? (m as HTMLVideoElement).videoWidth : (m as HTMLImageElement).naturalWidth;
                          const nh = mediaType === 'video' ? (m as HTMLVideoElement).videoHeight : (m as HTMLImageElement).naturalHeight;
                          return (
                            <div key={i} className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg" style={{ left: `${(p[0] / nw) * rect.width}px`, top: `${(p[1] / nh) * rect.height}px` }} />
                          );
                        })}
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedPoints([])} className="text-xs font-bold text-red-500 hover:underline">Reset Points</button>
                  </div>
                </div>
              )}

              {modalType === 'listing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plate Code</label>
                    <input name="plate_code" defaultValue={editingItem?.plate_code} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plate Number</label>
                    <input name="plate_number" defaultValue={editingItem?.plate_number} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Emirate</label>
                    <select name="emirate_id" defaultValue={editingItem?.emirate_id} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold">
                      {emirates.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price (AED)</label>
                    <input type="number" name="price" defaultValue={editingItem?.price} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-primary-red" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Contact Info</label>
                    <input name="contact_info" defaultValue={editingItem?.contact_info} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" required />
                  </div>
                </div>
              )}

              {modalType === 'emirate' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Emirate Name</label>
                  <input name="name" defaultValue={editingItem?.name} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" required />
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-gray-400 hover:text-gray-600 transition">Cancel</button>
                <button type="submit" className="btn-primary !px-10">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
