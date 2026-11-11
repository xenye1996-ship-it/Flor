import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  appendAudit,
  getAudit,
  getLanding,
  getPhotos,
  getProducts,
  getReviews,
  getSite,
  saveLanding,
  savePhotos,
  saveProducts,
  saveReviews,
  saveSite,
} from "@/lib/content/store";
import type {
  LandingContent,
  PhotosContent,
  Product,
  ReviewsContent,
  SiteInfo,
} from "@/lib/content/types";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [site, products, landing, photos, reviews, audit] = await Promise.all([
    getSite(),
    getProducts(),
    getLanding(),
    getPhotos(),
    getReviews(),
    getAudit(100),
  ]);

  return NextResponse.json({
    site,
    products,
    landing,
    photos,
    reviews,
    audit,
    actor: session.login,
  });
}

type SaveBody = {
  section: "site" | "products" | "landing" | "photos" | "reviews";
  data: unknown;
};

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SaveBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const labels: Record<SaveBody["section"], string> = {
    site: "Контакты и сайт",
    products: "Каталог",
    landing: "Лендинг",
    photos: "Картинки",
    reviews: "Отзывы",
  };

  try {
    switch (body.section) {
      case "site":
        await saveSite(body.data as SiteInfo);
        break;
      case "products":
        await saveProducts(body.data as Product[]);
        break;
      case "landing":
        await saveLanding(body.data as LandingContent);
        break;
      case "photos":
        await savePhotos(body.data as PhotosContent);
        break;
      case "reviews":
        await saveReviews(body.data as ReviewsContent);
        break;
      default:
        return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка сохранения" },
      { status: 500 },
    );
  }

  await appendAudit({
    actor: session.login,
    action: "save",
    details: `Сохранено: ${labels[body.section]}`,
  });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
