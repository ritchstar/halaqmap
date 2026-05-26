import { motion } from "framer-motion";
import { LegalObserverChat } from "@/components/LegalObserverChat";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { CheckCircle2, XCircle, AlertCircle, Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MAP_FEATURE_HERO,
} from "@/config/subscriptionPlanHero";
import { LISTING_LICENSE_LEGAL_FOOTNOTE } from "@/config/listingLicenseCards";
import {
  SUBSCRIPTION_POLICY_EXPIRY,
  SUBSCRIPTION_POLICY_PACKAGE_RENEWAL,
  SUBSCRIPTION_POLICY_TIERS,
  SUBSCRIPTION_POLICY_TIERS_INTRO,
} from "@/config/subscriptionPolicyTiers";
import {
  LEGAL_TRADE_NAME_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
  PARTNER_SUPPORT_WHATSAPP_URL,
  getLegalCommercialRegistrationDisplay,
} from "@/config/partnerLegal";
import { HonorBoard } from "@/components/b2b/HonorBoard";
import { PlatformIdentityCard } from "@/components/PlatformIdentityCard";
import {
  PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR,
} from "@/config/platformIdentity";


export default function SubscriptionPolicy() {
  const commercialReg = getLegalCommercialRegistrationDisplay();
  const subscriptionTiers = SUBSCRIPTION_POLICY_TIERS;

  const paymentMethods = [
    {
      title: "ط´ط±ط§ط، ط­ط²ظ…ط© ط±ط®طµط© ط§ظ„ظ†ظپط§ط° ط§ظ„ط±ظ‚ظ…ظٹط© (ط¨ظˆط§ط¨ط© ظ…ظٹط³ط± Moyasar)",
      description:
        "ط§ظ„ط·ط±ظٹظ‚ط© ط§ظ„ظ…طھط§ط­ط© ظ„ط´ط±ط§ط، ط­ط²ظ… ط§ظ„ط±ط®طµط© ط§ظ„ط­ط§ظ„ظٹط©: ط¯ظپط¹ ظ„ظ…ط±ط© ظˆط§ط­ط¯ط© ط¹ط¨ط± ط¨ظˆط§ط¨ط© ظ…ظٹط³ط± (Moyasar) ط§ظ„ظ…ط¹طھظ…ط¯ط© ظˆظپظ‚ ط§ظ„ط£ظ†ط¸ظ…ط© ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡ط§ ظپظٹ ط§ظ„ظ…ظ…ظ„ظƒط© â€” ط¨ط±ظˆظ†ط²ظٹ 100 ط±.ط³طŒ ط°ظ‡ط¨ظٹ 150 ط±.ط³طŒ ظ…ط§ط³ظٹ 200 ط±.ط³ â€” ظ„ظ…ط¯ط© 30 ظٹظˆظ…ط§ظ‹ ظ„ظƒظ„ ط­ط²ظ…ط©طŒ ط¯ظˆظ† طھط¬ط¯ظٹط¯ طھظ„ظ‚ط§ط¦ظٹ ط£ظˆ ط®طµظ… ط¯ظˆط±ظٹ. ظ„ظ„ظ…ط§ط³ظٹط©: ط¥ط¶ط§ظپط© آ«ط§ظ„ظ…ظ†ط§ظˆط¨ ط§ظ„ط±ظ‚ظ…ظٹ ط§ظ„ط°ظƒظٹآ» ط¥ط¶ط§ظپط© ط¨ط±ظ…ط¬ظٹط© ظ…طھظ‚ط¯ظ…ط© (Add-on) ط§ط®طھظٹط§ط±ظٹط© +25 ط±.ط³/ط­ط²ظ…ط© â€” ظ…ظ†ظپطµظ„ط© ط¹ظ† ط§ظ„ط±ط®طµط© ط§ظ„طھظ‚ظ†ظٹط©.",
      icon: CheckCircle2,
      benefits: [
        "ط¯ظپط¹ ظ„ظ…ط±ط© ظˆط§ط­ط¯ط© ظ…ظ‚ط§ط¨ظ„ ط­ط²ظ…ط© ط±ط®طµط© ط´ظ‡ط±ظٹط© (30 ظٹظˆظ…ط§ظ‹) â€” ط¨ط±ظˆظ†ط²ظٹ 100 آ· ط°ظ‡ط¨ظٹ 150 آ· ظ…ط§ط³ظٹ 200 ط±.ط³ â€” ظƒظ…ط§ ظپظٹ ط¬ط¯ظˆظ„ ط§ظ„ط¨ط§ظ‚ط§طھ ط£ط¹ظ„ط§ظ‡",
        "ظ„ط§ ظٹط®ط²ظ† ط§ظ„ظ…ظˆظ‚ط¹ ط±ظ‚ظ… ط§ظ„ط¨ط·ط§ظ‚ط© ط£ظˆ ط±ظ…ط² ط§ظ„ط£ظ…ط§ظ† â€” طھطھظ… ط§ظ„ظ…ط¹ط§ظ„ط¬ط© ظ„ط¯ظ‰ ظ…ط²ظˆط¯ ط§ظ„ط¯ظپط¹ ط§ظ„ظ…ط¹طھظ…ط¯",
        "ط¥ظٹطµط§ظ„ ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظˆط¥ط´ط¹ط§ط± ط¨ط±ظٹط¯ ط¨ط¹ط¯ ط¥طھظ…ط§ظ… ط§ظ„ط¯ظپط¹",
        "طھظپط¹ظٹظ„ طھظ„ظ‚ط§ط¦ظٹ ط¹ط¨ط± ظ†ط¸ط§ظ… ط§ظ„ط±طµط¯ ط§ظ„ط°ظƒظٹ ط¨ط¹ط¯ ظ†ط¬ط§ط­ ط§ظ„ط¯ظپط¹ ظˆظ…ط¹ط§ظ„ط¬ط© ط§ظ„ظˆظٹط¨ ظ‡ظˆظƒ",
      ],
    },
  ];

  const cancellationSteps = [
    {
      step: "1",
      title: "ط§ظ†طھظ‡ط§ط، طµظ„ط§ط­ظٹط© ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©",
      description: "طھظ†طھظ‡ظٹ طµظ„ط§ط­ظٹط© ط§ظ„ط¥ط¯ط±ط§ط¬ طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ظپظٹ طھط§ط±ظٹط® ط§ظ†طھظ‡ط§ط، ط­ط²ظ…ط© ط§ظ„ط±ط®طµط© ط§ظ„ظ…ط¯ظپظˆط¹ ظ…ط³ط¨ظ‚ط§ظ‹ ط¯ظˆظ† طھط¬ط¯ظٹط¯ طھظ„ظ‚ط§ط¦ظٹ",
    },
    {
      step: "2",
      title: "ط´ط±ط§ط، ط­ط²ظ…ط© ط±ط®طµط© ط¬ط¯ظٹط¯ط©",
      description: "ظٹظ…ظƒظ† ط´ط±ط§ط، ط­ط²ظ…ط© ط±ط®طµط© ط¬ط¯ظٹط¯ط© ط£ظˆ ط§ط³طھط±ط¯ط§ط¯ ظƒظˆط¯ طھظپط¹ظٹظ„ ظ„ظ…ط¯ط© ط¥ط¶ط§ظپظٹط© ظˆظپظ‚ ط§ظ„ظ…ظ†طھط¬ ط§ظ„ظ…ط¹ط±ظˆط¶",
    },
    {
      step: "3",
      title: "ط·ظ„ط¨ ط¥ظٹظ‚ط§ظپ ظ…ط¨ظƒط±",
      description: "ظ„ط·ظ„ط¨ط§طھ ط®ط§طµط© ط¨ط§ظ„ط¥ظٹظ‚ط§ظپ ط£ظˆ ط§ظ„ط­ط°ظپطŒ طھظˆط§طµظ„ ظ…ط¹ ط§ظ„ط¯ط¹ظ… â€” ظ„ط§ ظٹطھط±طھط¨ ط§ط³طھط±ط¯ط§ط¯ ظ…ط§ظ„ظٹ ط¨ط¹ط¯ طھظپط¹ظٹظ„ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©",
    },
    {
      step: "4",
      title: "ط¥ط®ظپط§ط، ظ…ظ† ظ†ط¸ط§ظ… ط§ظ„ط±طµط¯ ط§ظ„ط°ظƒظٹ",
      description: "ط¨ط¹ط¯ ط§ظ†طھظ‡ط§ط، ط§ظ„طµظ„ط§ط­ظٹط© ظٹظڈط®ظپظ‰ ط§ظ„ظ…ط­ظ„ ظ…ظ† ظ†طھط§ط¦ط¬ ط§ظ„ط¨ط­ط« ط­طھظ‰ طھط¬ط¯ظٹط¯ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©",
    },
  ];

  const refundPolicy = [
    {
      condition: "ظ‚ط¨ظ„ طھظپط¹ظٹظ„ ظƒظˆط¯ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©",
      refund: "ظ…ط±ط§ط¬ط¹ط© ط¥ط¯ط§ط±ظٹط© ط­ط³ط¨ ط§ظ„ط­ط§ظ„ط©",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      condition: "ط¨ط¹ط¯ طھظپط¹ظٹظ„ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©",
      refund: "ط؛ظٹط± ظ‚ط§ط¨ظ„ ظ„ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ ط§ظ„ط§ط³طھط±ط¯ط§ط¯",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      condition: "ط®ظ„ظ„ طھظ‚ظ†ظٹ ط¨ط¹ط¯ ط§ظ„ط¯ظپط¹",
      refund: "ط§ط³طھط±ط¯ط§ط¯ ظƒط§ظ…ظ„ ط£ظˆ طھظپط¹ظٹظ„ ظٹط¯ظˆظٹ",
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ظ‡ظٹط±ظˆ طھظƒطھظٹظƒظٹ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(20,184,166,0.12),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-background" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            âœ¦ ط³ظٹط§ط³ط© ط±ط®طµط© ط§ظ„ظ†ظپط§ط° ط§ظ„ط±ظ‚ظ…ظٹط©
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
            ط´ط±ظˆط· ط´ط±ط§ط، ط­ط²ظ… ط±ط®طµط© ط§ظ„ظ†ظپط§ط° ط§ظ„ط±ظ‚ظ…ظٹط©
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ظ†ظ„طھط²ظ… ط¨ط§ظ„ط´ظپط§ظپظٹط© ط§ظ„ظƒط§ظ…ظ„ط© ظپظٹ ط¨ظٹط¹ ط­ط²ظ… ط§ظ„ط±ط®طµط© ط§ظ„ط±ظ‚ظ…ظٹط© ظ…ط³ط¨ظ‚ط© ط§ظ„ط¯ظپط¹. ط§ظ‚ط±ط£ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط© ط¨ط¹ظ†ط§ظٹط© ظ‚ط¨ظ„ ط§ظ„ط´ط±ط§ط، ط£ظˆ ط§ظ„طھط³ط¬ظٹظ„.
          </p>
          <p className="mt-4 text-sm font-semibold text-primary/90 max-w-2xl mx-auto">
            ظ‚ط¨ظ„ ط§ظ„ط´ط±ط§ط، â€” ط§ط³طھط´ط± ط§ظ„ظ†ط§ط¸ط± ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹ âڑ–ï¸ڈ
          </p>
          <div className="mt-8 mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="mt-8 max-w-3xl mx-auto text-right">
            <LegalObserverChat page="ط³ظٹط§ط³ط© ط§ظ„ط§ط´طھط±ط§ظƒ" />
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
        </motion.div>

        <motion.section variants={staggerItem} className="mb-12">
          <div className="max-w-4xl mx-auto">
            <PlatformIdentityCard />
          </div>
        </motion.section>

        <motion.section variants={staggerItem} className="mb-16">
          <Card className="max-w-4xl mx-auto border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center text-white">ط·ط¨ظٹط¹ط© ط§ظ„ط®ط¯ظ…ط© ظˆط§ظ„ظ…ظ†طھط¬ ط§ظ„ط±ظ‚ظ…ظٹ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                طھظڈظ‚ط±ظ‘ ط§ظ„ظ…ظ†ط´ط£ط© ط§ظ„ظ…ط³طھظپظٹط¯ط© (طµط§ظ„ظˆظ† ط§ظ„ط­ظ„ط§ظ‚ط©) ط¨ط£ظ† ط§ظ„ظ…ظ†طھط¬ ط§ظ„ظ…ط´طھط±ظ‰ ط¹ط¨ط± ط§ظ„ظ…ظ†طµط© ظ‡ظˆ (ط­ط²ظ…ط© ط±ط®طµط© ظ„ط®ط¯ظ…ط§طھ ط¥ط¯ط±ط§ط¬ ط¨ط±ظ…ط¬ظٹط©
                ظ…ظˆط­ط¯ط©) ط¹ظ„ظ‰ ظ†ط¸ط§ظ… ط§ظ„ط±طµط¯ ط§ظ„ط°ظƒظٹ ط§ظ„طھظپط§ط¹ظ„ظٹ ظ„ظ…ظ†طµط© (ط­ظ„ط§ظ‚ ظ…ط§ط¨). ظ‡ط°ط§ ط§ظ„ظ…ظ†طھط¬ ظ‡ظˆ ظ…ط³ط§ط­ط© ط¨ط±ظ…ط¬ظٹط© ظ…ط®طµطµط© ظˆظ…ط·ظˆط±ط© ظ„ط¹ط±ط¶ ط§ظ„ط¨ظٹط§ظ†ط§طھ
                ط§ظ„ط¬ط؛ط±ط§ظپظٹط© ظˆط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھط´ط؛ظٹظ„ظٹط© ظ„ظ„طµط§ظ„ظˆظ†طŒ ظˆطھط­ط¯ظٹط«ظ‡ط§ طھظ‚ظ†ظٹظ‹ط§ ظ„ط±ط¨ط·ظ‡ ظˆط¥ط¯ط±ط§ط¬ ط¨ظٹط§ظ†ط§طھظ‡ ظ„ظ„ط¨ط§ط­ط«ظٹظ† ظپظٹ ظ…ط­ظٹط·ظ‡ ط§ظ„ط¬ط؛ط±ط§ظپظٹ.
                طھظڈط¹ط¯ ظ‡ط°ظ‡ ط­ط²ظ… ط§ظ„ط±ط®طµط© ظ…ظ†طھط¬ط§طھ ط±ظ‚ظ…ظٹط© ظ…ط³ط¨ظ‚ط© ط§ظ„ط¯ظپط¹ ظˆط؛ظٹط± ظ‚ط§ط¨ظ„ط© ظ„ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ط¨ط¹ط¯ ط§ظ„طھظپط¹ظٹظ„.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                {PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR}
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-4 text-center text-white">ط£ظ†ظˆط§ط¹ ط¨ط§ظ‚ط§طھ ط­ط²ظ… ط±ط®طµط© ط§ظ„ظ†ظپط§ط° ظˆط§ظ„ط£ط³ط¹ط§ط±</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            {SUBSCRIPTION_POLICY_TIERS_INTRO}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${tier.color}`} />
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl mb-2 text-white">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">{tier.priceSar}</span>
                      <span className="text-muted-foreground">ط±ظٹط§ظ„</span>
                    </div>
                    <CardDescription>{tier.periodLabelAr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-none p-0 m-0">
                      {tier.features.map((feature, idx) =>
                        feature.kind === "map_hero" ? (
                          <li key={idx} className="mb-1 list-none">
                            <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/18 via-primary/[0.06] to-cyan-500/12 p-3 shadow-md shadow-primary/15">
                              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3 sm:text-right">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-600 text-white shadow-md ring-2 ring-primary/15">
                                  <MapPin className="h-6 w-6" strokeWidth={2.25} aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5 text-center sm:text-right">
                                  <p className="text-sm font-bold text-foreground leading-snug">
                                    {MAP_FEATURE_HERO.title}
                                  </p>
                                  <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                    {MAP_FEATURE_HERO.subtitle}
                                  </p>
                                </div>
                                <CheckCircle2
                                  className="h-5 w-5 shrink-0 text-primary"
                                  aria-label="ظ…ط´ظ…ظˆظ„"
                                />
                              </div>
                            </div>
                          </li>
                        ) : (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature.value}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="mt-8 max-w-4xl mx-auto border-primary/20 bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs leading-relaxed text-muted-foreground text-justify">{LISTING_LICENSE_LEGAL_FOOTNOTE}</p>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">ط·ط±ظ‚ ط§ظ„ط¯ظپط¹ ط§ظ„ظ…طھط§ط­ط©</h2>
          <div className="max-w-2xl mx-auto">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.title}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <method.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-white">{method.title}</CardTitle>
                    </div>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {method.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-4 text-center text-white">ط¹ط¯ظ… ط§ظ„طھط¬ط¯ظٹط¯ ط§ظ„طھظ„ظ‚ط§ط¦ظٹ</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">ط¯ظپط¹ ظ„ظ…ط±ط© ظˆط§ط­ط¯ط© ظپظ‚ط·</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      ظ„ط§ ظٹظˆط¬ط¯ طھط¬ط¯ظٹط¯ طھظ„ظ‚ط§ط¦ظٹ ط´ظ‡ط±ظٹ ظˆظ„ط§ ط®طµظ… ط¯ظˆط±ظٹ ظ…ظ† ط¨ط·ط§ظ‚طھظƒ. ظƒظ„ ط¹ظ…ظ„ظٹط© ط´ط±ط§ط، طھظ…ط«ظ„ ط­ط²ظ…ط©ظ‹ ط¨ط±ظ…ط¬ظٹط© ط±ظ‚ظ…ظٹط§ظ‹ ظ…ط³ط¨ظ‚ ط§ظ„ط¯ظپط¹ ط¨ظ…ط¯ط©
                      ظ…ط­ط¯ط¯ط©.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">ط§ظ†طھظ‡ط§ط، ط§ظ„طµظ„ط§ط­ظٹط©</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      ط¹ظ†ط¯ ط§ظ†طھظ‡ط§ط، ظ…ط¯ط© ط­ط²ظ…ط© ط±ط®طµط© ط§ظ„ظ†ظپط§ط° طھطھظˆظ‚ظپ طµظ„ط§ط­ظٹط© ط§ظ„ط§ط³طھط¬ط§ط¨ط© ط§ظ„ط¨ط±ظ…ط¬ظٹط© ط¶ظ…ظ† ظ†ط¸ط§ظ… ط§ظ„ط§ط³طھط¬ط§ط¨ط© ط§ظ„ط°ظƒظٹط© ط­طھظ‰ ط´ط±ط§ط، ط­ط²ظ…ط© ط¬ط¯ظٹط¯ط© ط£ظˆ ط§ط³طھط±ط¯ط§ط¯ ظƒظˆط¯ طھظپط¹ظٹظ„.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">ط§ظ†طھظ‡ط§ط، ط­ط²ظ…ط© ط±ط®طµط© ط§ظ„ظ†ظپط§ط° ظˆط¥ط¹ط§ط¯ط© ط§ظ„ط´ط±ط§ط،</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cancellationSteps.map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">ط³ظٹط§ط³ط© ط§ط³طھط±ط¯ط§ط¯ ط§ظ„ط£ظ…ظˆط§ظ„</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {refundPolicy.map((policy, index) => (
              <motion.div
                key={policy.condition}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <policy.icon className={`w-12 h-12 mx-auto mb-3 ${policy.color}`} />
                    <CardTitle className="text-lg text-white">{policy.condition}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {policy.refund}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="mt-8 max-w-3xl mx-auto bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                <strong>ظ…ظ„ط§ط­ط¸ط© ظ‡ط§ظ…ط©:</strong> ط­ط²ظ… ط§ظ„ط±ط®طµط© ط§ظ„ط±ظ‚ظ…ظٹط© ظ…ط³ط¨ظ‚ط© ط§ظ„ط¯ظپط¹ ط؛ظٹط± ظ‚ط§ط¨ظ„ط© ظ„ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ط¨ط¹ط¯ طھظپط¹ظٹظ„ ظƒظˆط¯ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط©.
              </p>
            </CardContent>
          </Card>
          <Card className="mt-8 max-w-3xl mx-auto border-primary/25">
            <CardHeader>
              <CardTitle className="text-lg text-center">ط§ط³طھط±ط¯ط§ط¯ ظپظٹ ط­ط§ظ„ ط®ظ„ظ„ طھظ‚ظ†ظٹ ط¨ط¹ط¯ ظ†ط¬ط§ط­ ط§ظ„ط¯ظپط¹</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                ظپظٹ ط­ط§ظ„ ظ†ط¬ط§ط­ ط¹ظ…ظ„ظٹط© ط§ظ„ط¯ظپط¹ ظˆط¹ط¯ظ… طھظپط¹ظٹظ„ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط© ط£ظˆ ظƒظˆط¯ ط§ظ„طھظپط¹ظٹظ„ ط¨ط³ط¨ط¨ ط®ظ„ظ„ ظپظ†ظٹطŒ ظٹظ„طھط²ظ… ط§ظ„ظ…ظˆظ‚ط¹ ط¨ظ…ط¹ط§ظ„ط¬ط© ط§ظ„ط·ظ„ط¨ ظˆط¥ط¹ط§ط¯ط©
                ظƒط§ظ…ظ„ ط§ظ„ظ…ط¨ظ„ط؛ ظ„ظ„ط­ط³ط§ط¨ ط§ظ„ظ…طµط¯ط± ط®ظ„ط§ظ„ 7 ط¥ظ„ظ‰ 14 ظٹظˆظ… ط¹ظ…ظ„طŒ ظ…ط§ ظ„ظ… ظٹظپط¶ظ„ ط§ظ„ظ…ط´طھط±ظٹ طھظپط¹ظٹظ„ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط© ظٹط¯ظˆظٹط§ظ‹ ط¹ط¨ط± ط§ظ„طھظˆط§طµظ„ ظ…ط¹
                ط§ظ„ط¯ط¹ظ… ط§ظ„ظپظ†ظٹ.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">{SUBSCRIPTION_POLICY_EXPIRY.title}</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {SUBSCRIPTION_POLICY_EXPIRY.items.map((item, idx) => (
                  <div key={item.title}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {idx === 0 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      ) : idx === 1 ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground pr-7">{item.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-4 text-center text-white">{SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.title}</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            {SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.lead}
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.items.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">ط§ظ„طھظˆط¶ظٹط­ ط§ظ„ط¶ط±ظٹط¨ظٹ ظˆط£ظ…ظ† ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-white">ط§ظ„طھظˆط¶ظٹط­ ط§ظ„ط¶ط±ظٹط¨ظٹ (ط¶ط±ظٹط¨ط© ط§ظ„ظ‚ظٹظ…ط© ط§ظ„ظ…ط¶ط§ظپط©)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  ط¬ظ…ظٹط¹ ظ‚ظٹظ… ط­ط²ظ… ط§ظ„ط±ط®طµط© ط§ظ„ط±ظ‚ظ…ظٹط© ط§ظ„ظ…ظˆط¶ط­ط© ظ‡ظٹ ظ…ط¨ط§ظ„ط؛ ظ†ظ‡ط§ط¦ظٹط©طŒ ظˆظ„ط§ ظٹطھظ… طھط­طµظٹظ„ ط¶ط±ظٹط¨ط© ظ‚ظٹظ…ط© ظ…ط¶ط§ظپط© (VAT) ط­ط§ظ„ظٹط§ظ‹ ظ†ط¸ط±ط§ظ‹
                  ظ„ط¹ط¯ظ… ظˆطµظˆظ„ ط§ظ„ظ…ط¤ط³ط³ط© ظ„ظ„ط­ط¯ ط§ظ„ط¥ظ„ط²ط§ظ…ظٹ ظ„ظ„طھط³ط¬ظٹظ„ ط§ظ„ط¶ط±ظٹط¨ظٹ.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-white">ط£ظ…ظ† ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ ظˆط¨ظˆط§ط¨ط© ط§ظ„ط¯ظپط¹</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  ظٹطھظ… ظ…ط¹ط§ظ„ط¬ط© ط¬ظ…ظٹط¹ ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ ط¹ط¨ط± ظ…ط²ظˆط¯ ط®ط¯ظ…ط© ط¯ظپط¹ ظ…ط±ط®طµ ظ…ظ† ط§ظ„ط¨ظ†ظƒ ط§ظ„ظ…ط±ظƒط²ظٹ ط§ظ„ط³ط¹ظˆط¯ظٹ (SAMA)طŒ ظˆظ„ط§ ظٹظ‚ظˆظ… ط§ظ„ظ…ظˆظ‚ط¹
                  ط¨طھط®ط²ظٹظ† ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¨ط·ط§ظ‚ط§طھ ط§ظ„ط§ط¦طھظ…ط§ظ†ظٹط© ظ„ط¯ظٹظ‡.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">ط§ظ„ط´ط±ظˆط· ظˆط§ظ„ط£ط­ظƒط§ظ… ط§ظ„ط¹ط§ظ…ط©</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">
                    طھط­طھظپط¸ ظ…ظ†طµط© ط­ظ„ط§ظ‚ ظ…ط§ط¨ ط¨ط§ظ„ط­ظ‚ ظپظٹ طھط¹ط¯ظٹظ„ ط§ظ„ط£ط³ط¹ط§ط± ظˆط§ظ„ط¨ط§ظ‚ط§طھ ظ…ط¹ ط¥ط´ط¹ط§ط± ظ…ط³ط¨ظ‚ ظ„ظ…ط¯ط© 30 ظٹظˆظ…ط§ظ‹.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">
                    ظٹط¬ط¨ ط¹ظ„ظ‰ ط§ظ„ط­ظ„ط§ظ‚ ط§ظ„ط§ظ„طھط²ط§ظ… ط¨ظ…ط¹ط§ظٹظٹط± ط§ظ„ط¬ظˆط¯ط© ظˆط§ظ„ط§ط­طھط±ط§ظپظٹط©. ظ‚ط¯ ظٹطھظ… طھط¹ظ„ظٹظ‚ ط§ظ„ط­ط³ط§ط¨ ظپظٹ ط­ط§ظ„ط© ط§ظ„ظ…ط®ط§ظ„ظپط§طھ.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">
                    ط§ظ„ظ…ظ†طµط© ط؛ظٹط± ظ…ط³ط¤ظˆظ„ط© ط¹ظ† ط¬ظˆط¯ط© ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط© ظ…ظ† ط§ظ„ط­ظ„ط§ظ‚ظٹظ†. ط§ظ„ط¹ظ„ط§ظ‚ط© ط§ظ„طھط¹ط§ظ‚ط¯ظٹط© ظ…ط¨ط§ط´ط±ط© ط¨ظٹظ† ط§ظ„ط­ظ„ط§ظ‚ ظˆط§ظ„ط¹ظ…ظٹظ„.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <p className="text-sm">
                    ظٹط´طھط±ط· ط§ظ„طھط£ط´ظٹط± ط¹ظ„ظ‰ طھط¹ظ‡ط¯ ط§ظ„ظ…ط´طھط±ظƒ ط¨ط£ظ† ظ…ظ†ط´ط£طھظ‡ ظ…ظ…طھط«ظ„ط© ظ„ط§ط´طھط±ط§ط·ط§طھ ط§ظ„ط¬ظ‡ط§طھ ط°ط§طھ ط§ظ„ط¹ظ„ط§ظ‚ط© ظ„ظ…ظ…ط§ط±ط³ط© ظ†ط´ط§ط· ط§ظ„ط­ظ„ط§ظ‚ط© ط¨ط´ظƒظ„
                    ط±ط³ظ…ظٹطŒ ظˆط£ظ†ظ‡ ظٹطھط­ظ…ظ„ ظƒط§ظ…ظ„ ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط© ط§ظ„ظ†ط¸ط§ظ…ظٹط© ط¹ظ† طµط­ط© ظ‡ط°ط§ ط§ظ„طھط¹ظ‡ط¯. طھطھظ… ظ…ط±ط§ط¬ط¹ط© ظ‡ط°ط§ ط§ظ„طھط¹ظ‡ط¯ طھظ‚ظ†ظٹط§ظ‹طŒ ظˆطھظڈط±ط³ظ„
                    طھظ†ط¨ظٹظ‡ط§طھ طھظ‚ظ†ظٹط© ط¹ظ†ط¯ ط±طµط¯ ظ…ط®ط§ظ„ظپط§طھ ط£ظˆ طھط¬ط§ظˆط²ط§طھ ظپظٹ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط© ط£ظˆ ط§ظ„طµظˆط± ط£ظˆ ظ…ط­طھظˆظ‰ ط§ظ„ط´ط§طھ ط§ظ„ظƒطھط§ط¨ظٹطŒ
                    ظˆظٹط¬ظˆط² ظ„ظ„ظ…ظ†طµط© ط±ظپط¶ ط§ظ„ط·ظ„ط¨ ط£ظˆ ط¥ظٹظ‚ط§ظپ ط­ط²ظ…ط© ط§ظ„ط±ط®طµط© ظپظˆط±ط§ظ‹ ظˆظپظ‚ ط§ظ„ط³ظٹط§ط³ط© ط§ظ„ظ…ط¹طھظ…ط¯ط©.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">5</span>
                  </div>
                  <p className="text-sm">
                    ظپظٹ ط­ط§ظ„ط© ط§ظ„ظ†ط²ط§ط¹ط§طھطŒ ظٹطھظ… ط§ظ„ط±ط¬ظˆط¹ ط¥ظ„ظ‰ ط§ظ„ط£ظ†ط¸ظ…ط© ظˆط§ظ„ظ„ظˆط§ط¦ط­ ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡ط§ ظپظٹ ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ط¹ظˆط¯ظٹط©.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* â•گâ•گ ط§ظ„ط¯ط¹ظ… ط§ظ„ظپظ†ظٹ â€” طھطµظ…ظٹظ… طھظ‚ظ†ظٹ ظ…طھظˆظ‡ط¬ â•گâ•گ */}
        <motion.section variants={staggerItem} className="relative overflow-hidden rounded-3xl" dir="rtl"
          style={{
            background: 'linear-gradient(160deg,#040d1a 0%,#020810 50%,#040d1a 100%)',
            border: '1px solid rgba(20,184,166,0.14)',
          }}
        >
          {/* ط¥ط¶ط§ط،ط© ظٹظ…ظٹظ† ظˆظٹط³ط§ط± â€” ط¹ط±ط¶ طھظ‚ظ†ظٹ */}
          <div className="pointer-events-none absolute inset-0">
            {/* ظٹظ…ظٹظ† */}
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-500/14 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-48 w-64 rounded-full bg-cyan-400/10 blur-[70px]" />
            {/* ظٹط³ط§ط± */}
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/14 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-48 w-64 rounded-full bg-indigo-400/10 blur-[70px]" />
            {/* ظˆط³ط· ط¹ظ„ظˆظٹ */}
            <div className="absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-teal-400/6 blur-[80px]" />
            {/* ط®ط· ظ…ط³ط­ ظ…طھط­ط±ظƒ */}
            <motion.div
              className="absolute inset-y-0 w-[30%] opacity-40"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(20,184,166,0.06),transparent)' }}
              animate={{ x: ['-100%', '450%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
            />
            {/* ظ†ظ‚ط§ط· ط´ط¨ظƒظٹط© ط®ظ„ظپظٹط© */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle,rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </div>

          <div className="relative px-8 py-12">
            {/* ط§ظ„ط±ط£ط³ظٹط© */}
            <div className="mb-10 text-center">
              <motion.div
                variants={fadeInUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-teal-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                ظ‚ظ†ظˆط§طھ ط§ظ„ط¯ط¹ظ… آ· ظ…طھط§ط­ط© ط§ظ„ط¢ظ†
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-black text-white md:text-4xl"
                style={{ textShadow: '0 0 40px rgba(20,184,166,0.25)' }}
              >
                ط·ط±ظ‚ ط§ظ„ط¯ط¹ظ… ط§ظ„ظ…طھط§ط­ط©
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-2 text-sm text-slate-400">
                ظپط±ظٹظ‚ ط­ظ„ط§ظ‚ ظ…ط§ط¨ ط¬ط§ظ‡ط² ط¹ط¨ط± ط«ظ„ط§ط« ظ‚ظ†ظˆط§طھ â€” ط§ط®طھط± ط§ظ„ط£ظ†ط³ط¨ ظ„ظƒ
              </motion.p>
            </div>

            {/* ط§ظ„ظƒط±ظˆطھ */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  icon: Phone,
                  label: 'ط§ظ„ظ‡ط§طھظپ',
                  badge: '10 طµ â€“ 5 ظ…',
                  value: `+${PARTNER_SUPPORT_PHONE_E164}`,
                  href: `tel:+${PARTNER_SUPPORT_PHONE_E164}`,
                  accentFrom: '#0f766e', accentTo: '#14b8a6',
                  border: 'rgba(20,184,166,0.35)', glow: 'rgba(20,184,166,0.20)',
                  desc: 'طھط­ط¯ظ‘ط« ظ…ط¨ط§ط´ط±ط© ظ…ط¹ ظپط±ظٹظ‚ ط§ظ„ط¯ط¹ظ…',
                },
                {
                  icon: MessageSquare,
                  label: 'ظˆط§طھط³ط§ط¨',
                  badge: 'ط±ط¯ ظپظˆط±ظٹ',
                  value: 'ط±ط§ط³ظ„ظ†ط§ ط¹ظ„ظ‰ ظˆط§طھط³ط§ط¨',
                  href: PARTNER_SUPPORT_WHATSAPP_URL,
                  accentFrom: '#166534', accentTo: '#22c55e',
                  border: 'rgba(34,197,94,0.35)', glow: 'rgba(34,197,94,0.20)',
                  desc: 'ط£ط³ط±ط¹ ظ‚ظ†ط§ط© â€” ط±ط¯ ط®ظ„ط§ظ„ ط¯ظ‚ط§ط¦ظ‚',
                  external: true,
                },
                {
                  icon: Mail,
                  label: 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ',
                  badge: 'ط®ظ„ط§ظ„ 24 ط³ط§ط¹ط©',
                  value: PARTNER_SUPPORT_EMAIL,
                  href: `mailto:${PARTNER_SUPPORT_EMAIL}`,
                  accentFrom: '#1e1b4b', accentTo: '#818cf8',
                  border: 'rgba(129,140,248,0.35)', glow: 'rgba(129,140,248,0.20)',
                  desc: 'ظ„ظ„ط§ط³طھظپط³ط§ط±ط§طھ ط§ظ„طھظپطµظٹظ„ظٹط© ظˆط§ظ„ظˆط«ط§ط¦ظ‚',
                },
              ].map((ch, i) => (
                <motion.a
                  key={ch.label}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl p-6 text-center no-underline transition-all duration-300"
                  style={{
                    border: `1px solid ${ch.border}`,
                    background: `linear-gradient(155deg,${ch.accentFrom}22 0%,#040d1a 55%,${ch.accentTo}10 100%)`,
                    boxShadow: `0 0 30px ${ch.glow},inset 0 1px 0 ${ch.border}`,
                  }}
                >
                  {/* طھظˆظ‡ط¬ hover */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%,${ch.accentTo}12,transparent)` }}
                  />

                  {/* ط§ظ„ط£ظٹظ‚ظˆظ†ط© */}
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg,${ch.accentFrom}40,${ch.accentTo}28)`,
                      border: `1px solid ${ch.border}`,
                      boxShadow: `0 0 20px ${ch.glow}`,
                    }}
                  >
                    <ch.icon className="h-6 w-6" style={{ color: ch.accentTo }} />
                    {/* ظ†ط¨ط¶ */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `1px solid ${ch.accentTo}`, opacity: 0 }}
                      animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
                    />
                  </div>

                  {/* ط§ظ„ط¨ط§ط¯ط¬ */}
                  <div
                    className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold"
                    style={{ background: `${ch.accentTo}20`, color: ch.accentTo, border: `1px solid ${ch.border}` }}
                  >
                    {ch.badge}
                  </div>

                  {/* ط§ظ„ظ†طµ */}
                  <div>
                    <p className="text-base font-black text-white">{ch.label}</p>
                    <p className="mt-0.5 text-[0.7rem] text-slate-400">{ch.desc}</p>
                  </div>

                  {/* ط§ظ„ظ‚ظٹظ…ط© */}
                  <p
                    className="break-all text-sm font-bold transition-colors group-hover:underline"
                    style={{ color: ch.accentTo }}
                  >
                    {ch.value}
                  </p>
                </motion.a>
              ))}
            </div>

            {/* ط®ط· طھظ‚ظ†ظٹ ط³ظپظ„ظٹ */}
            <div className="mt-10 flex items-center justify-between gap-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,rgba(20,184,166,0.25),transparent)' }} />
              <p className="text-[0.65rem] font-bold tracking-widest text-slate-600">HALAQ MAP آ· SUPPORT NETWORK</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,rgba(20,184,166,0.25),transparent)' }} />
            </div>
          </div>
        </motion.section>

        <motion.div variants={fadeInUp} className="mt-16 max-w-4xl mx-auto">
          <HonorBoard context="legal" variant="legal" />
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-16 text-center space-y-6">
          <Card className="max-w-2xl mx-auto border-border/80">
            <CardHeader>
              <CardTitle className="text-base">ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط¬ط§ط±ظٹط© ظ„ظ„ظ…ظ†ط´ط£ط©</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{LEGAL_TRADE_NAME_AR}</p>
              <p>
                ط§ظ„ط±ظ‚ظ… ط§ظ„ظˆط·ظ†ظٹ ط§ظ„ظ…ظˆط­ط¯ ظ„ظ„ظ…ظ†ط´ط£ط©:{' '}
                <span dir="ltr" className="font-mono">
                  {LEGAL_NATIONAL_UNIFIED_NUMBER}
                </span>
              </p>
              {commercialReg ? (
                <p>
                  ط±ظ‚ظ… ط§ظ„ط³ط¬ظ„ ط§ظ„طھط¬ط§ط±ظٹ: <span dir="ltr">{commercialReg}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                ط¢ط®ط± طھط­ط¯ظٹط«: 4 ظ…ط§ظٹظˆ 2026 | ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط© آ© 2026 ط­ظ„ط§ظ‚ ظ…ط§ط¨
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
