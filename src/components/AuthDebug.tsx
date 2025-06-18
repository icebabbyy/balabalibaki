
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebug = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    // Validate inputs
    if (!email) {
      setMessage('กรุณากรอกอีเมล');
      setLoading(false);
      return;
    }
    
    if (!password || password.length < 6) {
      setMessage('กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to sign up with:', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: email === 'admin@luckyshop.com' ? 'admin' : 'user'
          }
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Success! User created: ${data.user?.email}`);
        
        // Check if profile was created
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          console.log('Profile check:', { profile, profileError });
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('All profiles:', { data, error });
      setMessage(`Profiles in database: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      console.error('Error checking profiles:', err);
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Auth Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password (อย่างน้อย 6 ตัวอักษร)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />
        <Button onClick={testSignUp} disabled={loading} className="w-full">
          {loading ? 'Testing...' : 'Test Sign Up'}
        </Button>
        <Button onClick={checkProfiles} variant="outline" className="w-full">
          Check Profiles
        </Button>
        {message && (
          <div className="p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
