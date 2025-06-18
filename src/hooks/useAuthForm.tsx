
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateSignupForm = (username: string, email: string, password: string, confirmPassword: string) => {
    if (!username) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return false;
    }
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

  const validateSigninForm = (emailOrUsername: string, password: string) => {
    if (!emailOrUsername || !password) {
      setError('กรุณากรอกอีเมลหรือชื่อผู้ใช้และรหัสผ่าน');
      return false;
    }
    setError('');
    return true;
  };

  const handleSignUp = async (username: string, email: string, password: string, confirmPassword: string) => {
    if (!validateSignupForm(username, email, password, confirmPassword)) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username,
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

  const handleSignIn = async (emailOrUsername: string, password: string) => {
    if (!validateSigninForm(emailOrUsername, password)) return;
    
    setLoading(true);
    setError('');

    try {
      let email = emailOrUsername;
      
      // Check if input is username (not email format)
      if (!emailOrUsername.includes('@')) {
        console.log('Looking up email for username:', emailOrUsername);
        
        // Look up email by username from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();

        if (profileError) {
          console.error('Error looking up username:', profileError);
          setError('เกิดข้อผิดพลาดในการค้นหาชื่อผู้ใช้');
          return;
        }

        if (!profileData || !profileData.email) {
          setError('ไม่พบชื่อผู้ใช้นี้');
          return;
        }
        
        email = profileData.email;
      }

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
