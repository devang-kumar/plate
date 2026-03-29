import { query } from "@/lib/db";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const templates = await query("SELECT * FROM templates");
  const emirates = await query("SELECT * FROM emirates");
  const listings = await query(`
    SELECT plate_listings.*, emirates.name as emirate_name 
    FROM plate_listings 
    LEFT JOIN emirates ON plate_listings.emirate_id = emirates.id
  `);

  return (
    <AdminDashboard 
      templates={templates || []} 
      listings={listings || []} 
      emirates={emirates || []} 
    />
  );
}
