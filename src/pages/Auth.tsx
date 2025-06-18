import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    address: '',
    birthDate: ''
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('เข้าสู่ระบบสำเร็จ');
        navigate('/');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            username: registerForm.username,
            full_name: registerForm.fullName,
            phone: registerForm.phone,
            address: registerForm.address,
            birth_date: registerForm.birthDate,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
        // Reset form
        setRegisterForm({
          email: '',
          phone: '',
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          address: '',
          birthDate: ''
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    toast.info('กำลังเชื่อมต่อกับ Facebook...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">เข้าสู่ระบบ / สมัครสมาชิก</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">
        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-purple-800">เข้าสู่ระบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">อีเมล</Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="กรอกอีเมล"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">รหัสผ่าน</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="กรอกรหัสผ่าน"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">หรือ</span>
                  </div>
                </div>

                <Button
                  onClick={handleFacebookLogin}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  disabled={loading}
                >
                  เข้าสู่ระบบด้วย Facebook
                </Button>

                <p className="text-center text-sm text-gray-600">
                  ลืมรหัสผ่าน? <a href="#" className="text-purple-600 hover:underline">คลิกที่นี่</a>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-purple-800">สมัครสมาชิก</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">อีเมล</Label>
                    <div className="relative">
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="กรอกอีเมล"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">เบอร์โทร</Label>
                    <div className="relative">
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="กรอกเบอร์โทร"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-username">ชื่อผู้ใช้</Label>
                    <div className="relative">
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="กรอกชื่อผู้ใช้"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">ชื่อ-นามสกุล</Label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="กรอกชื่อ-นามสกุล"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-address">ที่อยู่ผู้รับสินค้า</Label>
                    <Input
                      id="register-address"
                      type="text"
                      placeholder="กรอกที่อยู่ผู้รับสินค้า"
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({...registerForm, address: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-birthdate">วันเกิด</Label>
                    <div className="relative">
                      <Input
                        id="register-birthdate"
                        type="date"
                        value={registerForm.birthDate}
                        onChange={(e) => setRegisterForm({...registerForm, birthDate: e.target.value})}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">รหัสผ่าน</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="กรอกรหัสผ่าน"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">ยืนยันรหัสผ่าน</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="ยืนยันรหัสผ่าน"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">หรือ</span>
                  </div>
                </div>

                <Button
                  onClick={handleFacebookLogin}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  disabled={loading}
                >
                  สมัครด้วย Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
