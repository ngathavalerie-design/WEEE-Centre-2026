import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
        <span className="eyebrow">404</span>
        <h1>We couldn&apos;t find that page</h1>
        <p className="lead">It may have moved. Try one of these instead:</p>
        <div className="hero__actions" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn">
            Home
          </Link>
          <Link href="/services" className="btn btn--outline">
            Services
          </Link>
          <Link href="/contact" className="btn btn--outline">
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
