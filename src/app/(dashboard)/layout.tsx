import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import ToolDetailPanel from "@/components/tools/ToolDetailPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 w-full relative min-h-screen transition-all duration-300 overflow-x-hidden">
          {children}
          <Footer />
          <ToolDetailPanel />
        </main>
      </div>
    </>
  );
}
