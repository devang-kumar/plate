import { query } from "@/lib/db";
import PlateGenerator from "@/components/PlateGenerator";

export const dynamic = 'force-dynamic';

export default async function DrawingPage() {
  const templates = await query("SELECT * FROM templates");
  
  return <PlateGenerator templates={templates || []} />;
}
