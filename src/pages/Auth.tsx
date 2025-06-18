
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import UserWelcomeScreen from "@/components/auth/UserWelcomeScreen";
import { useAuthForm } from "@/hooks/useAuthForm";

const Auth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { 
    loading, 
    error, 
    handleSignUp, 
    handleSignIn, 
    handleSignOut, 
    handleProfileClick 
  } = useAuthForm();

  useEffect(() => {
    const checkUser = async () => {
      console.log('Auth page: Checking existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth page - Session:', session);
      
      if (session?.user) {
        console.log('Auth page: User already logged in, setting user state');
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth page - Auth state changed:', event, session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
        console.log('User profile loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const onSignUp = async (username: string, email: string, password: string, confirmPassword: string) => {
    await handleSignUp(username, email, password, confirmPassword);
  };

  const onSignIn = async (emailOrUsername: string, password: string) => {
    await handleSignIn(emailOrUsername, password);
  };

  // Check if user is admin - consistent with Admin.tsx
  const isAdmin = user?.email === 'wishyouluckyshop@gmail.com' || profile?.role === 'admin';
  
  if (user) {
    return (
      <UserWelcomeScreen 
        user={user} 
        onSignOut={handleSignOut} 
        onProfileClick={handleProfileClick}
        isAdmin={isAdmin}
      />
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
              <SignInForm 
                onSubmit={onSignIn}
                loading={loading}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm 
                onSubmit={onSignUp}
                loading={loading}
                error={error}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
