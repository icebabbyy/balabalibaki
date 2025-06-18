
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    address: ''
  });

  console.log('Profile page: Component mounted', { user, authLoading });

  useEffect(() => {
    if (authLoading) {
      console.log('Profile page: Still loading auth state');
      return;
    }

    if (!user) {
      console.log('Profile page: No user found, redirecting to auth');
      navigate('/auth');
      return;
    }

    console.log('Profile page: User found, loading profile:', user);
    loadProfile(user.id);
  }, [user, authLoading, navigate]);

  const loadProfile = async (userId) => {
    try {
      console.log('Profile page: Loading profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile page - Profile data:', data, 'Profile Error:', error);

      if (error) {
        console.error('Profile page: Error loading profile:', error);
      }

      if (data) {
        console.log('Profile page: Setting profile data:', data);
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        console.log('Profile page: No profile found, showing empty form');
      }
    } catch (err) {
      console.error('Profile page: Unexpected error in loadProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Profile page: Submitting form with data:', formData);
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Profile page: Error updating profile:', error);
        alert('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      } else {
        console.log('Profile page: Profile updated successfully');
        alert('อัปเดตโปรไฟล์สำเร็จ!');
        await loadProfile(user.id);
      }
    } catch (err) {
      console.error('Profile page: Unexpected error in handleSubmit:', err);
      alert('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setUpdating(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  // Show auth message if no user after check
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold">จัดการโปรไฟล์</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">อีเมล</label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อผู้ใช้</label>
                  <Input
                    type="text"
                    placeholder="กรุณากรอกชื่อผู้ใช้"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล</label>
                  <Input
                    type="text"
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
                  <Input
                    type="tel"
                    placeholder="กรุณากรอกเบอร์โทรศัพท์"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ที่อยู่</label>
                  <Input
                    type="text"
                    placeholder="กรุณากรอกที่อยู่"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                {profile && (
                  <div>
                    <label className="block text-sm font-medium mb-1">บทบาท</label>
                    <Input
                      type="text"
                      value={profile.role || 'user'}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      หากต้องการเปลี่ยนบทบาท กรุณาติดต่อผู้ดูแลระบบ
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updating}
                    style={{ backgroundColor: '#9f73c7' }}
                  >
                    {updating ? 'กำลังอัปเดต...' : 'อัปเดตโปรไฟล์'}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    กลับหน้าหลัก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
