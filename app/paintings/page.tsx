import { query } from "@/lib/db";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function PaintingsPage() {
  const templates = await query("SELECT * FROM templates");

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8">
      <h1 className="text-center text-[#444] text-[18px] mb-8 font-normal uppercase tracking-tight">Car Paintings</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {templates.length > 0 ? (
          templates.map((tmp: any) => (
            <div key={tmp.id} className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all cursor-pointer">
              <div className="relative aspect-video">
                {tmp.media_type === 'video' ? (
                  <video src={tmp.media_url} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={tmp.media_url} alt={tmp.type} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 text-center">
                <span className="font-bold text-sm uppercase text-[#444] tracking-wider">{tmp.type}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No paintings available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
