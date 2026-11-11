import { reviewUrl } from "@/lib/business-profile";

/** Small "Review us on Google" link for footers, the contact page, or thank-you messages. */
export default function ReviewUsButton({ className = "g-review-link", label = "★ Review us on Google" }: {
  className?: string;
  label?: string;
}) {
  const href = reviewUrl();
  if (!href) return null;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
