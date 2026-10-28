import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flag-icons/css/flag-icons.min.css';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App.tsx';
import { CountryProvider } from './context/CountryContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AddressProvider } from './context/AddressContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { en, ta, hi, si, ms } from './i18n/translations';
import ErrorBoundary from './components/common/ErrorBoundary';

const translationsMap = { en, ta, hi, si, ms };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider translationsMap={translationsMap}>
          <CountryProvider>
            <AuthProvider>
              <CartProvider>
                <AuthModalProvider>
                  <AddressProvider>
                    <AdminAuthProvider>
                      <App />
                    </AdminAuthProvider>
                  </AddressProvider>
                </AuthModalProvider>
              </CartProvider>
            </AuthProvider>
          </CountryProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
