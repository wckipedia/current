import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/motion/motion-provider";

export const metadata: Metadata = {
  title: { default: "Current", template: "%s · Current" },
  description: "A calm daily briefing for software developers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <div className="shell"><main>{children}</main><footer>Current · Updated every morning in Singapore</footer></div>
        </MotionProvider>
      </body>
    </html>
  );
}
