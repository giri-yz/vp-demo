import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { formatPrice } from '../../utils/currency';
import { listProducts } from '../../api/productsApi';
import { addCartItem } from '../../api/cartApi';
import { createAddress } from '../../api/addressesApi';
import { checkout } from '../../api/ordersApi';
import { SUGGESTION_ANSWERS } from './chatData';
import { CANCELLABLE_ORDER_STATUSES } from '../../utils/orderStatus';
import type { Product } from '../../types';
import s from './css/ChatPanel.module.css';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  orderContext?: { orderNumber: string; items: string[]; status: string; total: number; createdAt: string } | null;
}

type Msg = { id: number; html: string; from: 'bot' | 'user' };

/** Escapes plain text before it is rendered through dangerouslySetInnerHTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type CartItem = { name: string; price: number; qty: number; category: string; unit: string; productId: string };

type FlowMode = 'normal' | 'quantity' | 'address' | 'payment';

const CATEGORY_ICONS: Record<string, string> = {
  Vegetables: 'fas fa-carrot',
  Fruits: 'fas fa-apple-alt',
  Beverages: 'fas fa-wine-bottle',
  Groceries: 'fas fa-shopping-basket',
};

const CATEGORY_MAP: Record<string, string> = {
  Vegetables: 'vegetables',
  Fruits: 'fruits',
  Beverages: 'beverages',
  Groceries: 'groceries',
};

function getUnitLabel(unit: string): string {
  if (unit.includes('kg')) return 'kg';
  if (unit.includes('g')) return 'g';
  if (unit.includes('ml') || unit.includes('L')) return unit.replace('per ', '');
  if (unit.includes('pcs') || unit.includes('pc')) return 'pcs';
  if (unit.includes('bunch')) return 'bunch';
  if (unit.includes('pack')) return 'pack';
  if (unit.includes('cup')) return 'cup';
  return unit.replace('per ', '');
}

function asMap(v: unknown): Record<string, unknown> | null {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function escAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function fill(tpl: string, vars: Record<string, string>): string {
  let out = tpl;
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(v);
  return out;
}


const MAIN_OPTIONS = [
  { key: 'products', label: 'Products', num: '1.' },
  { key: 'pricing', label: 'Pricing Plans', num: '2.' },
  { key: 'delivery', label: 'Delivery Info', num: '3.' },
  { key: 'track', label: 'Track My Order', num: '4.' },
  { key: 'cancel', label: 'Cancel Order', num: '5.' },
  { key: 'payment', label: 'Payment Methods', num: '6.' },
  { key: 'return', label: 'Return Policy', num: '7.' },
  { key: 'b2b', label: 'B2B Orders', num: '8.' },
  { key: 'contact', label: 'Contact Info', num: '9.' },
  { key: 'agent', label: 'Talk to Agent', num: '10.' },
];




const TOPIC_CATEGORIES = [
  { title: 'About Us', icon: '\u{1F7E2}', items: [
    { q: 'What does VP NEXUES do?', label: 'What we do', icon: 'fas fa-building' },
    { q: 'about vpnexues', label: 'About VPNexues', icon: 'fas fa-info-circle' },
    { q: 'Why should I choose VPNexues?', label: 'Why choose us', icon: 'fas fa-check-circle' },
    { q: 'source from farmers', label: 'Our farmers', icon: 'fas fa-leaf' },
    { q: 'product quality', label: 'Quality assurance', icon: 'fas fa-shield-alt' },
  ]},
  { title: 'Products', icon: '\u{1F96C}', items: [
    { q: 'What products do you sell?', label: 'Our products', icon: 'fas fa-box-open' },
    { q: 'do you provide organic products', label: 'Organic products', icon: 'fas fa-seedling' },
    { q: 'freshness', label: 'Freshness', icon: 'fas fa-snowflake' },
    { q: 'shelf life', label: 'Shelf life', icon: 'fas fa-clock' },
    { q: 'product samples', label: 'Product samples', icon: 'fas fa-flask' },
  ]},
  { title: 'Pricing & Plans', icon: '\u{1F4B0}', items: [
    { q: 'pricing plans', label: 'Pricing plans', icon: 'fas fa-tags' },
    { q: 'small box', label: 'Small Box', icon: 'fas fa-box' },
    { q: 'big box', label: 'Big Box', icon: 'fas fa-boxes' },
    { q: 'minimum order', label: 'Minimum order', icon: 'fas fa-sort-amount-down' },
    { q: 'gift', label: 'Gift packs', icon: 'fas fa-gift' },
  ]},
  { title: 'Orders', icon: '\u{1F4E6}', items: [
    { q: 'how to place an order', label: 'How to order', icon: 'fas fa-shopping-cart' },
    { q: 'track my order', label: 'Track order', icon: 'fas fa-truck' },
    { q: 'cancel order', label: 'Cancel order', icon: 'fas fa-times-circle' },
    { q: 'modify order', label: 'Modify order', icon: 'fas fa-edit' },
    { q: 'promo code', label: 'Promo codes', icon: 'fas fa-ticket-alt' },
  ]},
  { title: 'Delivery', icon: '\u{1F69A}', items: [
    { q: 'delivery info', label: 'Delivery info', icon: 'fas fa-shipping-fast' },
    { q: 'shipping charges', label: 'Shipping charges', icon: 'fas fa-dollar-sign' },
    { q: 'where do you deliver', label: 'Countries', icon: 'fas fa-globe' },
    { q: 'delayed order', label: 'Delayed order', icon: 'fas fa-exclamation-triangle' },
    { q: 'no one home', label: 'Missed delivery', icon: 'fas fa-home' },
  ]},
  { title: 'Payment', icon: '\u{1F4B3}', items: [
    { q: 'payment methods', label: 'Payment methods', icon: 'fas fa-credit-card' },
    { q: 'cod', label: 'Cash on delivery', icon: 'fas fa-money-bill-wave' },
    { q: 'payment failed', label: 'Payment failed', icon: 'fas fa-exclamation-circle' },
    { q: 'gst invoice', label: 'GST invoice', icon: 'fas fa-file-invoice' },
  ]},
  { title: 'Returns & Refunds', icon: '\u21A9\uFE0F', items: [
    { q: 'return policy', label: 'Return policy', icon: 'fas fa-undo' },
    { q: 'refund', label: 'Refund options', icon: 'fas fa-sync' },
    { q: 'damaged product', label: 'Damaged product', icon: 'fas fa-box-open' },
    { q: 'wrong product', label: 'Wrong product', icon: 'fas fa-exchange-alt' },
  ]},
  { title: 'B2B & Wholesale', icon: '\u{1F7E2}', items: [
    { q: 'b2b orders', label: 'B2B orders', icon: 'fas fa-building' },
    { q: 'become a distributor', label: 'Become distributor', icon: 'fas fa-handshake' },
    { q: 'customized packaging', label: 'Custom packaging', icon: 'fas fa-box' },
    { q: 'request a quotation', label: 'Request quote', icon: 'fas fa-file-alt' },
    { q: 'do you export', label: 'Export services', icon: 'fas fa-shipping-fast' },
  ]},
  { title: 'Contact & Support', icon: '\u{1F4DE}', items: [
    { q: 'contact info', label: 'Contact info', icon: 'fas fa-phone' },
    { q: 'talk to agent', label: 'Talk to agent', icon: 'fas fa-headset' },
    { q: 'business hours', label: 'Business hours', icon: 'fas fa-clock' },
    { q: 'business enquiry', label: 'Business enquiry', icon: 'fas fa-envelope' },
    { q: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin' },
  ]},
];

export default function ChatPanel({ open, onClose, orderContext }: ChatPanelProps) {
  const { user } = useAuth();
  const { country } = useCountry();
  const { t, tRaw, lang } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;
  const tRawRef = useRef(tRaw);
  tRawRef.current = tRaw;
  const T = (key: string) => tRef.current(key);
  const TR = (key: string) => tRawRef.current(key);
  const fmtPrice = (n: number) => formatPrice(n, country);
  const statusLabel = (status: string) => {
    switch (status) {
      case 'PLACED': return T('account.statusPlaced');
      case 'CONFIRMED': return T('account.statusConfirmed');
      case 'PROCESSING': return T('account.statusProcessing');
      case 'SHIPPED': return T('account.statusShipped');
      case 'DELIVERED': return T('account.statusDelivered');
      case 'CANCELLED': return T('account.statusCancelled');
      case 'FAILED': return T('account.failed');
      default: return status;
    }
  };
  const monthNames = () => {
    const m = TR('chat.months');
    return Array.isArray(m) && m.length === 12 ? (m as string[]) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };
  const paymentLabel = (method: string) => {
    switch (method) {
      case 'UPI': return T('account.tabUPI');
      case 'Credit/Debit Card': return T('chat.pay.card');
      case 'Net Banking': return T('account.tabNetBanking');
      case 'Cash on Delivery': return T('checkout.cashOnDelivery');
      default: return method;
    }
  };
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [optionsHtml, setOptionsHtml] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [flowMode, setFlowMode] = useState<FlowMode>('normal');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPayment, setOrderPayment] = useState('');
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const bodyLockRef = useRef(false);
  const selectedProductRef = useRef<Product | null>(null);

  const nextId = () => ++idRef.current;

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
  }, []);

  const addBotMsg = useCallback((html: string) => {
    setMsgs(prev => [...prev, { id: nextId(), html, from: 'bot' }]);
    scrollBottom();
  }, [scrollBottom]);

  const addUserMsg = useCallback((html: string) => {
    setMsgs(prev => [...prev, { id: nextId(), html: escapeHtml(html), from: 'user' }]);
    scrollBottom();
  }, [scrollBottom]);

  const showOptions = useCallback((html: string) => {
    setOptionsHtml(html);
    scrollBottom();
  }, [scrollBottom]);

  const removeOptions = useCallback(() => {
    setOptionsHtml(null);
  }, []);

  const askAnotherRef = useRef<() => void>(() => {});

  const askAnother = useCallback(() => {
    removeOptions();
    setFlowMode('normal');
    setSelectedProduct(null);
    addUserMsg(T('chat.msg.anotherQuestion'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.sureWhatLike'));
      setTimeout(() => askAnotherRef.current(), 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg]);

  const talkToAgent = useCallback(() => {
    removeOptions();
    addUserMsg(T('chat.msg.wantAgent'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.connectingAgent'));
      setTimeout(() => {
        addBotMsg(T('chat.msg.priyaHello'));
        setTimeout(() => {
          showOptions(`<div class="${s.suggestions}">
            <button type="button" class="${s.suggestion}" data-action="track"><i class="fas fa-shopping-bag"></i><span>${T('chat.btn.orderAssistance')}</span></button>
            <button type="button" class="${s.suggestion}" data-action="track"><i class="fas fa-truck"></i><span>${T('chat.btn.deliveryTracking')}</span></button>
            <button type="button" class="${s.suggestion}" data-action="return"><i class="fas fa-undo"></i><span>${T('chat.btn.returnsRefunds')}</span></button>
            <button type="button" class="${s.suggestion}" data-action="b2b"><i class="fas fa-handshake"></i><span>${T('chat.btn.b2bPartnership')}</span></button>
          </div>
          <div class="${s.followup}"><button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToProducts')}</button></div>`);
        }, 300);
      }, 800);
    }, 500);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions]);

  const showMainOptions = useCallback(() => {
    const html = MAIN_OPTIONS.map(o =>
      `<button class="${s.numberedOption}" data-action="${o.key}"><span class="${s.num}">${o.num}</span><span>${T(`chat.main.${o.key}`)}</span><i class="fas fa-chevron-right ${s.optArrow}"></i></button>`
    ).join('');
    const browseAll = `<button class="${s.browseAll}" data-action="browse"><span>${T('chat.browseAll')}</span><i class="fas fa-arrow-right"></i></button>`;
    showOptions(html + browseAll);
  }, [showOptions]);

  useEffect(() => { askAnotherRef.current = showMainOptions; }, [showMainOptions]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const restartChat = useCallback(() => {
    setMenuOpen(false);
    setMsgs([]);
    setOptionsHtml(null);
    setInput('');
    setCart([]);
    setFlowMode('normal');
    setSelectedProduct(null);
    selectedProductRef.current = null;
    setOrderAddress('');
    setOrderPayment('');
    bodyLockRef.current = false;
    idRef.current = 0;
  }, []);

  const showFollowup = useCallback(() => {
    showOptions(`<div class="${s.followup}">
      <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
      <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
    </div>`);
  }, [showOptions]);

  const renderCartSummary = useCallback(() => {
    if (cart.length === 0) return '';
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const items = cart.map(item =>
      `<div class="${s.cartItem}">
        <span class="${s.cartItemName}">${getProductName(item.name, lang)} × ${item.qty} ${item.unit}</span>
        <span class="${s.cartItemPrice}">${fmtPrice(item.price * item.qty)}</span>
      </div>`
    ).join('');
    return `<div class="${s.cartSummary}">
      <div class="${s.cartTitle}"><i class="fas fa-shopping-cart"></i> ${T('chat.msg.yourCart')}</div>
      ${items}
      <div class="${s.cartTotal}"><span>${T('cart.total')}</span><span>${fmtPrice(total)}</span></div>
    </div>`;
  }, [cart]);

  const showProducts = useCallback(() => {
    addUserMsg(T('chat.msg.products'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.ourProducts'));
      setTimeout(() => {
        const cats = Object.keys(products);
        if (cats.length === 0) {
          showOptions(`<div class="${s.botNote}">${T('chat.msg.loadingProducts')}</div>`);
          return;
        }
        const catHtml = cats.map(cat => {
          const icon = CATEGORY_ICONS[cat] || 'fas fa-box';
          const items = (products[cat] || []).slice(0, 5);
          const preview = items.map(p => getProductName(p.name, lang)).join(', ');
          const more = (products[cat] || []).length > 5 ? ` ${T('chat.moreCount').replace('{n}', String((products[cat] || []).length - 5))}` : '';
          const catKey = CATEGORY_MAP[cat] || cat.toLowerCase();
          return `<div class="${s.pcat}" data-action="productCategory" data-category="${catKey}"><div class="${s.pcatHead}"><i class="${icon}"></i><strong>${T(`shop.${catKey}`)}</strong></div><div class="${s.pcatItems}">${preview}${more}</div></div>`;
        }).join('');
        const cartSummary = cart.length > 0 ? renderCartSummary() : '';
        showOptions(cartSummary + `<div class="${s.productCats}">${catHtml}</div>
        <div class="${s.botNote}">${T('chat.msg.chemicalFree')}</div>
        <div class="${s.followup}">
          ${cart.length > 0 ? `<button class="${s.followupBtn} ${s.checkoutBtn}" data-action="checkout"><i class="fas fa-shopping-cart"></i> ${T('chat.btn.checkoutCount').replace('{n}', String(cart.length))}</button>` : ''}
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions, products, cart, renderCartSummary]);

  const showProductCategoryDetail = useCallback((category: string) => {
    removeOptions();
    const catKey = Object.keys(products).find(k => CATEGORY_MAP[k] === category) || category;
    const items = products[catKey] || [];
    addUserMsg(T(`shop.${category}`));
    setTimeout(() => {
      addBotMsg(T('chat.msg.selectProduct'));
      setTimeout(() => {
        const cartSummary = cart.length > 0 ? renderCartSummary() : '';
        const productBtns = items.map(p => {
          const icon = CATEGORY_ICONS[p.category] || 'fas fa-box';
          return `<button class="${s.productItem}" data-action="selectProduct" data-id="${p.id}">
            <div class="${s.productItemLeft}"><i class="${icon}"></i><div><span class="${s.productItemName}">${getProductName(p.name, lang)}</span><span class="${s.productItemUnit}">${p.unit}</span></div></div>
            <span class="${s.productItemPrice}">${fmtPrice(p.price)}</span>
          </button>`;
        }).join('');
        const backBtn = `<div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="products"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToCategories')}</button>
          ${cart.length > 0 ? `<button class="${s.followupBtn} ${s.checkoutBtn}" data-action="checkout"><i class="fas fa-shopping-cart"></i> ${T('chat.btn.checkoutCount').replace('{n}', String(cart.length))}</button>` : ''}
        </div>`;
        showOptions(cartSummary + productBtns + backBtn);
      }, 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions, products, cart, renderCartSummary]);

  const selectProduct = useCallback((productId: string) => {
    removeOptions();
    let product: Product | undefined;
    for (const cat of Object.values(products)) {
      product = cat.find(p => p.id === productId);
      if (product) break;
    }
    if (!product) return;
    setSelectedProduct(product);
    selectedProductRef.current = product;
    setFlowMode('quantity');
    const unitLabel = getUnitLabel(product.unit);
    addUserMsg(getProductName(product.name, lang));
    setTimeout(() => {
      addBotMsg(fill(T('chat.msg.howMany'), { unit: unitLabel, name: getProductName(product.name, lang), unitFull: product.unit, price: fmtPrice(product.price) }));
      setTimeout(() => {
        showOptions(`<div class="${s.qtyPicker}">
          <div class="${s.qtyRow}">
            <button class="${s.qtyBtn}" data-action="qtyMinus"><i class="fas fa-minus"></i></button>
            <span class="${s.qtyValue}" id="qtyValue">1</span>
            <button class="${s.qtyBtn}" data-action="qtyPlus"><i class="fas fa-plus"></i></button>
          </div>
          <div class="${s.qtyUnit}">${unitLabel}</div>
          <div class="${s.qtyPrice}">${T('chat.msg.totalLabel')} <span id="qtyTotal">${fmtPrice(product.price)}</span></div>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn} ${s.qtyConfirmBtn}" data-action="confirmQty"><i class="fas fa-check"></i> ${T('shop.addToCart')}</button>
          <button class="${s.followupBtn}" data-action="cancelQty"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions, products]);

  const addToCart = useCallback((product: Product, qty: number) => {
    const unitLabel = getUnitLabel(product.unit);
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, qty } : item);
      }
      return [...prev, { name: product.name, price: product.price, qty, category: product.category, unit: unitLabel, productId: product.id }];
    });
  }, []);

  const showCartAfterAdd = useCallback((product: Product, qty: number) => {
    setFlowMode('normal');
    setSelectedProduct(null);
    selectedProductRef.current = null;
    removeOptions();
    const unitLabel = getUnitLabel(product.unit);
    addUserMsg(`${qty} ${unitLabel} × ${getProductName(product.name, lang)}`);
    setTimeout(() => {
      addBotMsg(fill(T('chat.msg.addedToCart'), { name: getProductName(product.name, lang), qty: String(qty), unit: unitLabel }));
      setTimeout(() => {
        const cartSummary = renderCartSummary();
        showOptions(`${cartSummary}
          <div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="products"><i class="fas fa-plus"></i> ${T('chat.btn.addMoreProducts')}</button>
            <button class="${s.followupBtn} ${s.checkoutBtn}" data-action="checkout"><i class="fas fa-arrow-right"></i> ${T('cart.checkout')}</button>
          </div>`);
      }, 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions, renderCartSummary]);

  const showCheckout = useCallback(() => {
    removeOptions();
    if (cart.length === 0) {
      addBotMsg(T('chat.msg.cartEmpty'));
      setTimeout(() => showProducts(), 400);
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    addUserMsg(T('cart.checkout'));
    setTimeout(() => {
      addBotMsg(`<strong>${T('chat.msg.orderSummaryTitle')}</strong><br><br>${cart.map(item => `${getProductName(item.name, lang)} × ${item.qty} ${item.unit} = ${fmtPrice(item.price * item.qty)}`).join('<br>')}<br><br><strong>${T('chat.msg.totalLabel')} ${fmtPrice(total)}</strong>`);
      setTimeout(() => {
        setFlowMode('address');
        addBotMsg(T('chat.msg.shareLocation'));
        setTimeout(() => {
          showOptions(`<div class="${s.locationSection}">
            <button class="${s.locationBtn}" data-action="getLocation">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <span class="${s.locationBtnTitle}">${T('chat.btn.useLocation')}</span>
                <span class="${s.locationBtnSub}">${T('chat.btn.useLocationSub')}</span>
              </div>
            </button>
            <div class="${s.locationOr}">${T('chat.msg.orManual')}</div>
            <input class="${s.addressField}" id="addressInput" type="text" placeholder="${escAttr(T('chat.addressPlaceholder'))}" />
          </div>
          <div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="confirmAddress"><i class="fas fa-check"></i> ${T('chat.btn.confirmAddress')}</button>
            <button class="${s.followupBtn}" data-action="cancelCheckout"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
          </div>`);
          setTimeout(() => {
            const addrInput = document.getElementById('addressInput') as HTMLInputElement;
            if (addrInput) {
              addrInput.addEventListener('input', (e) => {
                setOrderAddress((e.target as HTMLInputElement).value);
              });
            }
          }, 100);
        }, 300);
      }, 400);
    }, 400);
  }, [cart, removeOptions, addUserMsg, addBotMsg, showOptions, showProducts]);

  const paymentOptionsHtml = () => `<div class="${s.paymentOptions}">
          <button class="${s.paymentOption}" data-action="selectPayment" data-method="UPI">
            <i class="fas fa-mobile-alt"></i><span>${T('account.tabUPI')}</span><small>${T('chat.pay.upiSub')}</small>
          </button>
          <button class="${s.paymentOption}" data-action="selectPayment" data-method="Credit/Debit Card">
            <i class="fas fa-credit-card"></i><span>${T('chat.pay.card')}</span><small>${T('chat.pay.cardSub')}</small>
          </button>
          <button class="${s.paymentOption}" data-action="selectPayment" data-method="Net Banking">
            <i class="fas fa-university"></i><span>${T('account.tabNetBanking')}</span><small>${T('chat.pay.allBanks')}</small>
          </button>
          <button class="${s.paymentOption}" data-action="selectPayment" data-method="Cash on Delivery">
            <i class="fas fa-money-bill-wave"></i><span>${T('checkout.cashOnDelivery')}</span><small>${T('chat.pay.codSub')}</small>
          </button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="cancelCheckout"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
        </div>`;

  const confirmAddress = useCallback(() => {
    if (!orderAddress.trim()) return;
    removeOptions();
    setFlowMode('payment');
    addUserMsg(orderAddress);
    setTimeout(() => {
      addBotMsg(T('chat.msg.addressConfirmed'));
      setTimeout(() => {
        showOptions(paymentOptionsHtml());
      }, 300);
    }, 400);
  }, [orderAddress, removeOptions, addUserMsg, addBotMsg, showOptions]);

  const placeOrder = useCallback(async (paymentMethod: string) => {
    removeOptions();
    setOrderPayment(paymentMethod);
    setFlowMode('normal');
    addUserMsg(paymentLabel(paymentMethod));

    if (!user) {
      addBotMsg(T('chat.msg.loginToOrder'));
      setTimeout(() => showMainOptions(), 300);
      return;
    }

    addBotMsg(T('chat.msg.placingOrder'));

    try {
      for (const item of cart) {
        if (item.productId) {
          await addCartItem(item.productId, item.qty, country);
        }
      }

      const addr = await createAddress({
        label: 'Home',
        name: user.name || user.phone,
        phone: user.phone,
        addressLine: orderAddress,
        flat: null,
        landmark: null,
        city: '',
        pincode: '',
        state: '',
        country: null,
        isDefault: true,
        lat: null,
        lng: null,
      });

      const order = await checkout({
        addressId: addr.id,
        paymentMethod,
      }, country);

      removeOptions();
      setTimeout(() => {
        addBotMsg('<div class="' + s.orderSuccess + '"><div class="' + s.orderSuccessIcon + '"><i class="fas fa-check-circle"></i></div><strong>' + T('orderSuccess.title') + '</strong></div>');
        setTimeout(() => {
          addBotMsg(`<strong>${T('orderSuccess.orderId')}:</strong> ${order.orderNumber}<br><strong>${T('chat.msg.itemsLabel')}</strong> ${cart.map(i => `${getProductName(i.name, lang)} × ${i.qty} ${i.unit}`).join(', ')}<br><strong>${T('chat.msg.totalLabel')}</strong> ${order.grandTotal}<br><strong>${T('chat.msg.paymentLabel')}</strong> ${paymentLabel(paymentMethod)}<br><br>${T('chat.msg.confirmWhatsApp')}`);
          setTimeout(() => {
            setCart([]);
            setOrderAddress('');
            setOrderPayment('');
            showOptions(`<div class="${s.followup}">
              <button class="${s.followupBtn}" data-action="products"><i class="fas fa-shopping-bag"></i> ${T('chat.btn.shopAgain')}</button>
              <button class="${s.followupBtn}" data-action="track"><i class="fas fa-truck"></i> ${T('chat.btn.trackOrder')}</button>
              <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToSupport')}</button>
            </div>`);
          }, 300);
        }, 500);
      }, 400);
    } catch {
      removeOptions();
      setTimeout(() => {
        addBotMsg(T('chat.msg.orderError'));
        setTimeout(() => {
          const cartSummary = renderCartSummary();
          showOptions(`${cartSummary}
            <div class="${s.followup}">
              <button class="${s.followupBtn} ${s.checkoutBtn}" data-action="placeOrderRetry"><i class="fas fa-redo"></i> ${T('chat.btn.retryCheckout')}</button>
              <button class="${s.followupBtn}" data-action="cancelCheckout"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
            </div>`);
        }, 300);
      }, 400);
    }
  }, [cart, orderAddress, user, country, removeOptions, addUserMsg, addBotMsg, showOptions, showMainOptions, renderCartSummary]);

  const cancelCheckout = useCallback(() => {
    setFlowMode('normal');
    removeOptions();
    addUserMsg(T('chat.msg.cancelCheckout'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.checkoutCancelled'));
      setTimeout(() => {
        const cartSummary = renderCartSummary();
        showOptions(`${cartSummary}
          <div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="products"><i class="fas fa-plus"></i> ${T('chat.btn.addMoreProducts')}</button>
            <button class="${s.followupBtn} ${s.checkoutBtn}" data-action="checkout"><i class="fas fa-arrow-right"></i> ${T('chat.btn.checkout')}</button>
            <button class="${s.followupBtn}" data-action="clearCart"><i class="fas fa-trash"></i> ${T('chat.btn.clearCart')}</button>
          </div>`);
      }, 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions, renderCartSummary]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      addBotMsg(T('chat.msg.geoUnsupported'));
      return;
    }
    setGeoLoading(true);
    addBotMsg(T('chat.msg.detectingLocation'));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setOrderAddress(addr);
          setGeoLoading(false);
          removeOptions();
          addUserMsg(T('chat.msg.locationDetected'));
          setTimeout(() => {
            addBotMsg(fill(T('chat.msg.locationFound'), { addr }));
            setTimeout(() => {
              showOptions(`<div class="${s.followup}">
                <button class="${s.followupBtn} ${s.checkoutBtn}" data-action="confirmAddress"><i class="fas fa-check"></i> ${T('chat.btn.confirmContinue')}</button>
                <button class="${s.followupBtn}" data-action="retryLocation"><i class="fas fa-redo"></i> ${T('chat.btn.useDifferentLocation')}</button>
              </div>`);
            }, 300);
          }, 400);
        } catch {
          setGeoLoading(false);
          setOrderAddress(`${latitude}, ${longitude}`);
          removeOptions();
          addUserMsg(T('chat.msg.locationDetected'));
          setTimeout(() => {
            addBotMsg(fill(T('chat.msg.coordsDetected'), { coords: latitude.toFixed(4) + ', ' + longitude.toFixed(4) }));
            setTimeout(() => {
              showOptions(`<div class="${s.followup}">
                <button class="${s.followupBtn} ${s.checkoutBtn}" data-action="confirmAddress"><i class="fas fa-check"></i> ${T('chat.btn.confirmContinue')}</button>
                <button class="${s.followupBtn}" data-action="retryLocation"><i class="fas fa-redo"></i> ${T('chat.btn.useDifferentLocation')}</button>
              </div>`);
            }, 300);
          }, 400);
        }
      },
      () => {
        setGeoLoading(false);
        removeOptions();
        addBotMsg(T('chat.msg.geoFailed'));
        setTimeout(() => {
          showOptions(`<div class="${s.locationSection}">
            <input class="${s.addressField}" id="addressInput" type="text" placeholder="Enter your full delivery address..." />
          </div>
          <div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="confirmAddress"><i class="fas fa-check"></i> ${T('chat.btn.confirmAddress')}</button>
            <button class="${s.followupBtn}" data-action="retryLocation"><i class="fas fa-redo"></i> ${T('chat.btn.tryLocationAgain')}</button>
            <button class="${s.followupBtn}" data-action="cancelCheckout"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
          </div>`);
          setTimeout(() => {
            const addrInput = document.getElementById('addressInput') as HTMLInputElement;
            if (addrInput) {
              addrInput.addEventListener('input', (e) => {
                setOrderAddress((e.target as HTMLInputElement).value);
              });
            }
          }, 100);
        }, 300);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [removeOptions, addUserMsg, addBotMsg, showOptions]);

  const showPricing = useCallback(() => {
    addUserMsg(T('chat.msg.pricingPlans'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.pricingIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/small-box"><i class="fas fa-box-open"></i><span>${T('chat.price.smallBox')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/big-box"><i class="fas fa-box"></i><span>${T('chat.price.bigBox')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/b2b"><i class="fas fa-warehouse"></i><span>${T('chat.price.b2bBulk')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-carrot"></i><span>${T('chat.price.organicVeg')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-apple-alt"></i><span>${T('chat.price.tropicalFruits')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-pepper-hot"></i><span>${T('chat.price.premiumSpices')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showDelivery = useCallback(() => {
    addUserMsg(T('chat.msg.deliveryInfo'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.deliveryIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="freeDeliverySubs"><i class="fas fa-truck"></i><span>${T('chat.btn.freeDeliverySubs')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="sameDayDelivery"><i class="fas fa-bolt"></i><span>${T('chat.btn.sameDayDelivery')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="trackDeliveryLive"><i class="fas fa-map-pin"></i><span>${T('chat.btn.trackDeliveryLive')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="flexibleScheduling"><i class="fas fa-calendar-check"></i><span>${T('chat.btn.flexibleScheduling')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="ecoPackaging"><i class="fas fa-recycle"></i><span>${T('chat.btn.ecoPackaging')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showTrackOrder = useCallback(() => {
    addUserMsg(T('chat.msg.trackMyOrder'));
    const isLoggedIn = !!user;
    if (!isLoggedIn) {
      setTimeout(() => {
        addBotMsg(T('chat.msg.loginToTrack'));
        setTimeout(() => {
          showOptions(`<div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="login"><i class="fas fa-sign-in-alt"></i> ${T('chat.btn.loginTrack')}</button>
            <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToSupport')}</button>
          </div>`);
        }, 300);
      }, 400);
      return;
    }
    addBotMsg(T('chat.msg.fetchingOrders'));
    import('../../api/ordersApi').then(({ listOrders }) => {
      listOrders().then(orders => {
        removeOptions();
        if (!orders.length) {
          addBotMsg(T('chat.msg.noOrdersYet'));
          setTimeout(() => {
            showOptions(`<div class="${s.followup}">
              <button class="${s.followupBtn}" data-action="shop"><i class="fas fa-shopping-bag"></i> ${T('chat.btn.shopAgain')}</button>
              <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToSupport')}</button>
            </div>`);
          }, 300);
          return;
        }
        addBotMsg(T('chat.msg.recentOrders'));
        setTimeout(() => {
          const recent = orders.slice(0, 5);
          const html = '<div class="' + s.orderList + '">' + recent.map(order => {
            const status = order.status || 'PLACED';
            const statusClass = status === 'DELIVERED' ? s.ordStatusDelivered : status === 'SHIPPED' ? s.ordStatusShipped : status === 'FAILED' ? s.ordStatusFailed : status === 'CANCELLED' ? s.ordStatusCancelled : s.ordStatusProcessing;
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            const d = new Date(order.createdAt);
            const months = monthNames();
            const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
            const itemNames = order.items.map(i => getProductName(i.name, lang));
            const itemsText = itemNames.length > 2 ? itemNames.slice(0,2).join(', ') + ' & ' + (itemNames.length - 2) + ' more' : itemNames.join(', ');
            return `<div class="${s.orderCard}" data-action="orderDetail" data-order-id="${order.id}">
              <div class="${s.orderCardTop}">
                <span class="${s.orderId}">${order.orderNumber}</span>
                <span class="${s.ordStatus} ${statusClass}">${statusLabel}</span>
              </div>
              <div class="${s.orderCardBody}">
                ${itemsText ? `<div class="${s.orderItems}">${itemsText}</div>` : ''}
                <div class="${s.orderMeta}"><span>${T('chat.msg.placedLabel')}: ${dateStr}</span><span>${fmtPrice(order.grandTotal)}</span></div>
              </div>
              <div class="${s.orderCardAction}"><button class="${s.orderDetailBtn}" data-action="orderDetail" data-order-id="${order.id}"><i class="fas fa-eye"></i> ${T('chat.msg.viewOrder')}</button></div>
            </div>`;
          }).join('') + '</div>';
          showOptions(html + `<div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="track"><i class="fas fa-sync-alt"></i> ${T('chat.btn.refreshStatus')}</button>
            <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.back')}</button>
          </div>`);
        }, 400);
      }).catch(() => {
        removeOptions();
        addBotMsg(T('chat.msg.ordersLoadError'));
        setTimeout(() => showMainOptions(), 300);
      });
    });
  }, [user, removeOptions, addUserMsg, addBotMsg, showOptions, showMainOptions]);

  const cancellableOrdersRef = useRef<{ id: string; orderNumber: string; status: string }[]>([]);

  const renderCancelList = useCallback(() => {
    const list = cancellableOrdersRef.current;
    if (!list.length) {
      showMainOptions();
      return;
    }
    const html = '<div class="' + s.orderList + '">' + list.map(order => {
      const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();
      return `<div class="${s.orderCard}">
        <div class="${s.orderCardTop}">
          <span class="${s.orderId}">${order.orderNumber}</span>
          <span class="${s.ordStatus} ${s.ordStatusProcessing}">${statusLabel}</span>
        </div>
        <div class="${s.orderCardAction}"><button class="${s.orderDetailBtn}" data-action="confirmCancel" data-order-id="${order.id}" data-order-number="${order.orderNumber}"><i class="fas fa-ban"></i> ${T('chat.msg.cancelThisOrder')}</button></div>
      </div>`;
    }).join('') + '</div>';
    showOptions(html + `<div class="${s.followup}">
      <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToSupport')}</button>
    </div>`);
  }, [showMainOptions, showOptions]);

  const showCancelOrder = useCallback(() => {
    addUserMsg(T('chat.main.cancel'));
    if (!user) {
      setTimeout(() => {
        addBotMsg(T('chat.msg.loginToCancel'));
        setTimeout(() => {
          showOptions(`<div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="login"><i class="fas fa-sign-in-alt"></i> ${T('chat.btn.loginCancel')}</button>
            <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToSupport')}</button>
          </div>`);
        }, 300);
      }, 400);
      return;
    }
    addBotMsg(T('chat.msg.fetchingOrders'));
    import('../../api/ordersApi').then(({ listOrders }) => {
      listOrders().then(orders => {
        removeOptions();
        cancellableOrdersRef.current = orders
          .filter(o => CANCELLABLE_ORDER_STATUSES.has(o.status || 'PLACED'))
          .slice(0, 5)
          .map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status || 'PLACED' }));
        if (!cancellableOrdersRef.current.length) {
          addBotMsg(T('chat.msg.noCancellable'));
          setTimeout(() => showFollowup(), 400);
          return;
        }
        addBotMsg(T('chat.msg.whichCancel'));
        setTimeout(() => renderCancelList(), 400);
      }).catch(() => {
        removeOptions();
        addBotMsg(T('chat.msg.ordersLoadError'));
        setTimeout(() => showMainOptions(), 300);
      });
    });
  }, [user, removeOptions, addUserMsg, addBotMsg, showOptions, showMainOptions, showFollowup, renderCancelList]);

  const confirmCancelOrder = useCallback((orderId: string, orderNumber: string) => {
    removeOptions();
    addUserMsg(T('chat.msg.cancelThisOrder') + ' ' + orderNumber);
    setTimeout(() => {
      addBotMsg(fill(T('chat.msg.confirmCancelWarn'), { number: orderNumber }));
      showOptions(`<div class="${s.followup}">
        <button class="${s.followupBtn}" data-action="doCancel" data-order-id="${orderId}" data-order-number="${orderNumber}"><i class="fas fa-ban"></i> ${fill(T('chat.btn.confirmCancelYes'), { number: orderNumber })}</button>
        <button class="${s.followupBtn}" data-action="keepOrder"><i class="fas fa-check"></i> ${T('chat.btn.keepOrderNo')}</button>
      </div>`);
    }, 300);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions]);

  const doCancelOrder = useCallback((orderId: string, orderNumber: string) => {
    removeOptions();
    addUserMsg(fill(T('chat.btn.confirmCancelYes'), { number: orderNumber }));
    addBotMsg(fill(T('chat.msg.cancellingOrder'), { number: orderNumber }));
    import('../../api/ordersApi')
      .then(({ cancelOrder }) => cancelOrder(orderId))
      .then(() => {
        cancellableOrdersRef.current = cancellableOrdersRef.current.filter(o => o.id !== orderId);
        addBotMsg(fill(T('chat.msg.cancelDone'), { number: orderNumber }));
        setTimeout(() => showFollowup(), 400);
      })
      .catch(() => {
        addBotMsg(fill(T('chat.msg.cancelFailed'), { number: orderNumber }));
        setTimeout(() => showFollowup(), 400);
      });
  }, [removeOptions, addUserMsg, addBotMsg, showFollowup]);

  const showOrderDetail = useCallback((orderId: string) => {
    removeOptions();
    addUserMsg(T('chat.msg.viewOrder') + ' ' + orderId);
    setTimeout(() => {
      import('../../api/ordersApi')
        .then(({ getOrder }) => getOrder(orderId))
        .then(order => {
          const status = order.status || 'PROCESSING';
          const statusClass = status === 'DELIVERED' ? s.ordStatusDelivered : status === 'SHIPPED' ? s.ordStatusShipped : status === 'FAILED' ? s.ordStatusFailed : status === 'CANCELLED' ? s.ordStatusCancelled : s.ordStatusProcessing;
          const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          const d = new Date(order.createdAt);
          const months = monthNames();
          const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear() + ' \u2022 ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
          const items = order.items || [];
          const STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
          const si = STEPS.indexOf(status);
          const progressHtml =
            status === 'CANCELLED' || si < 0
              ? ''
              : `<div class="${s.ordProgress}">${STEPS.map((stp, i) => {
                  const cls = i < si ? s.ordStepDone : i === si ? s.ordStepActive : '';
                  return `<div class="${s.ordStep} ${cls}"><div class="${s.ordStepDot}">${i + 1}</div><div class="${s.ordStepLabel}">${stp}</div>${i < STEPS.length - 1 ? `<div class="${s.ordStepLine}"></div>` : ''}</div>`;
                }).join('')}</div>`;
          const detailHtml = `<div class="${s.ordDetail}">
            <div class="${s.ordDetailHeader}"><div class="${s.ordDetailId}">${order.orderNumber || order.id}</div><span class="${s.ordStatus} ${statusClass}">${statusLabel}</span></div>
            ${progressHtml}
            <div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">${T('chat.msg.placedLabel')}</span><span>${dateStr}</span></div>
            <div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">${T('chat.msg.totalLabel')}</span><span>${fmtPrice(Number(order.grandTotal))}</span></div>
            ${order.paymentMethod ? `<div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">${T('chat.msg.paymentWord')}</span><span>${order.paymentMethod}</span></div>` : ''}
            ${items.length ? `<div class="${s.ordDetailItemsLabel}">${fill(T('chat.msg.itemsCountLabel'), { n: String(items.length) })}</div>${items.map(item => {
              return `<div class="${s.ordDetailItem}"><div><div class="${s.ordDetailItemName}">${getProductName(item.name || 'Item', lang)}</div><div class="${s.ordDetailItemQty}">Qty: ${item.qty} \u00D7 ${fmtPrice(Number(item.unitPrice))}</div></div><div class="${s.ordDetailItemTotal}">${fmtPrice(Number(item.lineTotal))}</div></div>`;
            }).join('')}` : ''}
            <div class="${s.ordDetailNote}">${fill(T('chat.msg.estimatedDelivery'), { range: '30 mins' })}</div>
          </div>`;
          addBotMsg(detailHtml);
          setTimeout(() => {
            showOptions(`<div class="${s.followup}">
              <button class="${s.followupBtn}" data-action="track"><i class="fas fa-sync-alt"></i> ${T('chat.btn.refreshStatus')}</button>
              <button class="${s.followupBtn}" data-action="navigate" data-to="/account/orders/${order.id}"><i class="fas fa-clipboard-list"></i> ${T('chat.btn.viewFullDetails')}</button>
              <button class="${s.followupBtn}" data-action="orderTracking"><i class="fas fa-map-marker-alt"></i> ${T('chat.btn.fullTracking')}</button>
              <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.back')}</button>
            </div>`);
          }, 300);
        })
        .catch(() => {
          addBotMsg(T('chat.msg.orderNotFound'));
          setTimeout(() => showMainOptions(), 300);
        });
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showOptions, showMainOptions, lang]);

  const showPaymentMethods = useCallback(() => {
    addUserMsg(T('chat.msg.paymentMethods'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.paymentsIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="cardsAccepted"><i class="fas fa-credit-card"></i><span>${T('chat.btn.cardsAccepted')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="upiApps"><i class="fas fa-mobile-alt"></i><span>${T('chat.btn.upiApps')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="netBankingSugg"><i class="fas fa-university"></i><span>${T('chat.btn.netBankingSugg')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="digitalWallets"><i class="fas fa-wallet"></i><span>${T('chat.btn.digitalWallets')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="secureEncrypted"><i class="fas fa-shield-alt"></i><span>${T('chat.btn.secureEncrypted')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showReturnPolicy = useCallback(() => {
    addUserMsg(T('chat.msg.returnPolicy'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.returnIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="freshReturns24h"><i class="fas fa-clock"></i><span>${T('chat.btn.freshReturns24h')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="refund3to5"><i class="fas fa-money-bill-wave"></i><span>${T('chat.btn.refund3to5')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="damagedPhotoSupport"><i class="fas fa-camera"></i><span>${T('chat.btn.damagedPhotoSupport')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="subPauseCancel"><i class="fas fa-calendar-times"></i><span>${T('chat.btn.subPauseCancel')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showB2B = useCallback(() => {
    addUserMsg(T('chat.msg.b2bOrders'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.b2bIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="b2bBulkOrders"><i class="fas fa-store"></i><span>${T('chat.btn.b2bBulkOrders')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="b2bMin50kg"><i class="fas fa-weight-hanging"></i><span>${T('chat.btn.b2bMin50kg')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="b2bCustomPack"><i class="fas fa-tags"></i><span>${T('chat.btn.b2bCustomPack')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="b2bAccountManager"><i class="fas fa-user-tie"></i><span>${T('chat.btn.b2bAccountManager')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="b2bExportDocs"><i class="fas fa-file-alt"></i><span>${T('chat.btn.b2bExportDocs')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showContactInfo = useCallback(() => {
    addUserMsg(T('chat.msg.contactInfo'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.contactIntro'));
      setTimeout(() => {
        showOptions(`<div class="${s.suggestions}">
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="contactCall"><i class="fas fa-phone-alt"></i><span>${T('chat.btn.contactCall')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="contactEmail"><i class="fas fa-envelope"></i><span>${T('chat.btn.contactEmail')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="contactWhatsApp"><i class="fab fa-whatsapp"></i><span>${T('chat.btn.contactWhatsApp')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="contactSingapore"><i class="fas fa-map-marker-alt"></i><span>${T('chat.btn.contactSingapore')}</span></button>
          <button type="button" class="${s.suggestion}" data-action="suggestion" data-sugg="contactIndia"><i class="fas fa-map-marker-alt"></i><span>${T('chat.btn.contactIndia')}</span></button>
        </div>
        <div class="${s.followup}">
          <button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.askAnotherProduct')}</button>
          <button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> ${T('chat.btn.talkToAgent')}</button>
        </div>`);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showAllTopics = useCallback(() => {
    addUserMsg(T('chat.browseAll'));
    setTimeout(() => {
      addBotMsg(T('chat.msg.tapTopic'));
      setTimeout(() => {
        const html = '<div class="' + s.topicsPopup + '">' + TOPIC_CATEGORIES.map(cat =>
          `<div><div class="${s.topicCatTitle}">${cat.icon} ${cat.title}</div><div class="${s.topicPills}">${cat.items.map(item =>
            `<button class="${s.topicPill}" data-action="topicTap" data-question="${item.q}"><i class="${item.icon}"></i><span>${item.label}</span></button>`
          ).join('')}</div></div>`
        ).join('') + '</div><div class="' + s.followup + '"><button class="' + s.followupBtn + '" data-action="askAnother"><i class="fas fa-arrow-left"></i> ' + T('chat.btn.askAnotherProduct') + '</button><button class="' + s.followupBtn + '" data-action="agent"><i class="fas fa-headset"></i> ' + T('chat.btn.talkToAgent') + '</button></div>';
        showOptions(html);
      }, 300);
    }, 400);
  }, [addUserMsg, addBotMsg, showOptions]);

  const showTopicAnswer = useCallback((question: string) => {
    removeOptions();
    addUserMsg(question);
    setTimeout(() => {
      const answersMap = TR('chat.answers');
      const answers: Record<string, string> =
        answersMap && typeof answersMap === 'object' ? (answersMap as Record<string, string>) : {};
      const answer = answers[question] || 'I can help you with that. Let me show you the available topics:';
      addBotMsg(answer);
      setTimeout(() => showFollowup(), 300);
    }, 400);
  }, [removeOptions, addUserMsg, addBotMsg, showFollowup]);

  const processUserInput = useCallback((text: string) => {
    const lower = text.toLowerCase();
    removeOptions();
    if (flowMode === 'quantity' && selectedProduct) {
      const qty = parseInt(text, 10);
      const unitLabel = getUnitLabel(selectedProduct.unit);
      if (isNaN(qty) || qty < 1) {
        setTimeout(() => {
          addBotMsg(T('chat.msg.validQty'));
          setTimeout(() => {
            showOptions(`<div class="${s.qtyPicker}">
              <div class="${s.qtyRow}">
                <button class="${s.qtyBtn}" data-action="qtyMinus"><i class="fas fa-minus"></i></button>
                <span class="${s.qtyValue}" id="qtyValue">1</span>
                <button class="${s.qtyBtn}" data-action="qtyPlus"><i class="fas fa-plus"></i></button>
              </div>
              <div class="${s.qtyUnit}">${unitLabel}</div>
              <div class="${s.qtyPrice}">${T('chat.msg.totalLabel')} <span id="qtyTotal">${fmtPrice(selectedProduct.price)}</span></div>
            </div>
            <div class="${s.followup}">
              <button class="${s.followupBtn} ${s.qtyConfirmBtn}" data-action="confirmQty"><i class="fas fa-check"></i> ${T('shop.addToCart')}</button>
              <button class="${s.followupBtn}" data-action="cancelQty"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
            </div>`);
          }, 300);
        }, 400);
        return;
      }
      addToCart(selectedProduct, qty);
      showCartAfterAdd(selectedProduct, qty);
      return;
    }
    if (flowMode === 'address') {
      setOrderAddress(text);
      removeOptions();
      setFlowMode('payment');
      addUserMsg(text);
      setTimeout(() => {
        addBotMsg(T('chat.msg.addressConfirmed'));
        setTimeout(() => {
          showOptions(`<div class="${s.paymentOptions}">
            <button class="${s.paymentOption}" data-action="selectPayment" data-method="UPI">
              <i class="fas fa-mobile-alt"></i><span>UPI</span><small>Google Pay, PhonePe, Paytm</small>
            </button>
            <button class="${s.paymentOption}" data-action="selectPayment" data-method="Credit/Debit Card">
              <i class="fas fa-credit-card"></i><span>Credit/Debit Card</span><small>Visa, Mastercard, RuPay</small>
            </button>
            <button class="${s.paymentOption}" data-action="selectPayment" data-method="Net Banking">
              <i class="fas fa-university"></i><span>Net Banking</span><small>All major banks</small>
            </button>
            <button class="${s.paymentOption}" data-action="selectPayment" data-method="Cash on Delivery">
              <i class="fas fa-money-bill-wave"></i><span>Cash on Delivery</span><small>Pay at your doorstep</small>
            </button>
          </div>
          <div class="${s.followup}">
            <button class="${s.followupBtn}" data-action="cancelCheckout"><i class="fas fa-times"></i> ${T('account.cancel')}</button>
          </div>`);
        }, 300);
      }, 400);
      return;
    }
    setTimeout(() => {
      if (/product|vegetable|fruit|spice|organic|what.*sell/.test(lower)) showProducts();
      else if (/pric|cost|how much|plan|rate|charge/.test(lower)) showPricing();
      else if (/deliver|shipping|ship|dispatch/.test(lower)) showDelivery();
      else if (/track|order status|where.*order/.test(lower)) showTrackOrder();
      else if (/pay|card|upi|wallet|net bank/.test(lower)) showPaymentMethods();
      else if (/refund|return|money back/.test(lower)) showReturnPolicy();
      else if (/b2b|bulk|wholesale|business/.test(lower)) showB2B();
      else if (/contact|phone|email|whatsapp|address/.test(lower)) showContactInfo();
      else if (/hello|hi|hey/.test(lower)) {
        addBotMsg(T('chat.msg.hello'));
        setTimeout(() => showMainOptions(), 300);
      } else if (/thank|thanks/.test(lower)) {
        addBotMsg(T('chat.msg.thanks'));
        setTimeout(() => showMainOptions(), 300);
      } else {
        addBotMsg(T('chat.msg.iCanHelp'));
        setTimeout(() => showMainOptions(), 400);
      }
    }, 500);
  }, [flowMode, selectedProduct, removeOptions, showProducts, showPricing, showDelivery, showTrackOrder, showPaymentMethods, showReturnPolicy, showB2B, showContactInfo, addBotMsg, showMainOptions, addToCart, showCartAfterAdd, showOptions]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addUserMsg(text);
    processUserInput(text);
  }, [input, addUserMsg, processUserInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

  // Delegate clicks on options
  const handleBodyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-action]') as HTMLElement;
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;

    switch (action) {
      case 'products': showProducts(); break;
      case 'productCategory': showProductCategoryDetail(btn.dataset.category || ''); break;
      case 'selectProduct': selectProduct(btn.dataset.id || ''); break;
      case 'confirmQty': {
        const qtyEl = document.getElementById('qtyValue');
        const qty = qtyEl ? parseInt(qtyEl.textContent || '1', 10) : 1;
        const product = selectedProductRef.current;
        if (product) {
          addToCart(product, qty);
          showCartAfterAdd(product, qty);
          selectedProductRef.current = null;
        }
        break;
      }
      case 'cancelQty': setFlowMode('normal'); selectedProductRef.current = null; setSelectedProduct(null); showProducts(); break;
      case 'qtyMinus': {
        const el = document.getElementById('qtyValue');
        const totalEl = document.getElementById('qtyTotal');
        const product = selectedProductRef.current;
        if (el && product) {
          let val = parseInt(el.textContent || '1', 10);
          if (val > 1) val--;
          el.textContent = String(val);
          if (totalEl) {
            totalEl.textContent = fmtPrice(product.price * val);
          }
        }
        break;
      }
      case 'qtyPlus': {
        const el = document.getElementById('qtyValue');
        const totalEl = document.getElementById('qtyTotal');
        const product = selectedProductRef.current;
        if (el && product) {
          let val = parseInt(el.textContent || '1', 10);
          val++;
          el.textContent = String(val);
          if (totalEl) {
            totalEl.textContent = fmtPrice(product.price * val);
          }
        }
        break;
      }
      case 'checkout': showCheckout(); break;
      case 'confirmAddress': confirmAddress(); break;
      case 'cancelCheckout': cancelCheckout(); break;
      case 'getLocation': requestLocation(); break;
      case 'retryLocation': showCheckout(); break;
      case 'selectPayment': placeOrder(btn.dataset.method || ''); break;
      case 'placeOrderRetry': showCheckout(); break;
      case 'clearCart': setCart([]); removeOptions(); addBotMsg(T('chat.msg.cartCleared')); setTimeout(() => showProducts(), 300); break;
      case 'pricing': showPricing(); break;
      case 'delivery': showDelivery(); break;
      case 'track': showTrackOrder(); break;
      case 'cancel': showCancelOrder(); break;
      case 'confirmCancel': confirmCancelOrder(btn.dataset.orderId || '', btn.dataset.orderNumber || ''); break;
      case 'doCancel': doCancelOrder(btn.dataset.orderId || '', btn.dataset.orderNumber || ''); break;
      case 'keepOrder': removeOptions(); addBotMsg(T('chat.msg.keepOrderOk')); setTimeout(() => renderCancelList(), 300); break;
      case 'modify': removeOptions(); addUserMsg(T('chat.msg.modifyThisOrder')); setTimeout(() => { addBotMsg(T('chat.msg.modifyOrderAnswer')); setTimeout(() => showFollowup(), 400); }, 300); break;
      case 'return': removeOptions(); addUserMsg(T('chat.msg.returnRefund')); setTimeout(() => { addBotMsg(T('chat.msg.returnPolicyAnswer')); setTimeout(() => showFollowup(), 400); }, 300); break;
      case 'damaged': removeOptions(); addUserMsg(T('chat.msg.reportDamaged')); setTimeout(() => { addBotMsg(T('chat.msg.damagedAnswer')); setTimeout(() => showFollowup(), 400); }, 300); break;
      case 'wrong': removeOptions(); addUserMsg(T('chat.msg.wrongItem')); setTimeout(() => { addBotMsg(T('chat.msg.wrongAnswer')); setTimeout(() => showFollowup(), 400); }, 300); break;
      case 'payment': showPaymentMethods(); break;
      case 'b2b': showB2B(); break;
      case 'contact': showContactInfo(); break;
      case 'agent': talkToAgent(); break;
      case 'browse': showAllTopics(); break;
      case 'askAnother': askAnother(); break;
      case 'topicTap': showTopicAnswer(btn.dataset.question || ''); break;
      case 'orderDetail': showOrderDetail(btn.dataset.orderId || ''); break;
      case 'login': onClose(); navigate('/'); break;
      case 'shop': onClose(); navigate('/shop'); break;
      case 'orderTracking': onClose(); navigate('/account/order-tracking'); break;
      case 'navigate': onClose(); navigate(btn.dataset.to || '/'); break;
      case 'suggestion': {
        const slug = btn.getAttribute('data-sugg');
        const label = (btn.textContent || '').trim();
        addUserMsg(label);
        setTimeout(() => {
          let answer: unknown;
          if (slug) {
            const suggMap = TR('chat.sugg');
            answer = suggMap && typeof suggMap === 'object' ? (suggMap as Record<string, string>)[slug] : undefined;
          } else {
            answer = SUGGESTION_ANSWERS[label];
          }
          addBotMsg((typeof answer === 'string' && answer) || T('chat.msg.suggFallback'));
          setTimeout(() => showFollowup(), 300);
        }, 400);
        break;
      }
    }
  }, [showProducts, showProductCategoryDetail, selectProduct, addToCart, showCartAfterAdd, showCheckout, confirmAddress, cancelCheckout, requestLocation, placeOrder, showPricing, showDelivery, showTrackOrder, showCancelOrder, confirmCancelOrder, doCancelOrder, renderCancelList, showPaymentMethods, showReturnPolicy, showB2B, showContactInfo, talkToAgent, showAllTopics, askAnother, showTopicAnswer, showOrderDetail, removeOptions, addBotMsg, addUserMsg, showFollowup, onClose, navigate]);

  // Initialize welcome
  useEffect(() => {
    if (open && msgs.length === 0) {
      if (orderContext) {
        const itemsList = orderContext.items.length > 3
          ? orderContext.items.slice(0, 3).join(', ') + ' +' + fill(T('chat.msg.itemsMore'), { n: String(orderContext.items.length - 3) })
          : orderContext.items.join(', ');
        addBotMsg(
          fill(T('chat.msg.orderHelpIntro'), { number: orderContext.orderNumber }) + '<br><br>' +
          `<span style="font-size:12px;color:#666;">` + fill(T('chat.msg.orderHelpMeta'), { items: itemsList, total: fmtPrice(Number(orderContext.total)), status: orderContext.status }) + `</span><br><br>` +
          T('chat.msg.orderHelpAsk')
        );
        setTimeout(() => {
          const orderHtml = [
            { key: 'track', label: fill(T('chat.btn.trackOrderNum'), { number: orderContext.orderNumber }), icon: 'fas fa-truck' },
            { key: 'cancel', label: T('chat.msg.cancelThisOrder'), icon: 'fas fa-times-circle' },
            { key: 'modify', label: T('chat.msg.modifyThisOrder'), icon: 'fas fa-edit' },
            { key: 'return', label: T('chat.msg.returnRefund'), icon: 'fas fa-undo' },
            { key: 'damaged', label: T('chat.msg.reportDamaged'), icon: 'fas fa-box-open' },
            { key: 'wrong', label: T('chat.msg.wrongItem'), icon: 'fas fa-exchange-alt' },
          ].map(o =>
            `<button class="${s.numberedOption}" data-action="${o.key}"><i class="${o.icon}" style="width:20px;text-align:center;"></i><span>${o.label}</span><i class="fas fa-chevron-right ${s.optArrow}"></i></button>`
          ).join('');
          const contactBtn = `<button class="${s.numberedOption}" data-action="agent"><i class="fas fa-headset" style="width:20px;text-align:center;"></i><span>${T('chat.btn.talkToAgent')}</span><i class="fas fa-chevron-right ${s.optArrow}"></i></button>`;
          const backBtn = `<div class="${s.followup}"><button class="${s.followupBtn}" data-action="askAnother"><i class="fas fa-arrow-left"></i> ${T('chat.btn.backToMainMenu')}</button></div>`;
          showOptions(orderHtml + contactBtn + backBtn);
        }, 600);
      } else {
        addBotMsg(T('chat.msg.assistantWelcome'));
        setTimeout(() => showMainOptions(), 600);
      }
    }
  }, [open, msgs.length, addBotMsg, showMainOptions, showOptions, orderContext]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setMsgs([]);
      setOptionsHtml(null);
      setInput('');
      setCart([]);
      setFlowMode('normal');
      setSelectedProduct(null);
      selectedProductRef.current = null;
      setOrderAddress('');
      setOrderPayment('');
      bodyLockRef.current = false;
      idRef.current = 0;
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    bodyLockRef.current = true;
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (bodyLockRef.current) window.scrollTo(0, scrollY);
      bodyLockRef.current = false;
    };
  }, [open]);

  // Focus input
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 400);
  }, [open]);

  // Fetch products from API
  useEffect(() => {
    if (!open) return;
    /* TEMP (07-Oct-2026): 'Beverages' removed per head — restore to re-enable */
    const categories = ['Vegetables', 'Fruits', 'Groceries'];
    const c = country || 'SG';
    Promise.all(categories.map(cat =>
      listProducts({ country: c, category: cat, size: 50 }).then(res => [cat, res.content] as const)
    )).then(results => {
      const map: Record<string, Product[]> = {};
      for (const [cat, items] of results) {
        map[cat] = items;
      }
      setProducts(map);
    }).catch(() => {});
  }, [open, country]);

  const content = (
    <>
      <div className={`${s.overlay} ${open ? s.overlayOpen : ''}`} onClick={onClose} />
      <div className={`${s.panel} ${open ? s.panelOpen : ''} ${fullscreen ? s.fullscreen : ''}`}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}><i className="fas fa-leaf" /></div>
            <div>
              <span className={s.headerName}>{t('chat.title')}</span>
              <span className={s.headerStatus}><span className={s.dot} /> {t('chat.online')}</span>
            </div>
          </div>
          <div className={s.headerActions}>
            <div className={s.menuWrap} ref={menuRef}>
              <button
                className={`${s.headerBtn} ${menuOpen ? s.headerBtnActive : ''}`}
                aria-label={t('chat.moreOptions')}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
              >
                <i className="fas fa-ellipsis-v" />
              </button>
              {menuOpen && (
                <div className={s.menu} role="menu">
                  <button type="button" role="menuitem" onClick={restartChat}>
                    <i className="fas fa-redo" /> {t('chat.restart')}
                  </button>
                  <a role="menuitem" href="mailto:support@vpnexues.com" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-envelope" /> {t('chat.emailSupport')}
                  </a>
                </div>
              )}
            </div>
            <button className={s.headerBtn} onClick={() => setFullscreen(f => !f)} aria-label={t('chat.fullscreen')}>
              <i className={fullscreen ? 'fas fa-compress-alt' : 'fas fa-expand-alt'} />
            </button>
            <button className={s.closeBtn} onClick={onClose} aria-label={t('chat.closeChat')}><i className="fas fa-times" /></button>
          </div>
        </div>

        <div className={s.body} ref={bodyRef} onClick={handleBodyClick}>
          {msgs.map(m => (
            <div key={m.id} className={`${s.msg} ${m.from === 'bot' ? s.bot : s.user}`}>
              {m.from === 'bot' && <div className={s.msgAvatar}><i className="fas fa-robot" /></div>}
              <div className={s.msgBubble} dangerouslySetInnerHTML={{ __html: m.html }} />
            </div>
          ))}
          {optionsHtml && (
            <div className={s.optionsWrap} dangerouslySetInnerHTML={{ __html: optionsHtml }} />
          )}
        </div>

        <div className={s.footer}>
          <input
            ref={inputRef}
            className={s.input}
            type="text"
            placeholder={t('chat.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button className={s.send} onClick={handleSend} aria-label={t('chat.sendMessage')}>
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </>
  );
  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}
