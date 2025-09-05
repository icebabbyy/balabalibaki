import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AdminOnly({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        setOk(false);
        setChecking(false);
        navigate("/login");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (error || !data?.is_admin) {
        setOk(false);
        setChecking(false);
        navigate("/"); // ไม่ใช่แอดมิน เตะกลับหน้าแรก
        return;
      }
      setOk(true);
      setChecking(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-600" />
      </div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
}
