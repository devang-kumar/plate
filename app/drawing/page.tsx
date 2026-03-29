import { query } from "@/lib/db";
import PlateGenerator from "@/components/PlateGenerator";

export default async function DrawingPage() {
  const templates = await query("SELECT * FROM templates");
  
  return <PlateGenerator templates={templates || []} />;
}
