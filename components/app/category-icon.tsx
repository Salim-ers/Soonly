import * as Icons from "lucide-react";
import { categoryMeta } from "@/lib/constants";
import type { ReminderCategory } from "@prisma/client";

/** Pastille catégorie colorée avec l'icône lucide correspondante. */
export function CategoryTile({ category, size = 42 }: { category: ReminderCategory; size?: number }) {
  const meta = categoryMeta(category);
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[meta.icon] ?? Icons.Tag;
  return (
    <span className="flex flex-none items-center justify-center rounded-[13px] text-white" style={{ width: size, height: size, background: meta.color }}>
      <Icon style={{ width: size * 0.45, height: size * 0.45 }} />
    </span>
  );
}

export function CategoryDot({ category }: { category: ReminderCategory }) {
  return <span className="h-[9px] w-[9px] rounded-full" style={{ background: categoryMeta(category).color }} />;
}
