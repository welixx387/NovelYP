// Единый источник истины для "enum"-подобных полей (SQLite хранит их как String).
// zod-схемы и Prisma-запросы опираются именно на эти массивы/типы.

export const ROLES = ["USER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const NOVEL_STATUSES = ["ONGOING", "COMPLETED", "HIATUS"] as const;
export type NovelStatus = (typeof NOVEL_STATUSES)[number];

export const SUBSCRIPTION_PLANS = ["MONTHLY", "YEARLY", "LIFETIME"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = ["NONE", "ACTIVE", "EXPIRED"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "EXPIRED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const READER_THEMES = ["dark", "light", "sepia"] as const;
export type ReaderTheme = (typeof READER_THEMES)[number];

export const READER_FONTS = ["sans", "serif", "mono"] as const;
export type ReaderFont = (typeof READER_FONTS)[number];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
}

export interface NovelCardData {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  author: string;
  status: NovelStatus;
  year: number;
  rating: number;
  ratingCount: number;
  genres: string[];
  chaptersCount: number;
  lastChapterAt: string | null;
}

export interface ChapterListItem {
  id: string;
  number: number;
  title: string;
  isPremium: boolean;
  publishedAt: string;
}

export interface ContinueReadingItem {
  novelSlug: string;
  novelTitle: string;
  coverUrl: string;
  chapterNumber: number;
  chapterId: string;
  scrollPercent: number;
  updatedAt: string;
}
