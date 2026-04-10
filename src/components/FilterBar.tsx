import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RotateCcw, Star } from "lucide-react";
import { FilterState, SubscriptionTier } from "@/lib/index";
import { motion } from "framer-motion";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDistanceChange = (value: number[]) => {
    onFilterChange({ ...filters, maxDistance: value[0] });
  };

  const handleTierToggle = (tier: SubscriptionTier) => {
    const newTiers = filters.tiers.includes(tier)
      ? filters.tiers.filter((t) => t !== tier)
      : [...filters.tiers, tier];
    onFilterChange({ ...filters, tiers: newTiers });
  };

  const handleOpenNowToggle = (checked: boolean) => {
    onFilterChange({ ...filters, openNow: checked });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleReset = () => {
    onFilterChange({
      maxDistance: 5,
      tiers: [],
      openNow: false,
      minRating: 0,
      categories: [],
    });
  };

  const tierLabels = {
    [SubscriptionTier.BRONZE]: "برونزي",
    [SubscriptionTier.GOLD]: "ذهبي",
    [SubscriptionTier.DIAMOND]: "ماسي",
  };

  const categories = [
    { id: "men", label: "رجالي" },
    { id: "kids", label: "أطفال" },
    { id: "traditional", label: "تقليدي" },
  ];

  const ratingOptions = [0, 3, 4, 4.5];

  return (
    <Card className="w-full p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">الفلاتر</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 hover:bg-accent/10"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground">
                المسافة القصوى
              </Label>
              <span className="text-sm font-semibold text-primary">
                {filters.maxDistance} كم
              </span>
            </div>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={handleDistanceChange}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">الفئة</Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(tierLabels).map(([tier, label]) => (
                <div
                  key={tier}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <Checkbox
                    id={`tier-${tier}`}
                    checked={filters.tiers.includes(tier as SubscriptionTier)}
                    onCheckedChange={() =>
                      handleTierToggle(tier as SubscriptionTier)
                    }
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`tier-${tier}`}
                    className="text-sm cursor-pointer text-foreground"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="open-now" className="text-base font-medium text-foreground">
              مفتوح الآن
            </Label>
            <Switch
              id="open-now"
              checked={filters.openNow}
              onCheckedChange={handleOpenNowToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">
              التقييم الأدنى
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {ratingOptions.map((rating) => (
                <Button
                  key={rating}
                  variant={filters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRatingChange(rating)}
                  className="gap-1 transition-all"
                >
                  {rating === 0 ? (
                    "الكل"
                  ) : (
                    <>
                      <Star className="w-3 h-3 fill-current" />
                      {rating}
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">
              نوع الخدمة
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer text-foreground"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
