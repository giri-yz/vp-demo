import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import RequireAuth from './components/common/RequireAuth';
import { AdminHomeRedirect, RequireSubAdminCountry, RequireSuperAdmin } from './components/common/RequireAdminAuth';
import { ToastProvider } from './components/admin/Toast';
import s from './components/common/css/RequireAuth.module.css';

/* Route-level code splitting: only the matched route's chunk (plus the shared
 * shell) is downloaded, so /account no longer waits for every other page and
 * its CSS to arrive. Route paths and guards below are unchanged. */
const Home = lazy(() => import('./pages/customer/Home'));
const ConceptHome = lazy(() => import('./pages/concept/ConceptHome'));
const Shop = lazy(() => import('./pages/customer/Shop'));
const ShopDetails = lazy(() => import('./pages/customer/ShopDetails'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const CheckoutTemp = lazy(() => import('./pages/customer/CheckoutTemp'));
const OrderSuccess = lazy(() => import('./pages/customer/OrderSuccess'));
const DeliveryComingSoon = lazy(() => import('./pages/customer/DeliveryComingSoon'));
const SmallBox = lazy(() => import('./pages/pricing/SmallBox'));
const BigBox = lazy(() => import('./pages/pricing/BigBox'));
const B2B = lazy(() => import('./pages/pricing/B2B'));
const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Account = lazy(() => import('./pages/account/Account'));
const PersonalInfo = lazy(() => import('./pages/account/PersonalInfo'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const OrderTracking = lazy(() => import('./pages/account/OrderTracking'));
const Terms = lazy(() => import('./pages/account/Terms'));
const HelpSupport = lazy(() => import('./pages/account/HelpSupport'));
const Notifications = lazy(() => import('./pages/account/Notifications'));
const PaymentHistory = lazy(() => import('./pages/account/PaymentHistory'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const SubAdminDashboard = lazy(() => import('./pages/admin/SubAdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const About = lazy(() => import('./pages/marketing/About'));
const Careers = lazy(() => import('./pages/marketing/Careers'));
const JobApply = lazy(() => import('./pages/marketing/JobApply'));
const Contact = lazy(() => import('./pages/marketing/Contact'));
const Gallery = lazy(() => import('./pages/marketing/Gallery'));
const History = lazy(() => import('./pages/marketing/History'));
const News = lazy(() => import('./pages/marketing/News'));
const BlogDetail = lazy(() => import('./pages/marketing/BlogDetail'));
const Project = lazy(() => import('./pages/marketing/Project'));
const Service = lazy(() => import('./pages/marketing/Service'));
const ServiceDetails = lazy(() => import('./pages/marketing/ServiceDetails'));
const Team = lazy(() => import('./pages/marketing/Team'));
const TeamDetails = lazy(() => import('./pages/marketing/TeamDetails'));
const Testimonial = lazy(() => import('./pages/marketing/Testimonial'));
const FAQ = lazy(() => import('./pages/marketing/FAQ'));
const PricingPlan = lazy(() => import('./pages/marketing/PricingPlan'));
const PrivacyPolicy = lazy(() => import('./pages/marketing/PrivacyPolicy'));
const AccountDeletion = lazy(() => import('./pages/marketing/AccountDeletion'));
const TermsConditions = lazy(() => import('./pages/marketing/TermsConditions'));
const NotFound = lazy(() => import('./pages/NotFound'));

/* Same spinner RequireAuth already shows while an /account route waits —
 * no new styles, and honest: the route chunk really is still downloading. */
function RouteFallback() {
  return (
    <div className={s.loadingWrap}>
      <div className={s.spinner} />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ConceptHome />} />
          <Route path="market" element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:slug" element={<ShopDetails />} />
          <Route path="pricing/small-box" element={<SmallBox />} />
          <Route path="pricing/big-box" element={<BigBox />} />
          <Route path="pricing/b2b" element={<B2B />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="checkout-temp"
            element={
              <RequireAuth>
                <CheckoutTemp />
              </RequireAuth>
            }
          />
          <Route
            path="orders/:id/success"
            element={
              <RequireAuth>
                <OrderSuccess />
              </RequireAuth>
            }
          />
          {/* Shown IN PLACE of OrderReceived for non-deliverable cities (no auth
              needed — it carries no order/customer data, only the optional city
              in router state). */}
          <Route path="delivery/coming-soon" element={<DeliveryComingSoon />} />
          <Route
            path="account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route
            path="account/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="account/orders/:id"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />
          <Route
            path="account/personal-info"
            element={
              <RequireAuth>
                <PersonalInfo />
              </RequireAuth>
            }
          />
          <Route
            path="account/addresses"
            element={
              <RequireAuth>
                <Addresses />
              </RequireAuth>
            }
          />
          <Route
            path="account/order-tracking"
            element={
              <RequireAuth>
                <OrderTracking />
              </RequireAuth>
            }
          />
          <Route path="about" element={<About />} />
          <Route path="careers" element={<Careers />} />
          <Route path="careers/apply" element={<JobApply />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="history" element={<History />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<BlogDetail />} />
          <Route path="project" element={<Project />} />
          <Route path="service" element={<Service />} />
          <Route path="service/:slug" element={<ServiceDetails />} />
          <Route path="team" element={<Team />} />
          <Route path="team/:slug" element={<TeamDetails />} />
          <Route path="testimonial" element={<Testimonial />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="pricing/plan" element={<PricingPlan />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="account-deletion" element={<AccountDeletion />} />
          <Route path="delete-account" element={<AccountDeletion />} />
          <Route path="help-support" element={<HelpSupport />} />
          <Route path="notifications" element={<Notifications />} />
          <Route
            path="account/payment-history"
            element={
              <RequireAuth>
                <PaymentHistory />
              </RequireAuth>
            }
          />
          <Route
            path="account/help-support"
            element={
              <RequireAuth>
                <HelpSupport />
              </RequireAuth>
            }
          />
          <Route
            path="account/notifications"
            element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            }
          />
          <Route
            path="account/terms"
            element={
              <RequireAuth>
                <Terms />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin/super-admin" element={<RequireSuperAdmin><ToastProvider><SuperAdminDashboard /></ToastProvider></RequireSuperAdmin>} />
        <Route path="admin/sub-admin/:country" element={<RequireSubAdminCountry><ToastProvider><SubAdminDashboard /></ToastProvider></RequireSubAdminCountry>} />
        {/* Role-aware: a Sub Admin must land on their own entrance, never the super-admin one. */}
        <Route path="admin" element={<AdminHomeRedirect />} />
        <Route path="admin/*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
