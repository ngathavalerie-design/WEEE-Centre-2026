import type { Metadata } from "next";
import TrackPickup from "./track-pickup";
import "./track.css";

export const metadata: Metadata = {
  title: "Track your pickup",
  description:
    "Check the status of your WEEE Centre e-waste pickup using your booking reference.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : "";

  return (
    <main className="track-page">
      <section className="track-hero">
        <p className="track-eyebrow">Pickup tracking</p>
        <h1>Where&apos;s my pickup?</h1>
        <p>
          Enter the reference from your booking confirmation (it starts with <strong>WC-</strong>) and the
          email or phone number you booked with.
        </p>
      </section>
      <TrackPickup initialReference={ref} />
    </main>
  );
}
