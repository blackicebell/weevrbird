export type PastedContentKind = "article" | "video" | "image" | "resource" | "text";

export function getPastedContentKind(text: string): PastedContentKind {
  const normalized = text.trim().toLowerCase();
  if (!/^https?:\/\//.test(normalized)) return "text";
  if (/\.(png|jpe?g|gif|webp|heic)(\?|#|$)/.test(normalized)) return "image";
  if (/(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|instagram\.com\/reel)/.test(normalized)) return "video";
  if (/\.(pdf|docx?|xlsx?|zip)(\?|#|$)/.test(normalized)) return "resource";
  return "article";
}

export function getPasteNotice(kind: PastedContentKind) {
  if (kind === "article") return "Article link pasted. Add why it is worth reading before saving.";
  if (kind === "video") return "Video link pasted. Add who it helps and what moment is worth watching.";
  if (kind === "image") return "Image link pasted. Add context so people know why it belongs here.";
  if (kind === "resource") return "Resource link pasted. Add what it helps someone do.";
  return "Text pasted from clipboard. Add why it is worth sharing before saving.";
}
