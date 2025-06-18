
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignInFormProps {
  onSubmit: (emailOrUsername: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

const SignInForm = ({ onSubmit, loading, error }: SignInFormProps) => {
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });

  const validateForm = () => {
    return formData.emailOrUsername && formData.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData.emailOrUsername, formData.password);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">เข้าสู่ระบบ</CardTitle>
        <p className="text-center text-gray-600">เข้าสู่ระบบเพื่อเริ่มช้อปปิ้ง</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">อีเมลหรือชื่อผู้ใช้</label>
            <Input
              type="text"
              placeholder="กรุณากรอกอีเมลหรือชื่อผู้ใช้"
              value={formData.emailOrUsername}
              onChange={(e) => setFormData(prev => ({ ...prev, emailOrUsername: e.target.value }))}
              autoComplete="username"
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">รหัสผ่าน</label>
            <Input
              type="password"
              placeholder="กรุณากรอกรหัสผ่าน"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              autoComplete="current-password"
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
            disabled={loading || !validateForm()}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
