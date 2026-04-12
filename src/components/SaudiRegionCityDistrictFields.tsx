import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPinned } from 'lucide-react';
import {
  loadSaudiGeoLite,
  sortArabicLabel,
  OTHER_DISTRICT_VALUE,
  type SaudiGeoBundle,
} from '@/lib/saudiGeoData';

export type SaudiLocationSelection = {
  regionId: string;
  cityId: string;
  districtId: string;
  districtOther: string;
};

type Props = {
  value: SaudiLocationSelection;
  onChange: (next: SaudiLocationSelection) => void;
  disabled?: boolean;
};

export function SaudiRegionCityDistrictFields({ value, onChange, disabled }: Props) {
  const [bundle, setBundle] = useState<SaudiGeoBundle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    void loadSaudiGeoLite()
      .then((b) => {
        if (!cancelled) setBundle(b);
      })
      .catch(() => {
        if (!cancelled) setLoadError('تعذر تحميل قائمة المناطق والمدن. تحقق من الاتصال ثم أعد المحاولة.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regionsSorted = useMemo(() => {
    if (!bundle) return [];
    return [...bundle.regions].sort((a, b) => sortArabicLabel(a.name_ar, b.name_ar));
  }, [bundle]);

  const citiesInRegion = useMemo(() => {
    if (!bundle || !value.regionId) return [];
    const rid = Number(value.regionId);
    const q = cityFilter.trim().toLowerCase();
    return bundle.cities
      .filter((c) => c.region_id === rid)
      .filter(
        (c) =>
          !q ||
          c.name_ar.toLowerCase().includes(q) ||
          c.name_en.toLowerCase().includes(q)
      )
      .sort((a, b) => sortArabicLabel(a.name_ar, b.name_ar));
  }, [bundle, value.regionId, cityFilter]);

  const districtsInCity = useMemo(() => {
    if (!bundle || !value.cityId) return [];
    const cid = Number(value.cityId);
    const q = districtFilter.trim().toLowerCase();
    return bundle.districts
      .filter((d) => d.city_id === cid)
      .filter(
        (d) =>
          !q ||
          d.name_ar.toLowerCase().includes(q) ||
          d.name_en.toLowerCase().includes(q)
      )
      .sort((a, b) => sortArabicLabel(a.name_ar, b.name_ar));
  }, [bundle, value.cityId, districtFilter]);

  const patch = (partial: Partial<SaudiLocationSelection>) => {
    onChange({ ...value, ...partial });
  };

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  if (!bundle) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        جاري تحميل بيانات العنوان الوطني (المناطق والمدن والأحياء)…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPinned className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
        <p className="leading-relaxed">
          اختر <strong>المنطقة</strong> ثم <strong>المدينة</strong> ثم <strong>الحي</strong> من قوائم رسمية (بيانات مرجعية مبسّطة للعنوان الوطني). يمكنك تصفية المدن والأحياء بالكتابة في الحقل أسفل كل قائمة.
        </p>
      </div>

      <div className="space-y-2">
        <Label>المنطقة الإدارية *</Label>
        <Select
          value={value.regionId || undefined}
          onValueChange={(rid) => {
            setCityFilter('');
            setDistrictFilter('');
            patch({ regionId: rid, cityId: '', districtId: '', districtOther: '' });
          }}
          disabled={disabled}
        >
          <SelectTrigger dir="rtl">
            <SelectValue placeholder="اختر المنطقة" />
          </SelectTrigger>
          <SelectContent className="max-h-[min(60vh,320px)]" dir="rtl">
            {regionsSorted.map((r) => (
              <SelectItem key={r.region_id} value={String(r.region_id)}>
                {r.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.regionId ? (
        <div className="space-y-2">
          <Label>المدينة *</Label>
          <Input
            dir="rtl"
            placeholder="تصفية المدن (اختياري)…"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            disabled={disabled}
            className="mb-2"
          />
          <Select
            value={value.cityId || undefined}
            onValueChange={(cid) => {
              setDistrictFilter('');
              patch({ cityId: cid, districtId: '', districtOther: '' });
            }}
            disabled={disabled}
          >
            <SelectTrigger dir="rtl">
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(60vh,360px)]" dir="rtl">
              {citiesInRegion.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">لا توجد مدن مطابقة</div>
              ) : (
                citiesInRegion.map((c) => (
                  <SelectItem key={c.city_id} value={String(c.city_id)}>
                    {c.name_ar}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {value.cityId ? (
        <div className="space-y-2">
          <Label>الحي *</Label>
          <Input
            dir="rtl"
            placeholder="تصفية الأحياء (اختياري)…"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            disabled={disabled}
            className="mb-2"
          />
          <Select
            value={value.districtId || undefined}
            onValueChange={(did) => patch({ districtId: did, districtOther: did === OTHER_DISTRICT_VALUE ? value.districtOther : '' })}
            disabled={disabled}
          >
            <SelectTrigger dir="rtl">
              <SelectValue placeholder="اختر الحي" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(60vh,360px)]" dir="rtl">
              <SelectItem value={OTHER_DISTRICT_VALUE}>حي غير مدرج — سأكتب الاسم يدوياً</SelectItem>
              {districtsInCity.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">لا توجد أحياء مطابقة</div>
              ) : (
                districtsInCity.map((d) => (
                  <SelectItem key={d.district_id} value={String(d.district_id)}>
                    {d.name_ar}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {value.districtId === OTHER_DISTRICT_VALUE ? (
            <Input
              dir="rtl"
              placeholder="اكتب اسم الحي…"
              value={value.districtOther}
              onChange={(e) => patch({ districtOther: e.target.value })}
              disabled={disabled}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** يبنى سطراً واحداً للتخزين ولوحة الإدارة */
export function composeSaudiLocationLine(
  bundle: SaudiGeoBundle | null,
  sel: SaudiLocationSelection,
  streetDetail: string
): string {
  if (!bundle || !sel.regionId) return streetDetail.trim();

  const r = bundle.regions.find((x) => x.region_id === Number(sel.regionId));
  const c = bundle.cities.find((x) => x.city_id === Number(sel.cityId));
  let districtLabel = '';
  if (sel.districtId === OTHER_DISTRICT_VALUE) {
    districtLabel = sel.districtOther.trim() || 'حي (يدوي)';
  } else if (sel.districtId) {
    const d = bundle.districts.find((x) => x.district_id === Number(sel.districtId));
    districtLabel = d?.name_ar ?? '';
  }

  const parts = [r?.name_ar, c?.name_ar, districtLabel, streetDetail.trim()].filter(Boolean);
  return parts.join(' — ');
}
