import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpenCheck, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import {
  fetchPartnerTutorialVideosPublic,
  isPartnerTutorialSectionVisible,
  type PartnerTutorialVideoPublic,
} from '@/lib/partnerTutorialVideosPublic';

export default function PartnerSubscriptionTutorials() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [videos, setVideos] = useState<PartnerTutorialVideoPublic[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchPartnerTutorialVideosPublic().then((payload) => {
      if (cancelled) return;
      setVisible(isPartnerTutorialSectionVisible(payload));
      setVideos(payload.videos);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && !visible) {
    return <Navigate to={ROUTE_PATHS.BARBERS_LANDING} replace />;
  }

  if (loading) {
    return <p className="container mx-auto px-4 py-16 text-center text-muted-foreground">جاري التحميل…</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="text-sm">
          شرح حزم الرخصة
        </Badge>
        <h1 className="text-3xl font-bold">فيديوهات تعليم حزم الإدراج البرمجية في حلاق ماب</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          تابع الخطوات من التسجيل حتى التفعيل والدفع بشكل واضح. جميع الفيديوهات هنا مخصصة لمسار الخدمات البرمجية للمنصة.
        </p>
      </div>

      <Card className="border-primary/25">
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <span>ابدأ بالفيديو الأول ثم انتقل لبقية الخطوات.</span>
          </div>
          <Button asChild>
            <Link to={ROUTE_PATHS.REGISTER}>الانتقال للتسجيل</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {videos.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlayCircle className="h-5 w-5 text-primary" />
                {v.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {v.description ? <p className="text-sm text-muted-foreground">{v.description}</p> : null}
              {v.videoUrl ? (
                <video src={v.videoUrl} controls className="w-full rounded-lg border" />
              ) : (
                <p className="text-sm text-muted-foreground">رابط الفيديو غير متاح حالياً.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
