import { query } from "@/lib/db";
import Link from "next/link";
import { Search } from "lucide-react";

async function getListingsData(q?: string, emirate?: string, code?: string) {
  let sql = `
    SELECT plate_listings.*, emirates.name as emirate_name 
    FROM plate_listings 
    LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (q) {
    sql += ` AND (plate_number LIKE ? OR plate_code LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  if (emirate) {
    sql += ` AND emirate_id = ?`;
    params.push(emirate);
  }
  if (code) {
    sql += ` AND plate_code = ?`;
    params.push(code);
  }

  sql += " ORDER BY id DESC";
  return query(sql, params);
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { q?: string; emirate?: string; code?: string };
}) {
  const listings = await getListingsData(searchParams.q, searchParams.emirate, searchParams.code);
  const emirates = await query("SELECT * FROM emirates");

  return (
    <div className="max-w-[680px] mx-auto px-2.5 py-4">
      <div className="flex flex-col mb-6">
        <h1 className="text-center text-[#444] text-[18px] mb-4 font-normal uppercase tracking-tight">Plate Listings</h1>
        
        {/* Simple Filter Bar */}
        <form className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-wrap gap-2">
          <input 
            name="q" 
            defaultValue={searchParams.q}
            placeholder="Number..." 
            className="flex-grow px-3 py-2 border border-gray-200 rounded text-sm focus:border-primary-red outline-none"
          />
          <select name="emirate" defaultValue={searchParams.emirate} className="px-3 py-2 border border-gray-200 rounded text-sm focus:border-primary-red outline-none">
            <option value="">All Emirates</option>
            {emirates.map((em: any) => <option key={em.id} value={em.id}>{em.name}</option>)}
          </select>
          <button type="submit" className="bg-primary-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#aa1111] transition flex items-center gap-2">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-8">
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
          <div className="col-span-full py-12 text-center bg-white rounded border border-dashed border-gray-200">
            <Search size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-[#777] font-medium text-sm">No plates found matching your criteria.</p>
            <Link href="/listings" className="text-primary-red text-xs font-bold hover:underline mt-2 inline-block">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
