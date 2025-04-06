
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Header from "./Header";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  hideNavbar?: boolean;
}

const Layout = ({ 
  children, 
  hideFooter = false, 
  hideHeader = false,
  hideBottomNav = false,
  hideNavbar = false
}: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      {!hideHeader && <Header />}
      <main className={`flex-grow ${!hideHeader ? "pt-16" : ""} ${!hideBottomNav ? "pb-16" : ""}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
