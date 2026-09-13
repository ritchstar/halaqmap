"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
 ArrowLeft,
 ArrowRight,
 Check,
 ChevronDown,
 Clock3,
 ExternalLink,
 Heart,
 ImageIcon,
 Camera,
 MapPin,
 MessageCircle,
 Play,
 ShieldCheck,
 Sparkles,
 Star,
 Truck,
 X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const galleryItems = [
 { id: "g1", title: "صندوق مواليد ناعم", occasion: "مواليد", image: "/halana-hero.webp", note: "ألوان هادئة وتفاصيل تحمل الاسم" },
 { id: "g2", title: "تشكيلة ضيافة فاخرة", occasion: "ضيافة", image: "/halana-maamoul.webp", note: "مزيج من المعمول والشكولاتة" },
 { id: "g3", title: "كيكة احتفال صغيرة", occasion: "أعياد ميلاد", image: "/halana-baklava.webp", note: "نصممها على ثيم مناسبتك" },
 { id: "g4", title: "هدايا شكر", occasion: "هدايا", image: "/halana-chocolate.webp", note: "تغليف فردي مناسب للتوزيعات" },
];

const readyItems = [
 { name: "معمول الفستق", detail: "علبة 12 حبة", price: 68, image: "/halana-maamoul.webp" },
 { name: "تشكيلة غيوة", detail: "علبة 18 حبة", price: 92, image: "/halana-chocolate.webp" },
 { name: "بقلاوة البيت", detail: "صحن 500 جم", price: 76, image: "/halana-baklava.webp" },
];
