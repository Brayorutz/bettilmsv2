import { useEffect } from "react";

export default function Seo({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;
    if (!description) return;

    const existing = document.querySelector('meta[name="description"]');
    if (existing) {
      existing.setAttribute("content", description);
      return;
    }
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = description;
    document.head.appendChild(meta);
  }, [title, description]);

  return null;
}
