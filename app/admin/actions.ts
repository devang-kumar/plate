"use server";

import { run, query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

// Template Actions
export async function saveTemplate(formData: FormData) {
  const id = formData.get('id') as string;
  const type = formData.get('type') as string;
  const media_type = formData.get('media_type') as string;
  const aspect_ratio = formData.get('aspect_ratio') as string;
  const perspective_coords = formData.get('perspective_coords') as string;
  let media_url = formData.get('media_url') as string;
  
  const file = formData.get('media_file') as File;
  if (file && file.size > 0) {
    const blob = await put(file.name, file, { access: 'public' });
    media_url = blob.url;
  }

  if (id) {
    await run(
      "UPDATE templates SET type = ?, media_url = ?, perspective_coords = ?, plate_width = ?, media_type = ? WHERE id = ?",
      [type, media_url, perspective_coords, aspect_ratio, media_type, id]
    );
  } else {
    await run(
      "INSERT INTO templates (type, media_url, perspective_coords, plate_width, media_type) VALUES (?, ?, ?, ?, ?)",
      [type, media_url, perspective_coords, aspect_ratio, media_type]
    );
  }
  
  revalidatePath('/admin');
  revalidatePath('/drawing');
}

export async function deleteTemplate(id: number) {
  await run("DELETE FROM templates WHERE id = ?", [id]);
  revalidatePath('/admin');
  revalidatePath('/drawing');
}

// Listing Actions
export async function saveListing(formData: FormData) {
  const id = formData.get('id') as string;
  const plate_number = formData.get('plate_number') as string;
  const plate_code = formData.get('plate_code') as string;
  const emirate_id = formData.get('emirate_id') as string;
  const price = formData.get('price') as string;
  const contact_info = formData.get('contact_info') as string;

  if (id) {
    await run(
      "UPDATE plate_listings SET plate_number = ?, plate_code = ?, emirate_id = ?, price = ?, contact_info = ? WHERE id = ?",
      [plate_number, plate_code, emirate_id, price, contact_info, id]
    );
  } else {
    await run(
      "INSERT INTO plate_listings (plate_number, plate_code, emirate_id, price, contact_info) VALUES (?, ?, ?, ?, ?)",
      [plate_number, plate_code, emirate_id, price, contact_info]
    );
  }
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteListing(id: number) {
  await run("DELETE FROM plate_listings WHERE id = ?", [id]);
  revalidatePath('/admin');
  revalidatePath('/');
}

// Emirate Actions
export async function saveEmirate(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  if (id) {
    await run("UPDATE emirates SET name = ? WHERE id = ?", [name, id]);
  } else {
    await run("INSERT INTO emirates (name) VALUES (?)", [name]);
  }
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteEmirate(id: number) {
  await run("DELETE FROM emirates WHERE id = ?", [id]);
  revalidatePath('/admin');
}
