import { SOCIAL } from "@/content/site";
import { BrandIcon, type BrandName } from "./icons";

/** Social profile links from src/content/site.ts. Empty entries are hidden. */
export default function SocialIcons() {
  const entries = (Object.entries(SOCIAL) as [BrandName, string][]).filter(([, url]) => Boolean(url));
  if (entries.length === 0) return null;
  return (
    <div className="social">
      {entries.map(([name, url]) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`WEEE Centre on ${name}`}>
          <BrandIcon name={name} size={18} />
        </a>
      ))}
    </div>
  );
}
