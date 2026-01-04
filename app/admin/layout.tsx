import Sidebar from "@/components/admin/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Responsive admin layout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col p-4 lg:ml-0 mt-12 lg:mt-0">
        {children}
      </div>
    </main>
  );
}
