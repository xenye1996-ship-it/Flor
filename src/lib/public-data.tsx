"use client";

import { createContext, useContext } from "react";
import type {
  PhotosContent,
  Product,
  ReviewsContent,
  SiteInfo,
} from "@/lib/content/types";

type PublicData = {
  site: SiteInfo;
  products: Product[];
  photos: PhotosContent;
  reviews: ReviewsContent;
};

const PublicDataContext = createContext<PublicData | null>(null);

export function PublicDataProvider({
  value,
  children,
}: {
  value: PublicData;
  children: React.ReactNode;
}) {
  return (
    <PublicDataContext.Provider value={value}>
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  const ctx = useContext(PublicDataContext);
  if (!ctx) throw new Error("usePublicData must be used within PublicDataProvider");
  return ctx;
}

export function useProductBySlug(slug: string) {
  const { products } = usePublicData();
  return products.find((p) => p.slug === slug);
}

export function useProductPhoto(slug: string) {
  const { photos } = usePublicData();
  return photos.products[slug] || "/hero/bouquet.jpg";
}
