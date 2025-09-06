import { supabase } from "@/integrations/supabase/client";

const BUCKET_ID = "banners"; // ✅ ใช้บัคเก็ต banners
type UploadOpts = { folder?: string; fileName?: string };

export const useImageUpload = () => {
  const uploadImage = async (file: File, opts: UploadOpts = {}) => {
    if (!file) throw new Error("No file to upload.");

    const folder = opts.folder ?? "category-banners";
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const name = opts.fileName ?? crypto.randomUUID();
    const path = `${folder}/${name}.${ext}`;

    const { error } = await supabase
      .storage
      .from(BUCKET_ID)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || `image/${ext}`,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET_ID).getPublicUrl(path);
    return data.publicUrl; // ส่ง URL สาธารณะกลับไปใช้แสดงผล
  };

  return { uploadImage };
};
