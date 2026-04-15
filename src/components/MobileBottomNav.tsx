import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Info, UserPlus, LayoutGrid } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function navItemClass(active: boolean) {
  return cn(
    'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[3.25rem] min-w-0 touch-manipulation rounded-xl px-1 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors',
    active
      ? 'text-primary bg-primary/10'
      : 'text-muted-foreground active:bg-muted/80 hover:text-foreground',
  );
}

export function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  const homeActive = pathname === ROUTE_PATHS.HOME;
  const aboutActive = pathname === ROUTE_PATHS.ABOUT;
  const registerActive =
    pathname === ROUTE_PATHS.REGISTER ||
    pathname === ROUTE_PATHS.REGISTER_SUCCESS ||
    pathname.startsWith('/register');

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل السفلي"
    >
      <div className="flex items-stretch justify-between max-w-lg mx-auto px-0.5 pt-1">
        <NavLink
          to={ROUTE_PATHS.HOME}
          end
          className={() => navItemClass(homeActive)}
        >
          <Home className="h-6 w-6 shrink-0" aria-hidden />
          <span className="leading-tight">الرئيسية</span>
        </NavLink>

        <NavLink to={ROUTE_PATHS.ABOUT} className={() => navItemClass(aboutActive)}>
          <Info className="h-6 w-6 shrink-0" aria-hidden />
          <span className="leading-tight">من نحن</span>
        </NavLink>

        <NavLink to={ROUTE_PATHS.REGISTER} className={() => navItemClass(registerActive)}>
          <UserPlus className="h-6 w-6 shrink-0" aria-hidden />
          <span className="leading-tight">سجّل كحلاق</span>
        </NavLink>

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(navItemClass(false), 'border-0 bg-transparent cursor-pointer')}
              aria-label="المزيد من الروابط"
            >
              <LayoutGrid className="h-6 w-6 shrink-0" aria-hidden />
              <span className="leading-tight">المزيد</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl rtl text-right pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="text-right">
              <SheetTitle className="text-lg">روابط إضافية</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 mt-4">
              <NavLink
                to={ROUTE_PATHS.PRIVACY}
                className="block rounded-xl px-4 py-3.5 text-base font-medium bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
                onClick={() => setMoreOpen(false)}
              >
                سياسة الخصوصية
              </NavLink>
              <NavLink
                to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
                className="block rounded-xl px-4 py-3.5 text-base font-medium bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
                onClick={() => setMoreOpen(false)}
              >
                سياسة الاشتراك
              </NavLink>
              <NavLink
                to={ROUTE_PATHS.BARBER_LOGIN}
                className="block rounded-xl px-4 py-3.5 text-base font-medium bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20 transition-colors touch-manipulation"
                onClick={() => setMoreOpen(false)}
              >
                دخول الحلّاق
              </NavLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
