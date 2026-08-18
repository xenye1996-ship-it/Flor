// Curated Unsplash photography (free to use, Unsplash License) standing in
// for real product shots until the studio's own catalog photos are ready.
function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop&ixlib=rb-4.1.0`;
}

export const productPhotos: Record<string, string> = {
  "sotsvetie-lavanda": unsplash("photo-1750369326137-21de716e3224"),
  dymka: unsplash("photo-1723754165766-59f822535850"),
  kompakt: unsplash("photo-1742751577995-c43de6f64ba1"),
  korobka: unsplash("photo-1676214120497-51afc5b7f7dd"),
};

export const heroPhoto = "/hero/bouquet.jpg";
export const storyPhoto = unsplash("photo-1782038522351-ff45b74aa349", 900);
export const galleryPhoto = unsplash("photo-1572454591674-2739f30d8c40", 900);
