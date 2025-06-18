
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateSignupForm = (email: string, password: string, confirmPassword: string) => {
    if (!email) {
      setError('กรุณากรอกอีเมล');
      return false;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    if (!confirmPassword) {
      setError('กรุณายืนยันรหัสผ่าน');
      return false;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return false;
    }
    setError('');
    return true;
  };

  const validateSigninForm = (email: string, password: string) => {
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return false;
    }
    setError('');
    return true;
  };

  const handleSignUp = async (email: string, password: string, confirmPassword: string) => {
    if (!validateSignupForm(email, password, confirmPassword)) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'user'
          }
        }
      });

      if (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        setError('');
        alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
      }
    } catch (error: any) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!validateSigninForm(email, password)) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        console.log('useAuthForm: Login successful:', data.user);
      }
    } catch (error: any) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('useAuthForm: Signing out user...');
    await supabase.auth.signOut();
  };

  const handleProfileClick = () => {
    console.log('useAuthForm: Navigating to profile...');
    navigate('/profile');
  };

  return {
    loading,
    error,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleProfileClick
  };
};
