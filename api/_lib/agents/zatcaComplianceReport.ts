import {
  ZATCA_MANDATORY_LIMIT_SAR,
  ZATCA_PREPARED_VAT_RATE_PERCENT,
  ZATCA_SOFT_ALERT_FRACTION,
  ZATCA_VOLUNTARY_LIMIT_SAR,
  type ZatcaComplianceReport,
  type ZatcaComplianceThresholdRow,
  type ZatcaHypotheticalScenario,
  type ZatcaRevenueAnalytics,
} from './zatcaTaxTypes.js';
import {
  INVOICE_DIAMOND_LICENSE_LABEL_AR,
  INVOICE_DIAMOND_WITH_ADDON_LABEL_AR,
} from '../subscriptionPricingCopy.js';

function roundSar(n: number): number {
  return Math.round(n * 100) / 100;
}

function vatOnSubtotal(subtotalSar: number, ratePercent = ZATCA_PREPARED_VAT_RATE_PERCENT): number {
  return roundSar((subtotalSar * ratePercent) / 100);
}

function buildThresholdRows(currentSar: number): ZatcaComplianceThresholdRow[] {
  const softAlertSar = Math.floor(ZATCA_VOLUNTARY_LIMIT_SAR * ZATCA_SOFT_ALERT_FRACTION);
  const rows: ZatcaComplianceThresholdRow[] = [
    {
      id: 'soft_review',
      labelAr: 'مراجعة استباقية (50% من الحد الاختياري)',
      limitSar: softAlertSar,
      remainingSar: Math.max(0, softAlertSar - currentSar),
      breached: currentSar >= softAlertSar,
      actionAr: 'راجع متطلبات التسجيل الاختياري وخطط للامتثال — لا يلزم تفعيل ض.ق.م على الواجهة بعد.',
    },
    {
      id: 'voluntary',
      labelAr: 'حد التسجيل الاختياري (ZATCA / الزكاة والدخل)',
      limitSar: ZATCA_VOLUNTARY_LIMIT_SAR,
      remainingSar: Math.max(0, ZATCA_VOLUNTARY_LIMIT_SAR - currentSar),
      breached: currentSar >= ZATCA_VOLUNTARY_LIMIT_SAR,
      actionAr: 'يُستحسن التسجيل الضريبي اختيارياً — جهّز السجل التجاري ورقم ضريبي؛ يمكن تأجيل عرض ض.ق.م للعملاء حتى قرار الإدارة.',
    },
    {
      id: 'mandatory',
      labelAr: 'حد التسجيل الإلزامي — بلوغه يلزم التسجيل والامتثال',
      limitSar: ZATCA_MANDATORY_LIMIT_SAR,
      remainingSar: Math.max(0, ZATCA_MANDATORY_LIMIT_SAR - currentSar),
      breached: currentSar >= ZATCA_MANDATORY_LIMIT_SAR,
      actionAr: 'إلزامي نظامياً: سجّل في ZATCA، فعّل الفوترة الإلكترونية، وفعّل عرض ض.ق.م 15% على واجهات الدفع.',
    },
    {
      id: 'platform_vat_ui',
      labelAr: 'تفعيل عرض ض.ق.م على منصة حلاق ماب (واجهة الدفع)',
      limitSar: ZATCA_MANDATORY_LIMIT_SAR,
      remainingSar: Math.max(0, ZATCA_MANDATORY_LIMIT_SAR - currentSar),
      breached: currentSar >= ZATCA_MANDATORY_LIMIT_SAR,
      actionAr: `عند بلوغ ${ZATCA_MANDATORY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س إيرادات مُرصَدة (أو عند حصولكم على رقم ضريبي): فعّلوا الضريبة من إعدادات المنصة بنسبة ${ZATCA_PREPARED_VAT_RATE_PERCENT}%.`,
    },
  ];
  return rows;
}

function buildHypotheticalScenarios(): ZatcaHypotheticalScenario[] {
  const packages = [
    { labelAr: 'حزمة برونزية (100 ر.س)', subtotalSar: 100 },
    { labelAr: 'حزمة ذهبية (150 ر.س)', subtotalSar: 150 },
    { labelAr: INVOICE_DIAMOND_LICENSE_LABEL_AR, subtotalSar: 200 },
    { labelAr: INVOICE_DIAMOND_WITH_ADDON_LABEL_AR, subtotalSar: 225 },
  ];

  const invoiceScenarios: ZatcaHypotheticalScenario[] = packages.map((p) => {
    const vatSar = vatOnSubtotal(p.subtotalSar);
    return {
      kind: 'invoice',
      labelAr: p.labelAr,
      subtotalSar: p.subtotalSar,
      vatRatePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
      vatSar,
      totalSar: roundSar(p.subtotalSar + vatSar),
      noteAr: `إذا فُعّلت ض.ق.م ${ZATCA_PREPARED_VAT_RATE_PERCENT}% على الواجهة.`,
    };
  });

  const annualAtMandatory = ZATCA_MANDATORY_LIMIT_SAR;
  const annualVatEstimate = vatOnSubtotal(annualAtMandatory);
  invoiceScenarios.push({
    kind: 'annual_projection',
    labelAr: `تقدير سنوي عند الحد الإلزامي (${annualAtMandatory.toLocaleString('ar-SA')} ر.س إيرادات خاضعة)`,
    subtotalSar: annualAtMandatory,
    vatRatePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
    vatSar: annualVatEstimate,
    totalSar: roundSar(annualAtMandatory + annualVatEstimate),
    noteAr: 'افتراض: كامل الإيرادات خاضعة للضريبة — للتخطيط فقط وليس استشارة قانونية.',
  });

  return invoiceScenarios;
}

function buildVatActivationSummary(
  currentSar: number,
  analytics: ZatcaRevenueAnalytics | null | undefined,
): ZatcaComplianceReport['vatActivationGuidance'] {
  const mandatoryBreached = currentSar >= ZATCA_MANDATORY_LIMIT_SAR;
  const voluntaryBreached = currentSar >= ZATCA_VOLUNTARY_LIMIT_SAR;
  const daysToMandatory = analytics?.daysToMandatoryLimit ?? null;
  const projected30 = analytics?.projectedRevenue30dSar ?? null;

  let recommendEnableUiVat = mandatoryBreached;
  let urgency: ZatcaComplianceReport['vatActivationGuidance']['urgency'] = 'monitor';

  if (mandatoryBreached) urgency = 'immediate';
  else if (projected30 != null && projected30 >= ZATCA_MANDATORY_LIMIT_SAR) urgency = 'prepare_now';
  else if (voluntaryBreached) urgency = 'prepare_soon';
  else if (currentSar >= ZATCA_VOLUNTARY_LIMIT_SAR * ZATCA_SOFT_ALERT_FRACTION) urgency = 'monitor';

  if (projected30 != null && projected30 >= ZATCA_MANDATORY_LIMIT_SAR * 0.85) {
    recommendEnableUiVat = false;
    urgency = urgency === 'immediate' ? 'immediate' : 'prepare_now';
  }

  const triggerSar = ZATCA_MANDATORY_LIMIT_SAR;
  let summaryAr: string;

  if (mandatoryBreached) {
    summaryAr = `بلغت الإيرادات المُرصَدة ${currentSar.toLocaleString('ar-SA')} ر.س — تجاوزت الحد الإلزامي ${triggerSar.toLocaleString('ar-SA')} ر.س. يُنصح بتفعيل عرض ض.ق.م ${ZATCA_PREPARED_VAT_RATE_PERCENT}% فوراً من إعدادات المنصة بعد التحقق من شهادة التسجيل.`;
  } else if (daysToMandatory != null && daysToMandatory <= 30) {
    summaryAr = `وفق وتيرة التدفق الحالية، قد تبلغون الحد الإلزامي (${triggerSar.toLocaleString('ar-SA')} ر.س) خلال نحو ${daysToMandatory} يوماً. جهّزوا التسجيل في ZATCA وخططوا لتفعيل الضريبة على الواجهة عند ${triggerSar.toLocaleString('ar-SA')} ر.س أو عند إصدار الرقم الضريبي — أيهما أسبق.`;
  } else if (voluntaryBreached) {
    summaryAr = `تجاوزتم حد التسجيل الاختياري (${ZATCA_VOLUNTARY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س). يُفضّل التسجيل في ZATCA؛ تفعيل عرض ض.ق.م للعملاء يُؤجَّل حتى ${triggerSar.toLocaleString('ar-SA')} ر.س إيرادات أو وجود رقم ضريبي فعّال.`;
  } else {
    summaryAr = `الإيرادات الحالية ${currentSar.toLocaleString('ar-SA')} ر.س — لم يُبلَغ بعد حد تفعيل العرض الإلزامي. الرقم المرجعي لتفعيل ض.ق.م على المنصة: ${triggerSar.toLocaleString('ar-SA')} ر.س إيرادات مُرصَدة (أو عند التسجيل الضريبي الإلزامي).`;
  }

  return {
    triggerSar,
    triggerLabelAr: 'تفعيل عرض ض.ق.م على واجهات الدفع',
    recommendEnableUiVat: mandatoryBreached,
    urgency,
    summaryAr,
    voluntaryLimitSar: ZATCA_VOLUNTARY_LIMIT_SAR,
    mandatoryLimitSar: ZATCA_MANDATORY_LIMIT_SAR,
    preparedVatRatePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
  };
}

/** تقرير استباقي — حتى بدون إيرادات فعلية يُظهر افتراضات وحدود ZATCA */
export function buildZatcaComplianceReport(
  analytics?: ZatcaRevenueAnalytics | null,
): ZatcaComplianceReport {
  const currentSar = analytics?.totalHistoricalSar ?? 0;
  const thresholds = buildThresholdRows(currentSar);
  const hypotheticalScenarios = buildHypotheticalScenarios();
  const vatActivationGuidance = buildVatActivationSummary(currentSar, analytics);

  const monthlyPackagesNeededForMandatory =
    analytics && analytics.dailyVelocitySar > 0
      ? Math.ceil(
          Math.max(0, ZATCA_MANDATORY_LIMIT_SAR - currentSar) /
            Math.max(analytics.monthlyVelocitySar, analytics.dailyVelocitySar * 30),
        )
      : null;

  return {
    generatedAt: new Date().toISOString(),
    disclaimerAr:
      'تقديرات تشغيلية للمنصة — ليست استشارة قانونية أو ضريبية. راجع مستشاراً مرخصاً وبوابة ZATCA الرسمية قبل أي قرار.',
    currentRevenueSar: currentSar,
    dailyVelocitySar: analytics?.dailyVelocitySar ?? 0,
    projectedRevenue30dSar: analytics?.projectedRevenue30dSar ?? null,
    daysToMandatoryLimit: analytics?.daysToMandatoryLimit ?? null,
    thresholds,
    vatActivationGuidance,
    hypotheticalScenarios,
    monthlyRunRateSar: analytics?.monthlyVelocitySar ?? null,
    estimatedMonthsToMandatory: monthlyPackagesNeededForMandatory,
  };
}
