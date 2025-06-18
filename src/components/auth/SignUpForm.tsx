
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignUpFormProps {
  onSubmit: (email: string, password: string, confirmPassword: string) => Promise<void>;
  loading: boolean;
  error: string;
}

const SignUpForm = ({ onSubmit, loading, error }: SignUpFormProps) => {
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return false;
    }
    if (formData.password.length < 6) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData.email, formData.password, formData.confirmPassword);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">สมัครสมาชิก</CardTitle>
        <p className="text-center text-gray-600">สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">อีเมล</label>
            <Input
              type="email"
              placeholder="กรุณากรอกอีเมล"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">รหัสผ่าน</label>
            <Input
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              autoComplete="new-password"
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
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              autoComplete="new-password"
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
            disabled={loading || !validateForm()}
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
