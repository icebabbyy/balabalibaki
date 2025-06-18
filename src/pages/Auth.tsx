
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
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
    setError('');
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: 'user' // ทุกคนเริ่มต้นเป็น user
          }
        }
      });

      if (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        setError('');
        alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
      }
    } catch (error) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } catch (error) {
      setError(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
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
                  onClick={() => navigate('/profile')} 
                  className="w-full" 
                  style={{ backgroundColor: '#956ec3' }}
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
                      <label className="block text-sm font-medium mb-1">อีเมล</label>
                      <Input
                        type="email"
                        placeholder="กรุณากรอกอีเมล"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
                      <Input
                        type="password"
                        placeholder="กรุณากรอกรหัสผ่าน"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                      style={{ backgroundColor: '#956ec3' }}
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
                      <label className="block text-sm font-medium mb-1">อีเมล</label>
                      <Input
                        type="email"
                        placeholder="กรุณากรอกอีเมล"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
                      <Input
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                      style={{ backgroundColor: '#956ec3' }}
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
