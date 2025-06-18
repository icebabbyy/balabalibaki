
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Package, Heart, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      fetchOrders();
      fetchWishlist();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile data:', data);

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          birth_date: data.birth_date || ''
        });
      } else {
        // Create initial profile if doesn't exist
        console.log('No profile found, creating initial profile');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: user.email?.split('@')[0] || '',
            full_name: '',
            phone: '',
            address: '',
            birth_date: null,
            role: 'user'
          }])
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        if (newProfile) {
          setProfile(newProfile);
          setFormData({
            username: newProfile.username || '',
            full_name: newProfile.full_name || '',
            phone: newProfile.phone || '',
            address: newProfile.address || '',
            birth_date: newProfile.birth_date || ''
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('username', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    // For now, we'll simulate wishlist data since it's not in the database yet
    setWishlist([]);
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      console.log('Saving profile data:', formData);
      
      const updateData = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        birth_date: formData.birth_date || null,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile updated successfully:', data);
        setProfile(data);
        toast.success('บันทึกโปรไฟล์เรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการโปรไฟล์</h1>
            <p className="text-gray-600">จัดการข้อมูลส่วนตัว ประวัติการสั่งซื้อ และรายการที่ชอบ</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>ข้อมูลส่วนตัว</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>ประวัติการสั่งซื้อ</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>รายการที่ชอบ</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>ข้อมูลส่วนตัว</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">ชื่อผู้ใช้</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="กรอกชื่อผู้ใช้"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="กรอกชื่อ-นามสกุล"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="กรอกเบอร์โทรศัพท์"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">วันเกิด</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="กรอกที่อยู่สำหรับจัดส่ง"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>อีเมล</Label>
                    <Input value={user.email} disabled className="bg-gray-100" />
                    <p className="text-sm text-gray-500">อีเมลไม่สามารถแก้ไขได้</p>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>ประวัติการสั่งซื้อ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>หมายเลขออเดอร์</TableHead>
                          <TableHead>วันที่สั่ง</TableHead>
                          <TableHead>สถานะ</TableHead>
                          <TableHead>ยอดรวม</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString('th-TH')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'รอชำระเงิน' ? 'secondary' :
                                order.status === 'กำลังจัดส่ง' ? 'default' :
                                'outline'
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>฿{order.total_selling_price?.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>รายการที่ชอบ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีสินค้าในรายการที่ชอบ</p>
                    <p className="text-sm text-gray-400 mt-2">คลิกที่ไอคอนหัวใจในหน้าสินค้าเพื่อเพิ่มลงรายการที่ชอบ</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
