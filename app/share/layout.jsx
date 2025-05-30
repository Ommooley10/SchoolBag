import { Space_Grotesk } from "next/font/google";

const inter = Space_Grotesk({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={`h-screen  ${inter.className} overflow-hidden`}>
        <div className="min-h-screen lg:w-1/5 md:w-1/2 mx-auto text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
