import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import MobileBottomNav from './MobileBottomNav';
import FloatingChat from './FloatingChat';
import AuthModal from './AuthModal';
import LocationNotification from './LocationNotification';
import styles from './css/Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();
  const isCart = pathname === '/cart' || pathname === '/checkout' || pathname === '/checkout-temp';
  const isAccount = pathname.startsWith('/account');
  const isShop = pathname === '/shop' || pathname.startsWith('/shop/');
  const isBoxBuilder = pathname === '/pricing/small-box' || pathname === '/pricing/big-box';
  const isB2B = pathname === '/pricing/b2b';
  const isLegalMobileHeader = pathname === '/privacy' || pathname === '/privacy-policy' || pathname === '/account-deletion' || pathname === '/delete-account';
  const hideBottomNav = isShop || isCart || isAccount || isBoxBuilder || isB2B;
  const isAboutFooter = pathname === '/about';

  return (
    <div className={`${styles.root} ${isCart ? styles.cartPage : ''} ${isAccount ? styles.accountPage : ''} ${isShop ? styles.shopPage : ''} ${isBoxBuilder ? styles.boxBuilderPage : ''} ${isB2B ? styles.b2bPage : ''} ${isLegalMobileHeader ? styles.legalMobileHeaderPage : ''}`}>
      <LocationNotification />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer isHome={pathname === '/'} isAbout={pathname === '/about'} />
      <ScrollToTop />
      {!hideBottomNav && <MobileBottomNav />}
      <FloatingChat raised={!hideBottomNav} hideOnMobile={isCart} />
      <AuthModal />
    </div>
  );
}
