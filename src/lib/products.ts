export type {
  Occasion,
  Product,
  Review,
} from "@/lib/content/types";

export const occasionLabels: Record<
  import("@/lib/content/types").Occasion,
  string
> = {
  date: "На свидание",
  sorry: "Извиниться",
  mom: "Маме",
  birthday: "На день рождения",
  "just-because": "Просто так",
};

export const filters = [
  "Все",
  "Гортензии",
  "До 2000 ₽",
  "На свидание",
  "Извиниться",
  "Маме",
];
