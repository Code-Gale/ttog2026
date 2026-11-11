"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { API_URL } from "@/lib/constants";

type Photo = { id: string; filename: string; caption: string };
export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  useEffect(() => { let active = true; fetch(`${API_URL.replace(/\/api$/, "")}/api/gallery/photos`).then(response => response.ok ? response.json() : []).then(result => { if (active && Array.isArray(result)) setPhotos(result); }).catch(() => undefined); return () => { active = false; }; }, []);
  if (!photos.length) return null;
  return <section className="gallery-section"><div className="gallery-heading"><span>✦ &nbsp; A GLIMPSE OF THE EVENING &nbsp; ✦</span><h2>Gathered in <em>good company.</em></h2></div><div className="gallery-grid">{photos.map((photo, index) => <figure key={photo.id} className={index === 0 ? "gallery-photo gallery-photo-featured" : "gallery-photo"}><Image src={`${API_URL.replace(/\/api$/, "")}/uploads/${encodeURIComponent(photo.filename)}`} alt={photo.caption || "TomTom of Gala event photograph"} fill sizes="(max-width:700px) 90vw, 32vw" unoptimized/><figcaption>{photo.caption || "The Royal Affairs"}</figcaption></figure>)}</div></section>;
}
