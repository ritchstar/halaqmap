import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Star,
  Eye,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Send,
  Mic,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS, Post, Appointment, ChatMessage, BarberStats } from '@/lib';
import { IMAGES } from '@/assets/images';

export default function BarberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [barberData, setBarberData] = useState<any>(null);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const auth = localStorage.getItem('barberAuth');
    if (!auth) {
      navigate(ROUTE_PATHS.BARBER_LOGIN);
      return;
    }
    setBarberData(JSON.parse(auth));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('barberAuth');
    navigate(ROUTE_PATHS.HOME);
  };

  // بيانات وهمية للإحصائيات
  const stats: BarberStats = {
    totalAppointments: 156,
    completedAppointments: 142,
    cancelledAppointments: 8,
    totalRevenue: 28400,
    averageRating: 4.9,
    totalReviews: 342,
    totalViews: 5678,
    totalChats: 89,
  };

  // مواعيد وهمية
  const appointments: Appointment[] = [
    {
      id: '1',
      barberId: '1',
      customerName: 'أحمد محمد',
      customerPhone: '+966501234567',
      date: '2026-04-10',
      time: '10:00',
      service: 'قصة شعر رجالي',
      status: 'confirmed',
    },
    {
      id: '2',
      barberId: '1',
      customerName: 'خالد عبدالله',
      customerPhone: '+966502345678',
      date: '2026-04-10',
      time: '11:30',
      service: 'حلاقة ذقن',
      status: 'pending',
    },
    {
      id: '3',
      barberId: '1',
      customerName: 'سعد علي',
      customerPhone: '+966503456789',
      date: '2026-04-10',
      time: '14:00',
      service: 'قصة شعر + حلاقة ذقن',
      status: 'confirmed',
    },
  ];

  // رسائل وهمية
  const messages: ChatMessage[] = [
    {
      id: '1',
      barberId: '1',
      customerId: 'c1',
      sender: 'customer',
      message: 'مرحباً، هل يمكنني حجز موعد اليوم؟',
      messageType: 'text',
      timestamp: '2026-04-08 09:30',
      read: true,
    },
    {
      id: '2',
      barberId: '1',
      customerId: 'c1',
      sender: 'barber',
      message: 'أهلاً وسهلاً! نعم، لدينا مواعيد متاحة. ما الوقت المناسب لك؟',
      messageType: 'text',
      timestamp: '2026-04-08 09:32',
      read: true,
    },
    {
      id: '3',
      barberId: '1',
      customerId: 'c2',
      sender: 'customer',
      message: 'كم سعر قصة الشعر؟',
      messageType: 'text',
      timestamp: '2026-04-08 10:15',
      read: false,
    },
  ];

  // بوستات وهمية
  const posts: Post[] = [
    {
      id: '1',
      barberId: '1',
      title: 'عرض خاص - خصم 20%',
      content: 'احصل على خصم 20% على جميع الخدمات هذا الأسبوع!',
      images: [IMAGES.BARBER_SHOP_1],
      type: 'offer',
      discount: 20,
      validUntil: '2026-04-15',
      createdAt: '2026-04-05',
      likes: 45,
      views: 234,
    },
    {
      id: '2',
      barberId: '1',
      title: 'أحدث قصات الشعر',
      content: 'شاهد أحدث قصات الشعر العصرية لدينا',
      images: [IMAGES.BARBER_WORK_1, IMAGES.BARBER_WORK_2],
      type: 'gallery',
      createdAt: '2026-04-03',
      likes: 78,
      views: 456,
    },
  ];

  if (!barberData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{barberData.name}</h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-600 border-yellow-500/30">
                  💎 باقة ماسية
                </Badge>
              </div>
            </div>

            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">المواعيد</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">الرسائل</span>
              {messages.filter(m => !m.read && m.sender === 'customer').length > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {messages.filter(m => !m.read && m.sender === 'customer').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">البوستات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">الإحصائيات</h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="إجمالي المواعيد"
                  value={stats.totalAppointments}
                  icon={Calendar}
                  color="blue"
                />
                <StatsCard
                  title="الإيرادات"
                  value={`${stats.totalRevenue.toLocaleString()} ر.س`}
                  icon={DollarSign}
                  color="green"
                />
                <StatsCard
                  title="التقييم"
                  value={stats.averageRating}
                  subtitle={`${stats.totalReviews} تقييم`}
                  icon={Star}
                  color="yellow"
                />
                <StatsCard
                  title="المشاهدات"
                  value={stats.totalViews}
                  icon={Eye}
                  color="purple"
                />
              </div>

              {/* Recent Appointments */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>المواعيد القادمة</CardTitle>
                  <CardDescription>مواعيد اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsSection appointments={appointments} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <MessagesSection messages={messages} />
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <PostsSection posts={posts} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsSection barberData={barberData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-600',
    green: 'from-green-500/10 to-green-600/10 border-green-500/30 text-green-600',
    yellow: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30 text-yellow-600',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} border flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Clock },
    confirmed: { label: 'مؤكد', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle2 },
    completed: { label: 'مكتمل', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: CheckCircle2 },
    cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  };

  const config = statusConfig[appointment.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{appointment.customerName}</p>
          <p className="text-sm text-muted-foreground">{appointment.service}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{appointment.customerPhone}</p>
        </div>
      </div>
      <div className="text-left">
        <p className="text-sm font-medium mb-2">{appointment.time}</p>
        <Badge className={config.color}>
          <StatusIcon className="w-3 h-3 ml-1" />
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

// Appointments Section
function AppointmentsSection({ appointments }: { appointments: Appointment[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">إدارة المواعيد</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          موعد جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <AppointmentCard appointment={appointment} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Messages Section
function MessagesSection({ messages }: { messages: ChatMessage[] }) {
  const [newMessage, setNewMessage] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">الرسائل</h2>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'barber' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.sender === 'barber'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="اكتب رسالتك..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button size="icon" variant="outline">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Posts Section
function PostsSection({ posts }: { posts: Post[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">البوستات والعروض</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          بوست جديد
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={post.type === 'offer' ? 'default' : 'secondary'}>
                  {post.type === 'offer' ? '🎁 عرض' : '📸 معرض'}
                </Badge>
                {post.discount && (
                  <Badge variant="destructive">خصم {post.discount}%</Badge>
                )}
              </div>
              <h3 className="text-lg font-bold mb-2">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex gap-4">
                  <span>👁️ {post.views}</span>
                  <span>❤️ {post.likes}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// Settings Section
function SettingsSection({ barberData }: { barberData: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الصالون</CardTitle>
          <CardDescription>قم بتحديث معلومات صالونك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم الصالون</Label>
            <Input defaultValue={barberData.name} />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" defaultValue={barberData.email} />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input type="tel" defaultValue="+966501234567" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea rows={4} placeholder="اكتب وصفاً عن صالونك..." />
          </div>
          <Button className="w-full">حفظ التغييرات</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
