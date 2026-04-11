import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // محاكاة تسجيل الدخول
    setTimeout(() => {
      // حفظ بيانات المالك في localStorage
      localStorage.setItem('adminAuth', JSON.stringify({
        id: 'admin1',
        name: 'مدير المنصة',
        email: email,
        role: 'admin',
        loggedIn: true,
      }));
      
      setIsLoading(false);
      navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${IMAGES.DASHBOARD_BG_7})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">لوحة تحكم المالك</h1>
            <p className="text-muted-foreground">سجل دخولك لإدارة المنصة</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@halaqmap.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                  />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-sm text-red-600 text-center mb-2">
              🔐 <strong>للتجربة:</strong>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              أدخل أي بريد إلكتروني وكلمة مرور
            </p>
          </motion.div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(ROUTE_PATHS.HOME)}
              className="text-sm text-primary hover:underline"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
