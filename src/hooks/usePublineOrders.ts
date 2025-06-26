import { useState, useEffect }.from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface สำหรับข้อมูลออเดอร์ (ใช้ตามที่คุณให้มา)
interface PublineOrder {
  id: number;
  username: string;
  item_json: string;
  item: string;
  sku: string;
  qty: string;
  price: string;
  deposit: number;
  balance: number;
  status: string;
  tracking_number: string;
  admin_notes: string;
  photo: string;
}

export const usePublineOrders = () => {
  // กำหนด Type ให้กับ State เพื่อความปลอดภัยและให้ TypeScript ช่วยตรวจสอบ
  const [orders, setOrders] = useState<PublineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect จะทำงานแค่ครั้งเดียวตอนคอมโพเนนต์ถูกเรียกใช้ครั้งแรก
  useEffect(() => {
    const fetchOrders = async () => {
      // เริ่มโหลดข้อมูล ให้ loading เป็น true
      setLoading(true);
      try {
        // ดึงข้อมูลจาก Supabase view 'publine_orders' และเรียงตาม id ล่าสุดก่อน
        const { data, error } = await supabase
          .from('publine_orders')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          // ถ้าเกิด error ให้โยน error ออกไปเพื่อให้ catch ทำงาน
          throw error;
        }

        // Map ข้อมูลที่ได้มาเพื่อแปลงและป้องกันค่า null/undefined
        // ทำให้ข้อมูลมีโครงสร้างที่แน่นอนก่อนส่งไปใช้งาน
        const mappedData: PublineOrder[] = (data || []).map(item => ({
          ...item,
          id: item.id || 0,
          username: item.username || 'N/A',
          item_json: item.item_json || '',
          item: item.item || 'ไม่มีชื่อสินค้า',
          sku: item.sku || 'N/A',
          qty: item.qty || '0',
          price: item.price || '0',
          deposit: item.deposit || 0,
          status: item.status || 'N/A',
          tracking_number: item.tracking_number || '',
          admin_notes: item.admin_notes || '',
          photo: item.photo || '',
          // balance ไม่มีใน view นี้ แต่กำหนดค่าเริ่มต้นไว้เพื่อรักษารูปแบบของ Interface
          balance: item.balance || 0, 
        }));

        setOrders(mappedData);

      } catch (error) {
        console.error('Error fetching publine orders:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
      } finally {
        // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้หยุดการโหลด
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // dependency array ว่าง [] หมายถึงให้รันแค่ครั้งเดียว

  /**
   * ฟังก์ชันสำหรับค้นหาออเดอร์ด้วย username แบบตรงกันทุกตัวอักษร
   * @param username - ชื่อผู้ใช้ที่ต้องการค้นหา
   * @returns array ของออเดอร์ที่ตรงกับเงื่อนไข
   */
  const searchOrdersByUsername = (username: string): PublineOrder[] => {
    if (!username) return [];
    
    const lowercasedUsername = username.toLowerCase().trim();
    
    return orders.filter(order => 
      order.username.toLowerCase() === lowercasedUsername
    );
  };

  // ส่งค่าและฟังก์ชันที่จำเป็นออกไปให้คอมโพเนนต์อื่นใช้
  return { orders, loading, searchOrdersByUsername };
};
