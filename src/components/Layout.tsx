import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import FloatingActions from "./FloatingActions";
export default function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <ScrollToTop /><TopBar /><Header />
      <main id="main"><div key={pathname} className="page-enter"><Outlet /></div></main>
      <Footer />
      <FloatingActions />
    </>
  );
}
