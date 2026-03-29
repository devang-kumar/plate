import { query } from "@/lib/db";
import Link from "next/link";
import { Car, Tablet, ImagePlus, PlusCircle, Search } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const emirates = await query("SELECT * FROM emirates");
  const listings = await query(`
    SELECT plate_listings.*, emirates.name as emirate_name 
    FROM plate_listings 
    LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
    LIMIT 12
  `);
  return { emirates, listings };
}

export default async function HomePage() {
  const { emirates, listings } = await getHomeData();

  return (
    <div className="max-w-[680px] mx-auto px-2.5 py-4">
      {/* SERVICES */}
      <p className="text-center text-[#444] text-[14px] mb-3 font-normal">Services</p>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <Link href="/listings" className="bg-white border border-gray-200 rounded p-5 text-center transition-shadow hover:shadow-md group">
          <div className="w-[130px] h-[90px] mb-2 mx-auto flex items-center justify-center bg-gray-50 rounded">
            <Car size={48} className="text-primary-red" />
          </div>
          <h3 className="m-0 text-[13px] font-normal text-[#444]">Dubai number plates</h3>
        </Link>
        <Link href="/buy-tablet" className="bg-white border border-gray-200 rounded p-5 text-center transition-shadow hover:shadow-md">
          <div className="w-[130px] h-[90px] mb-2 mx-auto flex items-center justify-center bg-gray-50 rounded">
            <Tablet size={48} className="text-blue-500" />
          </div>
          <h3 className="m-0 text-[13px] font-normal text-[#444]">Buy a tablet online</h3>
        </Link>
        <Link href="/drawing" className="bg-white border border-gray-200 rounded p-5 text-center transition-shadow hover:shadow-md">
          <div className="w-[130px] h-[90px] mb-2 mx-auto flex items-center justify-center bg-gray-50 rounded">
            <ImagePlus size={48} className="text-green-500" />
          </div>
          <h3 className="m-0 text-[13px] font-normal text-[#444]">drawing numbers</h3>
        </Link>
        <Link href="/sell" className="bg-white border border-gray-200 rounded p-5 text-center transition-shadow hover:shadow-md">
          <div className="w-[130px] h-[90px] mb-2 mx-auto flex items-center justify-center bg-gray-50 rounded">
            <PlusCircle size={48} className="text-orange-500" />
          </div>
          <h3 className="m-0 text-[13px] font-normal text-[#444]">Sell your number</h3>
        </Link>
      </div>

      {/* VIEW ALL + PAINTINGS BADGE */}
      <div className="flex justify-between items-center mb-2.5">
        <Link href="/listings" className="text-[13px] text-[#333] italic hover:underline">View all</Link>
        <div className="flex items-center gap-1 text-[13px]">
          <span className="bg-primary-red text-white px-1.5 py-0.5 text-[12px] rounded-sm">paintings</span>
          <span className="bg-[#555] text-white px-1.5 py-0.5 text-[12px] rounded-sm">{listings.length}</span>
        </div>
      </div>

      {/* PLATE LISTINGS */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {listings.length > 0 ? (
          listings.map((plate: any) => (
            <div key={plate.id} className="bg-white border border-[#ccc] rounded-[3px] p-1.5">
              <div className="w-full h-[58px] border-2 border-[#aaa] rounded-[3px] flex overflow-hidden mb-1 bg-white">
                <div className="w-[52px] shrink-0 border-r border-[#bbb] flex flex-col items-center justify-center p-0.5">
                  <span className="text-[9px] text-[#333] font-bold leading-none mb-0.5 uppercase">
                    {(plate.emirate_name || 'Dubai').substring(0,3)}
                  </span>
                  <span className="text-[11px] font-black bg-gradient-to-b from-[#00a8cc] via-[#00a8cc] to-[#e91e8c] bg-clip-text text-transparent leading-none tracking-tight">
                    DUBAI
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center text-[28px] font-black text-[#111] tracking-[3px]">
                  <span className="text-[20px] font-normal text-[#555] mr-2">{plate.plate_code}</span>
                  <span>{plate.plate_number}</span>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-primary-red font-bold">{plate.contact_info || '0509080500'}</span>
                <span className="text-primary-red font-bold">AED {(plate.price || 0).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center py-5 text-[#777]">No plates listed yet.</p>
        )}
      </div>

      {/* VIEW ALL PAINTINGS */}
      <Link href="/paintings" className="block w-full bg-primary-red text-white text-center py-3 font-bold rounded-[3px] text-[14px] hover:bg-[#aa1111] transition-colors">
        View all paintings
      </Link>
    </div>
  );
}
