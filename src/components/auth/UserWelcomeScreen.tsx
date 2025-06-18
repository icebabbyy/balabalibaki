
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

interface UserWelcomeScreenProps {
  user: any;
  onSignOut: () => void;
  onProfileClick: () => void;
  isAdmin: boolean;
}

const UserWelcomeScreen = ({ user, onSignOut, onProfileClick, isAdmin }: UserWelcomeScreenProps) => {
  console.log('UserWelcomeScreen: Rendering for user:', user.email);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">สวัสดี, {user.email}</p>
            <div className="space-y-2">
              <Button 
                onClick={onProfileClick}
                className="w-full"
              >
                จัดการโปรไฟล์
              </Button>
              <Button 
                onClick={onSignOut} 
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
};

export default UserWelcomeScreen;
