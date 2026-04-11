import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
import { Menu, X, MapPin, Phone, Mail } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: ROUTE_PATHS.HOME, label: 'الرئيسية' },
    { path: ROUTE_PATHS.ABOUT, label: 'من نحن' },
    { path: ROUTE_PATHS.PRIVACY, label: 'سياسة الخصوصية' },
    { path: ROUTE_PATHS.SUBSCRIPTION_POLICY, label: 'سياسة الاشتراك' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavLink to={ROUTE_PATHS.HOME} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <img
                  src={IMAGES.SCREENSHOT3874_42}
                  alt="حلاق ماب"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                  حلاق ماب
                </span>
                <span className="text-xs text-muted-foreground">HALAQ MAP</span>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-foreground/80'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button
                  className="bg-gradient-to-l from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/20 font-semibold"
                >
                  سجل كحلاق
                </Button>
              </NavLink>
            </nav>

            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/40 bg-background"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/80 hover:bg-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to={ROUTE_PATHS.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    className="w-full bg-gradient-to-l from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/20 font-semibold"
                  >
                    سجل كحلاق
                  </Button>
                </NavLink>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-card mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <img
                    src={IMAGES.SCREENSHOT3874_42}
                    alt="حلاق ماب"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                    حلاق ماب
                  </span>
                  <span className="text-xs text-muted-foreground">HALAQ MAP</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                أول منصة عربية ذكية تربط الحلاقين المحترفين بالعملاء عبر نظام خرائط متقدم
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">روابط سريعة</h3>
              <div className="space-y-2">
                <NavLink
                  to={ROUTE_PATHS.REGISTER}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  تسجيل حلاق
                </NavLink>
                <NavLink
                  to={ROUTE_PATHS.BARBER_LOGIN}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  💎 لوحة تحكم الحلاق
                </NavLink>
                <NavLink
                  to={ROUTE_PATHS.ADMIN_LOGIN}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  👑 لوحة تحكم المالك
                </NavLink>
                <NavLink
                  to={ROUTE_PATHS.ABOUT}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  من نحن
                </NavLink>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">تواصل معنا</h3>
              <div className="space-y-3">
                <a
                  href="tel:+966559602685"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <span dir="ltr">+966559602685</span>
                </a>
                <a
                  href="mailto:admin@halaqmap.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span>admin@halaqmap.com</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span>المملكة العربية السعودية</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">تابعنا</h3>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com/halaqmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                  aria-label="تويتر"
                >
                  <SiX className="w-5 h-5 text-primary" />
                </a>
                <a
                  href="https://facebook.com/halaqmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                  aria-label="فيسبوك"
                >
                  <SiFacebook className="w-5 h-5 text-primary" />
                </a>
                <a
                  href="https://instagram.com/halaqmap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                  aria-label="انستقرام"
                >
                  <SiInstagram className="w-5 h-5 text-primary" />
                </a>
                <a
                  href="https://wa.me/966559602685"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                  aria-label="واتساب"
                >
                  <SiWhatsapp className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-right">
                © 2026 حلاق ماب. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6">
                <NavLink
                  to={ROUTE_PATHS.PRIVACY}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  سياسة الخصوصية
                </NavLink>
                <NavLink
                  to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  سياسة الاشتراك
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}