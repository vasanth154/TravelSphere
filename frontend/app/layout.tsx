import "./globals.css";
import { AppFrame } from "../components/AppFrame";

export const metadata = {
  title: "TravelSphere — Plan smarter trips across India",
  description:
    "AI-powered multi-modal travel planning. Compare buses, trains, flights and cabs, book stays, and build complete trips in one place.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
