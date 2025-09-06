import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allow" | "deny">("loading");

  useEffect(() => {
    (async () => {
      const { data: { session }, error: sErr } = await supabase.auth.getSession();
      if (sErr || !session) {
        setState("deny");
        return;
      }

      const uid = session.user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")     // ✅ ใช้ role
        .eq("id", uid)      // ✅ filter ด้วย eq
        .maybeSingle();

      if (error) {
        console.error("profiles error:", error);
        setState("deny");
        return;
      }

      setState(data?.role === "admin" ? "allow" : "deny");
    })();
  }, []);

  if (state === "loading") return <div className="p-10 text-center">กำลังตรวจสิทธิ์…</div>;
  if (state === "deny") return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
