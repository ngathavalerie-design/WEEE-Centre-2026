import Script from "next/script";

/**
 * Tawk.to live chat. Set NEXT_PUBLIC_TAWK_PROPERTY_ID (and optionally
 * NEXT_PUBLIC_TAWK_WIDGET_ID, default "default") to switch it on.
 * Renders nothing until configured.
 */
export default function LiveChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";
  if (!propertyId || !/^[a-zA-Z0-9]+$/.test(propertyId) || !/^[a-zA-Z0-9]+$/.test(widgetId)) return null;

  return (
    <Script id="tawk-to" strategy="lazyOnload">
      {`
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        (function () {
          var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = "https://embed.tawk.to/${propertyId}/${widgetId}";
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");
          s0.parentNode.insertBefore(s1, s0);
        })();
      `}
    </Script>
  );
}
