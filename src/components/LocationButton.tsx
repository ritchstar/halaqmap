import { useState } from "react";
import { MapPin, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationButtonProps {
  onLocationDetected: (location: { lat: number; lng: number }) => void;
}

export function LocationButton({ onLocationDetected }: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const handleLocationRequest = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("متصفحك لا يدعم خدمة تحديد الموقع");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDetectedLocation(location);
        onLocationDetected(location);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = "حدث خطأ في تحديد الموقع";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول للموقع من إعدادات المتصفح";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "معلومات الموقع غير متوفرة حالياً";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى";
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleVerifyLocation = () => {
    if (detectedLocation) {
      const mapsUrl = `https://www.google.com/maps?q=${detectedLocation.lat},${detectedLocation.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {!detectedLocation ? (
        <>
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Button
              onClick={handleLocationRequest}
              disabled={isLoading}
              size="lg"
              className="relative h-20 px-12 text-xl font-bold bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-[0_8px_30px_-6px_color-mix(in_srgb,var(--primary)_35%,transparent),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-8px_color-mix(in_srgb,var(--primary)_45%,transparent),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all duration-200 rounded-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-3 h-8 w-8 animate-spin" />
                  <span>جاري تحديد الموقع...</span>
                </>
              ) : (
                <>
                  <MapPin className="ml-3 h-8 w-8" />
                  <span>اسمح بتحديد موقعك</span>
                </>
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center max-w-md text-base md:text-lg font-semibold leading-relaxed rounded-2xl border border-border bg-secondary px-5 py-4 text-secondary-foreground shadow-sm"
          >
            اضغط على الزر للسماح بتحديد موقعك الحالي والعثور على أقرب الحلاقين المحترفين إليك
          </motion.p>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col items-center gap-6 w-full max-w-2xl"
        >
          {/* Success Message with Pulsing Animation */}
          <motion.div 
            className="flex items-center gap-4 px-10 py-5 bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 rounded-2xl shadow-lg shadow-green-500/20"
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 10px 30px -10px rgba(34, 197, 94, 0.2)',
                '0 15px 40px -10px rgba(34, 197, 94, 0.4)',
                '0 10px 30px -10px rgba(34, 197, 94, 0.2)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </motion.div>
            <span className="text-2xl font-bold text-foreground">تم تحديد موقعك بنجاح ✅</span>
          </motion.div>
          
          {/* Verify Location Button - More Prominent */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Button
              onClick={handleVerifyLocation}
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-[0_8px_30px_-6px_color-mix(in_srgb,var(--primary)_35%,transparent)] hover:shadow-[0_12px_40px_-8px_color-mix(in_srgb,var(--primary)_45%,transparent)] transition-all duration-200 rounded-2xl"
            >
              <MapPin className="ml-3 h-7 w-7" />
              <span>افتح الخريطة للتحقق من موقعك</span>
              <ExternalLink className="mr-3 h-6 w-6" />
            </Button>
          </motion.div>

          {/* Informative Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2"
          >
            <p className="text-base text-muted-foreground font-medium">
              📍 اضغط على الزر أعلاه لفتح خرائط جوجل والتأكد من أن المنصة حددت موقعك بدقة
            </p>
            <p className="text-sm text-muted-foreground">
              ✨ سترى علامة حمراء على الخريطة تشير إلى موقعك الحالي
            </p>
          </motion.div>

          {/* Re-detect Location Button */}
          <Button
            onClick={handleLocationRequest}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            🔄 إعادة تحديد الموقع
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="w-full max-w-md"
        >
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}