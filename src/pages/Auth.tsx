import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import AuthDebug from "@/components/AuthDebug";

const Auth = () => {
  // Separate state for signin and signup
  const [signinData, setSigninData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      console.log('Auth page: Checking existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth page - Session:', session);
      
      if (session?.user) {
        console.log('Auth page: User already logged in, setting user state');
        setUser(session.user);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth page - Auth state changed:', event, session?.user);
      setUser(session?.user ?? null);
      if (session?.user && event === 'SIGNED_IN') {
        console.log('Auth page: User signed in, redirecting to home');
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateSignupForm = () => {
    if (!signupData.email) {
      setError('กรุณากรอกอีเมล');
      return false;
    }
    if (!signupData.password) {
      setError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    if (signupData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    if (!signupData.confirmPassword) {
      setError('กรุณายืนยันรหัสผ่าน');
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return false;
    }
    setError('');
    return true;
  };

  const validateSigninForm = () => {
    if (!signinData.email || !signinData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return false;
    }
    setError('');
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
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
        // Reset form after successful signup
        setSignupData({ email: "", password: "", confirmPassword: "" });
      }
    } catch (error) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateSigninForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinData.email,
        password: signinData.password,
      });

      if (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        console.log('Auth page: Login successful:', data.user);
        // Navigation will be handled by onAuthStateChange
      }
    } catch (error) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('Auth page: Signing out user...');
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleProfileClick = () => {
    console.log('Auth page: Profile button clicked, navigating to profile');
    navigate('/profile');
  };

  if (user) {
    console.log('Auth page: Rendering user welcome screen for:', user.email);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onSignOut={handleSignOut} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>ยินดีต้อนรับ!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">สวัสดี, {user.email}</p>
              <div className="space-y-2">
                <Button 
                  onClick={handleProfileClick}
                  className="w-full"
                >
                  จัดการโปรไฟล์
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  className="w-full"
                >
                  ออกจากระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-bold">เข้าสู่ระบบ</CardTitle>
                  <p className="text-center text-gray-600">เข้าสู่ระบบเพื่อเริ่มช้อปปิ้ง</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">อีเมล</label>
                      <Input
                        type="email"
                        placeholder="กรุณากรอกอีเมล"
                        value={signinData.email}
                        onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">รหัสผ่าน</label>
                      <Input
                        type="password"
                        placeholder="กรุณากรอกรหัสผ่าน"
                        value={signinData.password}
                        onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-bold">สมัครสมาชิก</CardTitle>
                  <p className="text-center text-gray-600">สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">อีเมล</label>
                      <Input
                        type="email"
                        placeholder="กรุณากรอกอีเมล"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">รหัสผ่าน</label>
                      <Input
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">ยืนยันรหัสผ่าน</label>
                      <Input
                        type="password"
                        placeholder="กรุณายืนยันรหัสผ่าน"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Debug component - remove this in production */}
          <div className="mt-8">
            <AuthDebug />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
