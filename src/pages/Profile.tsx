
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    address: '',
    birth_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          birth_date: data.birth_date || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birth_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        return;
      }

      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>ข้อมูลโปรไฟล์</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {profile?.role && (
                    <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                      {profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                    </Badge>
                  )}
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        บันทึก
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4 mr-1" />
                        ยกเลิก
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  {editing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">{profile?.username || 'ไม่ระบุ'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                  {editing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">{profile?.full_name || 'ไม่ระบุ'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">{profile?.phone || 'ไม่ระบุ'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birth_date">วันเกิด</Label>
                  {editing ? (
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded">
                      {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                {editing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded min-h-[80px]">{profile?.address || 'ไม่ระบุ'}</p>
                )}
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <p>สร้างบัญชีเมื่อ: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>
                  <p>แก้ไขล่าสุดเมื่อ: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>
                  <p>อีเมล: {user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
