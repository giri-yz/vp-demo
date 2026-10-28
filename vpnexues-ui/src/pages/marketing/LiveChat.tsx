import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useCountry } from '../../context/CountryContext';
import { useAuth } from '../../context/AuthContext';
import { getProductName } from '../../i18n/productNames';
import { useNavigate } from 'react-router-dom';
import * as ordersApi from '../../api/ordersApi';
import * as supportChatApi from '../../api/supportChatApi';
import type { Order } from '../../types';
import { SUGGESTION_ANSWERS } from '../../components/common/chatData';
import s from './css/LiveChat.module.css';

interface LiveChatProps {
  onClose: () => void;
}

type Message = { role: 'bot' | 'user'; html: string };

const MAIN_OPTIONS = [
  { num: 1, label: 'Products', key: 'products' },
  { num: 2, label: 'Pricing Plans', key: 'pricing' },
  { num: 3, label: 'Delivery Info', key: 'delivery' },
  { num: 4, label: 'Track My Order', key: 'track' },
  { num: 5, label: 'Payment Methods', key: 'payment' },
  { num: 6, label: 'Return Policy', key: 'return' },
  { num: 7, label: 'B2B Orders', key: 'b2b' },
  { num: 8, label: 'Contact Info', key: 'contact' },
  { num: 9, label: 'Talk to Agent', key: 'agent' },
];

const TOPIC_CATEGORIES = [
  { title: 'About Us', icon: 'fas fa-info-circle', items: [
    { q: 'What does VP NEXUES do?', label: 'What we do', icon: 'fas fa-info-circle' },
    { q: 'about vpnexues', label: 'About VPNexues', icon: 'fas fa-building' },
    { q: 'Why should I choose VPNexues?', label: 'Why choose us', icon: 'fas fa-check-circle' },
    { q: 'source from farmers', label: 'Our farmers', icon: 'fas fa-seedling' },
    { q: 'product quality', label: 'Quality assurance', icon: 'fas fa-award' },
  ]},
  { title: 'Products', icon: 'fas fa-leaf', items: [
    { q: 'What products do you sell?', label: 'Our products', icon: 'fas fa-leaf' },
    { q: 'do you provide organic products', label: 'Organic products', icon: 'fas fa-leaf' },
    { q: 'freshness', label: 'Freshness', icon: 'fas fa-snowflake' },
    { q: 'shelf life', label: 'Shelf life', icon: 'fas fa-clock' },
    { q: 'product samples', label: 'Product samples', icon: 'fas fa-box-open' },
  ]},
  { title: 'Pricing & Plans', icon: 'fas fa-tags', items: [
    { q: 'pricing plans', label: 'Pricing plans', icon: 'fas fa-tags' },
    { q: 'small box', label: 'Small Box', icon: 'fas fa-box' },
    { q: 'big box', label: 'Big Box', icon: 'fas fa-boxes' },
    { q: 'minimum order', label: 'Minimum order', icon: 'fas fa-shopping-cart' },
    { q: 'gift', label: 'Gift packs', icon: 'fas fa-gift' },
  ]},
  { title: 'Orders', icon: 'fas fa-shopping-bag', items: [
    { q: 'how to place an order', label: 'How to order', icon: 'fas fa-shopping-bag' },
    { q: 'track my order', label: 'Track order', icon: 'fas fa-truck' },
    { q: 'cancel order', label: 'Cancel order', icon: 'fas fa-times-circle' },
    { q: 'modify order', label: 'Modify order', icon: 'fas fa-edit' },
    { q: 'promo code', label: 'Promo codes', icon: 'fas fa-percent' },
  ]},
  { title: 'Delivery', icon: 'fas fa-truck', items: [
    { q: 'delivery info', label: 'Delivery info', icon: 'fas fa-truck' },
    { q: 'shipping charges', label: 'Shipping charges', icon: 'fas fa-shipping-fast' },
    { q: 'where do you deliver', label: 'Countries', icon: 'fas fa-globe' },
    { q: 'delayed order', label: 'Delayed order', icon: 'fas fa-exclamation-triangle' },
    { q: 'no one home', label: 'Missed delivery', icon: 'fas fa-home' },
  ]},
  { title: 'Payment', icon: 'fas fa-credit-card', items: [
    { q: 'payment methods', label: 'Payment methods', icon: 'fas fa-credit-card' },
    { q: 'cod', label: 'Cash on delivery', icon: 'fas fa-money-bill' },
    { q: 'payment failed', label: 'Payment failed', icon: 'fas fa-exclamation-circle' },
    { q: 'gst invoice', label: 'GST invoice', icon: 'fas fa-file-invoice' },
  ]},
  { title: 'Returns & Refunds', icon: 'fas fa-undo', items: [
    { q: 'return policy', label: 'Return policy', icon: 'fas fa-undo' },
    { q: 'refund', label: 'Refund options', icon: 'fas fa-money-bill-wave' },
    { q: 'damaged product', label: 'Damaged product', icon: 'fas fa-exclamation-triangle' },
    { q: 'wrong product', label: 'Wrong product', icon: 'fas fa-times-circle' },
  ]},
  { title: 'B2B & Wholesale', icon: 'fas fa-building', items: [
    { q: 'b2b orders', label: 'B2B orders', icon: 'fas fa-building' },
    { q: 'become a distributor', label: 'Become distributor', icon: 'fas fa-handshake' },
    { q: 'customized packaging', label: 'Custom packaging', icon: 'fas fa-box' },
    { q: 'request a quotation', label: 'Request quote', icon: 'fas fa-file-alt' },
    { q: 'do you export', label: 'Export services', icon: 'fas fa-globe' },
  ]},
  { title: 'Contact & Support', icon: 'fas fa-headset', items: [
    { q: 'contact info', label: 'Contact info', icon: 'fas fa-phone-alt' },
    { q: 'talk to agent', label: 'Talk to agent', icon: 'fas fa-headset' },
    { q: 'business hours', label: 'Business hours', icon: 'fas fa-clock' },
    { q: 'business enquiry', label: 'Business enquiry', icon: 'fas fa-envelope' },
    { q: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin' },
  ]},
];

const TOPIC_ANSWERS: Record<string, string> = {
  'What does VP NEXUES do?': 'We supply high-quality agricultural and food products for domestic and international markets. Farm-to-table organic produce connecting Tamil Nadu\'s finest farmers with global tables.',
  'about vpnexues': 'Est. 2022 — Tamil Nadu\'s Premier Organic Farm-to-Table Export Company. Connecting farmers directly with consumers. No middlemen, fair pricing, guaranteed freshness. Ships to India, Singapore, USA & UAE.',
  'Why should I choose VPNexues?': 'Quality: 100% certified organic, lab-tested produce.\nReliability: Consistent supply with on-time delivery.\nTraceability: QR codes on every carton.\nFair Trade: Direct from farmers, no middlemen.',
  'source from farmers': 'We source directly from certified organic farms across Tamil Nadu. Every farm is audited and certified under Indian & international organic standards.',
  'product quality': 'All products are 100% certified organic. Soil, water & produce tested at independent labs. QR code on every carton shows farm, harvest date & inspection report.',
  'What products do you sell?': 'Vegetables: Tomato, Carrot, Eggplant, Lady Finger, Broccoli, Beans, Onion\nFruits: Mango, Banana, Apple, Watermelon\nGrains & Spices: Coffee Beans, Dal, Rice, Premium Spices\nOther: Fresh Eggs, Beverages, Groceries\nAll chemical-free, sourced from certified organic farms.',
  'do you provide organic products': 'Yes! All our products are 100% certified organic. We work directly with certified organic farms across Tamil Nadu.',
  'freshness': 'Harvested to order, packed within hours. Cold-chain insulated packaging with ice packs. Temperature-controlled freight for international shipments.',
  'shelf life': 'Leafy Vegetables: 3–5 days (refrigerated)\nRoot Vegetables & Fruits: 7–10 days\nSpices & Grains: Up to 12 months. Every pack lists harvest date & best-before guidance.',
  'product samples': 'Yes, product samples are available depending on the product and request. Contact us to request samples for your evaluation.',
  'pricing plans': 'Small Box — ₹1,550: Min 10 products. Mix veg, fruits & groceries.\nBig Box — ₹5,518: Min 10 kg. Any mix. 12% discount.\nB2B Custom — Quote: Restaurants, hotels. 30-day credit. Visit vpnexues.com/pricing.html',
  'small box': 'Small Box — ₹1,550: Min 10 products per box. Mix vegetables, fruits & groceries. Weekly or fortnightly delivery. Items after 10 charged at +15% premium.',
  'big box': 'Big Box — ₹5,518: Min 10 kg total weight. Any mix from any category. No item count limit. 12% bulk discount auto-applied at 10 kg+.',
  'minimum order': 'Retail: No minimum — order a single item if you need.\nB2B / Wholesale: Minimum varies by product. Contact our B2B team for a quote.',
  'gift': 'Curated Small Box & Big Box subscriptions. Festive hampers during Diwali, Pongal & year-end. Subscribers get up to 15% off + priority delivery.',
  'how to place an order': '1. Browse at vpnexues.com/shop.html\n2. Add items to your cart\n3. Choose box type: Small Box, Big Box, or B2B\n4. Enter delivery details & complete payment. No account needed — checkout as a guest!',
  'track my order': '1. My Account → "My Orders"\n2. Tracking link via WhatsApp/email\n3. Order ID starts with VPN- (e.g. VPN-24581). Need help? Call +91 78100 77636',
  'cancel order': 'You can modify or cancel within 4 hours of placement (before packing). Contact via WhatsApp (+91 78100 77636) or Email (support@vpnexues.com). Include your order ID.',
  'modify order': 'You can modify within 4 hours of placement (before packing). Contact via WhatsApp (+91 78100 77636) or Email (support@vpnexues.com). Include your order ID.',
  'promo code': '1. Go to checkout\n2. Find "Apply Coupon" field\n3. Enter code and click "Apply"\n4. Discount reflected in order total.',
  'delivery info': 'We deliver across Singapore, India, UAE, USA & Europe. Free delivery on subscription plans. Same-day delivery in select cities.',
  'shipping charges': 'Tamil Nadu: FREE on orders above ₹999\nRest of India: Calculated at checkout by weight\nInternational: Quoted at checkout. No hidden fees.',
  'where do you deliver': 'We ship to: India, Singapore, United States, United Arab Emirates. New destinations reviewed quarterly.',
  'delayed order': '1. Check tracking link for updated ETA\n2. If 2+ days past promised date, WhatsApp +91 78100 77636 with order ID. We\'ll escalate it immediately.',
  'no one home': 'Delivery attempted up to 2 times. Package held at nearest hub for 3 days. Leave a note at checkout like "Leave with security" or "Call before delivery".',
  'payment methods': 'Cards: Visa, Mastercard, RuPay, Amex\nUPI: Google Pay, PhonePe, Paytm, BHIM\nNet Banking: All major Indian banks\nOther: PayNow (SG), PayPal, Bank Transfer (B2B)',
  'cod': 'Available for select Tamil Nadu pin codes. Orders under ₹5,000. Not available for international or B2B orders.',
  'payment failed': 'Usually auto-refunded by bank within 5–7 business days. If not refunded after 7 days, email support@vpnexues.com with transaction ID.',
  'return policy': 'We don\'t accept returns on opened items. If a product arrives damaged, expired, or wrong: free replacement, full refund (5–7 days), or store credit with 5% bonus. Report within 24 hours.',
  'refund': 'Full refund to original payment (5–7 business days). Free replacement on next delivery. Store credit with 5% bonus. Contact within 24 hours with order ID + photo.',
  'damaged product': 'Contact us within 24 hours with: order ID, photo of damaged product, and a short note. We\'ll arrange free replacement or full refund.',
  'wrong product': 'Contact us within 24 hours with: order ID, photo of wrong product, and a short note. We\'ll arrange free replacement or full refund.',
  'b2b orders': 'We Supply: Restaurants, Hotels, Grocery Chains, Food Processing, Institutions\nWhat You Get: Custom categories, Account manager, Invoice billing, 30-day credit, Organic & Halal certs. Email: support@vpnexues.com',
  'become a distributor': 'Interested in becoming a distributor? Contact our B2B team at support@vpnexues.com or call +91 78100 77636.',
  'customized packaging': 'Yes, we provide customised packaging for bulk orders. Discuss your requirements with our B2B team.',
  'request a quotation': 'Send us your requirements and we will provide a customised quotation. Response time: Usually within 24 business hours. Email: support@vpnexues.com',
  'do you export': 'Yes, we export products to international markets including Singapore, USA, and UAE. Contact our B2B team at support@vpnexues.com for export enquiries.',
  'contact info': 'Phone: +91 78100 77636 | +91 8148197842\nEmail: support@vpnexues.com\nSingapore: 412 Race Course Road, Singapore 218660\nIndia: Siva Towers, Salem, Tamil Nadu 636004',
  'talk to agent': 'Mon–Sat, 9AM–6PM IST\nPhone: +91 78100 77636\nWhatsApp: +91 78100 77636\nEmail: support@vpnexues.com',
  'business hours': 'Mon–Sat, 9AM–6PM IST. Closed on Sundays & public holidays.',
  'business enquiry': 'Email: support@vpnexues.com | Call: +91 78100 77636. We respond within 24 business hours.',
  'linkedin': 'Follow VPNexues on LinkedIn for company updates, product launches, and news: linkedin.com/company/vpnexues',
};

export default function LiveChat({ onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsKey = useRef(0);
  const initRef = useRef(false);
  const { t, lang } = useLanguage();
  const { country } = useCountry();
  const { user } = useAuth();
  // Logged-in customer identity: their chats reach the admin inbox under
  // their real name instead of the generic "Chat visitor".
  const knownName = user?.name?.trim() ?? '';
  const knownEmail = user?.email?.trim() ?? '';
  // Escalation → admin inbox transcript (session id in memory only, never persisted).
  const [escalateStep, setEscalateStep] = useState<'idle' | 'askName' | 'askEmail' | 'active' | 'failed'>('idle');
  const sessionIdRef = useRef<string | null>(null);
  const pendingNameRef = useRef('');
  const contactSavedRef = useRef(false);
  const autoPromptedRef = useRef(false);
  const pendingQuestionRef = useRef<string | null>(null);
  const transcriptRef = useRef<Array<{ sender: 'VISITOR' | 'BOT'; text: string }>>([]);
  // Admin message ids already shown — polling renders only newer ones.
  const seenAdminIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);
  const navigate = useNavigate();

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
  }, []);

  function stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /** Admin replies are plain text — escape before injecting into chat HTML. */
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Pulls the transcript and renders admin replies the visitor hasn't seen. Silent on failure. */
  async function pollAdminReplies() {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      const session = await supportChatApi.getChatSession(sid);
      const fresh = session.messages.filter((m) => m.sender === 'ADMIN' && !seenAdminIds.current.has(m.id));
      for (const m of fresh) {
        seenAdminIds.current.add(m.id);
        addBotMessage(`<b>${t('chat.agentReplyLabel')}</b><br>${escapeHtml(m.body).replace(/\n/g, '<br>')}`);
      }
    } catch {
      // Backend/session gone — retry on next tick, never break the widget.
    }
  }

  // Live two-way chat: while the widget is mounted, check for admin replies.
  const pollRef = useRef<() => void>(() => {});
  pollRef.current = () => {
    void pollAdminReplies();
  };
  useEffect(() => {
    const id = window.setInterval(() => pollRef.current(), 8000);
    return () => window.clearInterval(id);
  }, []);

  function addBotMessage(html: string) {
    setMessages((prev) => [...prev, { role: 'bot', html }]);
    if (!html.startsWith('__OPTIONS__')) {
      const text = stripTags(html);
      if (text) {
        transcriptRef.current.push({ sender: 'BOT', text: text.slice(0, 500) });
        if (transcriptRef.current.length > 60) transcriptRef.current.shift();
      }
    }
    scrollBottom();
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { role: 'user', html: escapeHtml(text) }]);
    transcriptRef.current.push({ sender: 'VISITOR', text: text.slice(0, 500) });
    if (transcriptRef.current.length > 60) transcriptRef.current.shift();
    // Once escalated, every visitor message also reaches the admin transcript.
    if (escalateStep === 'active' && sessionIdRef.current) {
      const sid = sessionIdRef.current;
      supportChatApi.postChatMessage(sid, 'VISITOR', text.slice(0, 2000)).catch(() => {});
    }
    scrollBottom();
  }

  function addOptions(html: string) {
    optionsKey.current += 1;
    setMessages((prev) => [...prev, { role: 'bot', html: `__OPTIONS__${optionsKey.current}::${html}` }]);
    scrollBottom();
  }

  function removeOptions() {
    setMessages((prev) => prev.filter((m) => !m.html.startsWith('__OPTIONS__')));
  }

  function showMainOptions() {
    let html = '';
    for (const opt of MAIN_OPTIONS) {
      html += `<button class="${s.numberedOption}" data-action="${opt.key}"><span class="${s.num}">${opt.num}.</span><span>${opt.label}</span><i class="fas fa-chevron-right ${s.optArrow}"></i></button>`;
    }
    html += `<button class="${s.browseAllBtn}" data-action="browse"><span>Browse All Topics</span><i class="fas fa-arrow-right"></i></button>`;
    addOptions(html);
  }

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setIsOpen(true);
    addBotMessage("Hi! I'm the VPNexues assistant. <i class='fas fa-leaf' style='color:#15803d'></i><br><br>I can help you with our organic products, pricing, orders, delivery, payments, returns, and more. What would you like to know?");
    setTimeout(() => showMainOptions(), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restartChat() {
    setMenuOpen(false);
    setMessages([]);
    setInput('');
    sessionIdRef.current = null;
    seenAdminIds.current.clear();
    pendingNameRef.current = '';
    contactSavedRef.current = false;
    autoPromptedRef.current = false;
    pendingQuestionRef.current = null;
    transcriptRef.current = [];
    setEscalateStep('idle');
    optionsKey.current += 1;
    addBotMessage("Hi! I'm the VPNexues assistant. <i class='fas fa-leaf' style='color:#15803d'></i><br><br>I can help you with our organic products, pricing, orders, delivery, payments, returns, and more. What would you like to know?");
    setTimeout(() => showMainOptions(), 400);
  }

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [messages]);

  function handleOptionAction(action: string) {
    removeOptions();
    switch (action) {
      case 'products': showProducts(); break;
      case 'pricing': showPricing(); break;
      case 'delivery': showDelivery(); break;
      case 'track': showTrackOrder(); break;
      case 'payment': showPaymentMethods(); break;
      case 'return': showReturnPolicy(); break;
      case 'b2b': showB2B(); break;
      case 'contact': showContactInfo(); break;
      case 'agent': talkToAgent(); break;
      case 'browse': showAllTopics(); break;
      default: askAnother(); break;
    }
  }

  function showFollowup() {
    let html = `<div class="${s.followupWrap}">`;
    html += `<button class="${s.followupBtn}" data-action="ask-another"><i class="fas fa-arrow-left"></i> Ask another question</button>`;
    html += `<button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> Talk to Agent</button>`;
    html += '</div>';
    addOptions(html);
  }

  function showProducts() {
    addUserMessage('Products');
    setTimeout(() => {
      addBotMessage('Our Products — 100% organic from Tamil Nadu');
      setTimeout(() => {
        let html = `<div class="${s.productCats}">`;
        html += `<button type="button" class="${s.pcat}" data-action="navigate" data-to="/shop"><div class="${s.pcatHead}"><i class="${s.pcatHeadIcon} fas fa-carrot"></i><strong>Vegetables</strong></div><div class="${s.pcatItems}">Tomato, Carrot, Eggplant, Lady Finger, Broccoli, Beans, Onion</div></button>`;
        html += `<button type="button" class="${s.pcat}" data-action="navigate" data-to="/shop"><div class="${s.pcatHead}"><i class="${s.pcatHeadIcon} fas fa-apple-alt"></i><strong>Fruits</strong></div><div class="${s.pcatItems}">Mango, Banana, Apple, Watermelon</div></button>`;
        html += `<button type="button" class="${s.pcat}" data-action="navigate" data-to="/shop"><div class="${s.pcatHead}"><i class="${s.pcatHeadIcon} fas fa-seedling"></i><strong>Grains & Spices</strong></div><div class="${s.pcatItems}">Coffee Beans, Dal, Rice, Premium Spices</div></button>`;
        html += `<button type="button" class="${s.pcat}" data-action="navigate" data-to="/shop"><div class="${s.pcatHead}"><i class="${s.pcatHeadIcon} fas fa-ellipsis-h"></i><strong>Other</strong></div><div class="${s.pcatItems}">Fresh Eggs, Beverages, Groceries</div></button>`;
        html += '</div>';
        html += `<div class="${s.botNote}">All chemical-free, sourced from certified organic farms.</div>`;
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function showPricing() {
    addUserMessage('Pricing Plans');
    setTimeout(() => {
      addBotMessage('Here are our pricing plans:');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/small-box"><i class="fas fa-box-open ${s.suggestionIcon}"></i><span><strong>Small Box</strong> — From ₹1,550</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/big-box"><i class="fas fa-box ${s.suggestionIcon}"></i><span><strong>Big Box</strong> — From ₹5,518</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/pricing/b2b"><i class="fas fa-warehouse ${s.suggestionIcon}"></i><span><strong>B2B Bulk Supply</strong> — Custom pricing</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-carrot ${s.suggestionIcon}"></i><span><strong>Organic Vegetables</strong> — Varies by product</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-apple-alt ${s.suggestionIcon}"></i><span><strong>Tropical Fruits</strong> — From ₹30/box</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="navigate" data-to="/shop"><i class="fas fa-pepper-hot ${s.suggestionIcon}"></i><span><strong>Premium Spices</strong> — From ₹15/pack</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function showDelivery() {
    addUserMessage('Delivery Info');
    setTimeout(() => {
      addBotMessage('We deliver across Singapore, India, UAE, USA & Europe. Delivery is free on subscription plans!');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-truck ${s.suggestionIcon}"></i><span>Free delivery on all subscription plans</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-bolt ${s.suggestionIcon}"></i><span>Same-day delivery in select cities</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-map-pin ${s.suggestionIcon}"></i><span>Track your delivery in real-time</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-calendar-check ${s.suggestionIcon}"></i><span>Flexible scheduling — choose your delivery day</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-recycle ${s.suggestionIcon}"></i><span>Eco-friendly packaging — zero plastic</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  async function showTrackOrder() {
    addUserMessage('Track My Order');
    setTimeout(async () => {
      let orders: Order[] = [];
      try {
        orders = await ordersApi.listOrders();
      } catch {
        orders = [];
      }
      if (!orders.length) {
        addBotMessage('We couldn\'t find any orders on your account yet.');
        setTimeout(() => {
          let html = `<div class="${s.followupWrap}">`;
          html += `<button class="${s.followupBtn}" data-action="ask-another"><i class="fas fa-arrow-left"></i> Back to Support</button>`;
          html += '</div>';
          addOptions(html);
        }, 300);
        return;
      }
      addBotMessage('Here are your recent orders:');
      setTimeout(() => {
        const recent = orders.slice(0, 5);
        let html = `<div class="${s.orderList}">`;
        for (const order of recent) {
          const statusLabel = (order.status || 'processing').charAt(0).toUpperCase() + (order.status || 'processing').slice(1);
          const d = new Date(order.createdAt);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
          const itemNames = order.items.map((i) => i.name).filter(Boolean);
          const itemsText = itemNames.length > 2
            ? itemNames.slice(0, 2).join(', ') + ' & ' + (itemNames.length - 2) + ' more'
            : itemNames.join(', ');
          html += `<div class="${s.orderCard}" data-action="order-detail" data-order-id="${order.id}">`;
          html += `<div class="${s.orderCardTop}"><span class="${s.orderId}">${order.orderNumber || order.id}</span><span class="${s.ordStatus} ${s[`ordStatus--${order.status || 'processing'}`]}">${statusLabel}</span></div>`;
          html += `<div class="${s.orderCardBody}">`;
          if (itemsText) html += `<div class="${s.orderItems}">${itemsText}</div>`;
          html += `<div class="${s.orderMeta}"><span>Placed: ${dateStr}</span><span>₹${Number(order.grandTotal).toFixed(2)}</span></div>`;
          html += '</div>';
          html += `<div class="${s.orderCardAction}"><button class="${s.orderDetailBtn}" data-action="order-detail" data-order-id="${order.id}"><i class="fas fa-eye"></i> View Details</button></div>`;
          html += '</div>';
        }
        html += '</div>';
        let followupHtml = `<div class="${s.followupWrap}">`;
        followupHtml += `<button class="${s.followupBtn}" data-action="ask-another"><i class="fas fa-arrow-left"></i> Back</button>`;
        followupHtml += '</div>';
        html += followupHtml;
        addBotMessage(html);
      }, 400);
    }, 400);
  }

  function showPaymentMethods() {
    addUserMessage('Payment Methods');
    setTimeout(() => {
      addBotMessage('We accept all major payment methods:');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-credit-card ${s.suggestionIcon}"></i><span>Credit & Debit Cards (Visa, Mastercard, AMEX)</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-mobile-alt ${s.suggestionIcon}"></i><span>UPI (Google Pay, PhonePe, Paytm)</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-university ${s.suggestionIcon}"></i><span>Net Banking</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-wallet ${s.suggestionIcon}"></i><span>Digital Wallets</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-shield-alt ${s.suggestionIcon}"></i><span>All transactions are secure & encrypted</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function showReturnPolicy() {
    addUserMessage('Return Policy');
    setTimeout(() => {
      addBotMessage('Our return & refund policy:');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-clock ${s.suggestionIcon}"></i><span>Fresh produce returns accepted within 24 hours of delivery if damaged</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-money-bill-wave ${s.suggestionIcon}"></i><span>Refund processed within 3-5 business days</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-camera ${s.suggestionIcon}"></i><span>Damaged or wrong item? Share photo via support for instant replacement</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-calendar-times ${s.suggestionIcon}"></i><span>Subscription can be paused or cancelled anytime — no penalty</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function showB2B() {
    addUserMessage('B2B Orders');
    setTimeout(() => {
      addBotMessage('B2B Bulk Supply — Wholesale organic produce for businesses:');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-store ${s.suggestionIcon}"></i><span>Bulk orders for restaurants, hotels & retailers</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-weight-hanging ${s.suggestionIcon}"></i><span>Minimum order: 50kg per delivery</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-tags ${s.suggestionIcon}"></i><span>Custom packaging with your brand label</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-user-tie ${s.suggestionIcon}"></i><span>Dedicated account manager for your business</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-file-alt ${s.suggestionIcon}"></i><span>Export documentation & logistics handled</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function showContactInfo() {
    addUserMessage('Contact Info');
    setTimeout(() => {
      addBotMessage('Here\'s how you can reach us:');
      setTimeout(() => {
        let html = `<div class="${s.suggestions}">`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-phone-alt ${s.suggestionIcon}"></i><span>Call Us: +91 78100 77636 | +91 8148197842</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-envelope ${s.suggestionIcon}"></i><span>Email: support@vpnexues.com</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fab fa-whatsapp ${s.suggestionIcon}"></i><span>WhatsApp: +91 78100 77636</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-map-marker-alt ${s.suggestionIcon}"></i><span>Singapore: 412 Race Course Road, Singapore 218660</span></button>`;
        html += `<button type="button" class="${s.suggestion}" data-action="suggestion"><i class="fas fa-map-marker-alt ${s.suggestionIcon}"></i><span>India: Siva Towers, Salem, Tamil Nadu 636004</span></button>`;
        html += '</div>';
        addBotMessage(html);
        setTimeout(() => showFollowup(), 300);
      }, 300);
    }, 400);
  }

  function talkToAgent() {
    removeOptions();
    addUserMessage('I want to talk to an agent');
    setTimeout(() => {
      if (sessionIdRef.current && contactSavedRef.current) {
        addBotMessage(t('chat.escalateAlreadyConnected'));
        setTimeout(() => showFollowup(), 300);
        return;
      }
      if (sessionIdRef.current && pendingNameRef.current) {
        setEscalateStep('askEmail');
        addBotMessage(t('chat.escalateEmailPrompt').replace('{name}', pendingNameRef.current));
        return;
      }
      // Logged-in customer with verified identity: connect immediately,
      // skipping the name/email prompts (backend still validates).
      if (knownName && knownEmail) {
        pendingNameRef.current = knownName;
        void saveContactAndActivate(knownName, knownEmail);
        return;
      }
      if (knownName) {
        pendingNameRef.current = knownName;
        setEscalateStep('askEmail');
        addBotMessage(t('chat.escalateEmailPrompt').replace('{name}', knownName));
        return;
      }
      setEscalateStep('askName');
      addBotMessage(t('chat.escalateNamePrompt'));
    }, 500);
  }

  /** First typed question: store a provisional guest session immediately so
      the chat exists in the admin inbox even if the visitor abandons it. */
  async function eagerStart(text: string) {
    try {
      const session = await supportChatApi.createChatSession({
        visitorName: knownName || 'Chat visitor',
        visitorEmail: knownEmail || undefined,
        countryCode: country,
        subject: `Live chat: ${text.slice(0, 80)}`,
      });
      sessionIdRef.current = session.id;
      await supportChatApi.postChatMessage(session.id, 'VISITOR', text.slice(0, 2000));
    } catch {
      // Backend unreachable: fall back to bot-only answers.
    }
    setEscalateStep('askName');
    setTimeout(() => addBotMessage(t('chat.autoCapturePrompt')), 600);
  }

  /** Attaches name/email to the session (creating it if needed), mirrors the
      ticket row + transcript email on the backend, then answers the question. */
  async function saveContactAndActivate(name: string, email: string) {
    addBotMessage(t('chat.escalateConnecting'));
    try {
      let sid = sessionIdRef.current;
      if (!sid) {
        const history = transcriptRef.current.slice(-12);
        const firstVisitor = history.find((h) => h.sender === 'VISITOR');
        const subject = firstVisitor
          ? `Live chat: ${firstVisitor.text.slice(0, 80)}`
          : 'Live chat escalation';
        const session = await supportChatApi.createChatSession({
          visitorName: name,
          visitorEmail: email,
          countryCode: country,
          subject,
        });
        sid = session.id;
        sessionIdRef.current = sid;
        for (const h of history) {
          await supportChatApi.postChatMessage(sid, h.sender, h.text.slice(0, 2000));
        }
        await supportChatApi.notifyChatAdmins(sid);
      } else {
        // Backend mirrors the ticket row + sends the transcript email on attach.
        await supportChatApi.updateChatContact(sid, name, email);
      }
      contactSavedRef.current = true;
      setEscalateStep('active');
      setTimeout(() => {
        addBotMessage(
          t('chat.escalateConnected')
            .replace('{id}', (sid as string).slice(0, 8).toUpperCase())
            .replace('{email}', email),
        );
        setTimeout(() => showFollowup(), 300);
      }, 400);
      flushPendingQuestion();
    } catch {
      setEscalateStep('failed');
      setTimeout(() => addBotMessage(t('chat.escalateFailed')), 400);
      flushPendingQuestion();
    }
  }

  function showAllTopics() {
    addUserMessage('Browse All Topics');
    setTimeout(() => {
      addBotMessage('Tap a topic to get an instant answer:');
      setTimeout(() => {
        let html = `<div class="${s.topicsPopup}">`;
        for (const cat of TOPIC_CATEGORIES) {
          html += `<div class="lc-topic-cat"><div class="${s.topicCatTitle}"><i class="${cat.icon}"></i> ${cat.title}</div><div class="${s.topicPills}">`;
          for (const item of cat.items) {
            html += `<button class="${s.topicPill}" data-action="topic-tap" data-question="${item.q}"><i class="${item.icon} ${s.topicPillIcon}"></i><span>${item.label}</span></button>`;
          }
          html += '</div></div>';
        }
        html += '</div>';
        let followupHtml = `<div class="${s.followupWrap}">`;
        followupHtml += `<button class="${s.followupBtn}" data-action="ask-another"><i class="fas fa-arrow-left"></i> Ask another question</button>`;
        followupHtml += `<button class="${s.followupBtn}" data-action="agent"><i class="fas fa-headset"></i> Talk to Agent</button>`;
        followupHtml += '</div>';
        addBotMessage(html);
        setTimeout(() => addOptions(followupHtml), 300);
      }, 300);
    }, 400);
  }

  function askAnother() {
    removeOptions();
    addUserMessage('I have another question');
    setTimeout(() => {
      addBotMessage('Sure! What would you like to know about?');
      setTimeout(() => showMainOptions(), 300);
    }, 400);
  }

  function handleTopicTap(question: string) {
    removeOptions();
    addUserMessage(question);
    setTimeout(() => {
      const answer = TOPIC_ANSWERS[question] || 'I can help you with that. Let me show you the available topics:';
      addBotMessage(answer);
      setTimeout(() => showFollowup(), 300);
    }, 400);
  }

  function processUserInput(text: string) {
    const lower = text.toLowerCase();
    removeOptions();
    setTimeout(() => {
      if (/product|vegetable|fruit|spice|organic|what.*sell/.test(lower)) {
        showProducts();
      } else if (/pric|cost|how much|plan|rate|charge/.test(lower)) {
        showPricing();
      } else if (/deliver|shipping|ship|dispatch/.test(lower)) {
        showDelivery();
      } else if (/track|order status|where.*order/.test(lower)) {
        showTrackOrder();
      } else if (/pay|card|upi|wallet|net bank/.test(lower)) {
        showPaymentMethods();
      } else if (/refund|return|money back/.test(lower)) {
        showReturnPolicy();
      } else if (/b2b|bulk|wholesale|business/.test(lower)) {
        showB2B();
      } else if (/contact|phone|email|whatsapp|address/.test(lower)) {
        showContactInfo();
      } else if (/hello|hi|hey/.test(lower)) {
        addBotMessage('Hello! <i class="fas fa-hand-wave" style="font-size:16px"></i> How can I assist you today?');
        setTimeout(() => showMainOptions(), 300);
      } else if (/thank|thanks/.test(lower)) {
        addBotMessage('You\'re welcome! <i class="fas fa-leaf" style="color:#15803d"></i> Is there anything else I can help with?');
        setTimeout(() => showMainOptions(), 300);
      } else {
        addBotMessage('I can help you with products, pricing, delivery, orders & more. Let me show you:');
        setTimeout(() => showMainOptions(), 400);
      }
    }, 500);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    // Escalation contact capture takes over the input while active.
    if (escalateStep === 'askName') {
      const name = text.slice(0, 100);
      if (!name) {
        addBotMessage(t('chat.escalateNameError'));
        return;
      }
      addUserMessage(name);
      setInput('');
      pendingNameRef.current = name;
      setEscalateStep('askEmail');
      setTimeout(() => addBotMessage(t('chat.escalateEmailPrompt').replace('{name}', name)), 400);
      return;
    }
    if (escalateStep === 'askEmail') {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
      if (!emailOk || text.length > 255) {
        addBotMessage(t('chat.escalateEmailError'));
        return;
      }
      addUserMessage(text);
      setInput('');
      // Upload the name/email texts too so the admin transcript has context.
      if (sessionIdRef.current) {
        const sid = sessionIdRef.current;
        supportChatApi.postChatMessage(sid, 'VISITOR', pendingNameRef.current.slice(0, 2000)).catch(() => {});
        supportChatApi.postChatMessage(sid, 'VISITOR', text.slice(0, 2000)).catch(() => {});
      }
      void saveContactAndActivate(pendingNameRef.current || 'Guest', text);
      return;
    }
    // First typed question: store a guest session immediately, then capture
    // contact so the chat is in the admin inbox (topic buttons stay bot-only).
    if (escalateStep === 'idle' && !sessionIdRef.current && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      pendingQuestionRef.current = text;
      addUserMessage(text);
      setInput('');
      void eagerStart(text);
      return;
    }
    addUserMessage(text);
    setInput('');
    processUserInput(text);
  }

  function flushPendingQuestion() {
    const q = pendingQuestionRef.current;
    pendingQuestionRef.current = null;
    if (q) {
      setTimeout(() => processUserInput(q), 600);
    }
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSend();
  }

  function handleBodyClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action!;
    if (action === 'ask-another') {
      askAnother();
    } else if (action === 'agent') {
      talkToAgent();
    } else if (action === 'topic-tap') {
      const question = btn.dataset.question!;
      handleTopicTap(question);
    } else if (action === 'order-detail') {
      const orderId = btn.dataset.orderId!;
      showOrderDetail(orderId);
    } else if (action === 'navigate') {
      onClose();
      navigate(btn.dataset.to || '/');
    } else if (action === 'suggestion') {
      const label = (btn.textContent || '').trim();
      removeOptions();
      addUserMessage(label);
      setTimeout(() => {
        addBotMessage(SUGGESTION_ANSWERS[label] || 'I can share more about that. Ask another question or talk to an agent.');
        setTimeout(() => showFollowup(), 300);
      }, 400);
    } else {
      handleOptionAction(action);
    }
  }

  async function showOrderDetail(orderId: string) {
    removeOptions();
    addUserMessage('View ' + orderId);
    setTimeout(async () => {
      let order: Order | null = null;
      try {
        order = await ordersApi.getOrder(orderId);
      } catch {
        order = null;
      }
      if (!order) {
        addBotMessage('Order not found. It may have been removed.');
        setTimeout(() => showMainOptions(), 300);
        return;
      }
      const statusLabel = (order.status || 'processing').charAt(0).toUpperCase() + (order.status || 'processing').slice(1);
      const d = new Date(order.createdAt);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear() + ' • ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

      let html = `<div class="${s.ordDetail}">`;
      html += `<div class="${s.ordDetailHeader}"><div class="${s.ordDetailId}">${order.orderNumber || order.id}</div><span class="${s.ordStatus} ${s[`ordStatus--${order.status || 'processing'}`]}">${statusLabel}</span></div>`;
      html += `<div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">Placed</span><span>${dateStr}</span></div>`;
      html += `<div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">Total</span><span>₹${Number(order.grandTotal).toFixed(2)}</span></div>`;
      if (order.paymentMethod) html += `<div class="${s.ordDetailRow}"><span class="${s.ordDetailLabel}">Payment</span><span>${order.paymentMethod}</span></div>`;
      const items = order.items || [];
      if (items.length) {
        html += `<div class="${s.ordDetailItemsLabel}">Items (${items.length})</div>`;
        for (const item of items) {
          html += `<div class="${s.ordDetailItem}"><div><div class="${s.ordDetailItemName}">${getProductName(item.name || 'Item', lang)}</div><div class="${s.ordDetailItemQty}">Qty: ${item.qty} × ₹${Number(item.unitPrice).toFixed(2)}</div></div><div class="${s.ordDetailItemTotal}">₹${(Number(item.unitPrice) * item.qty).toFixed(2)}</div></div>`;
        }
      }
      html += `<div class="${s.ordDetailNote}"><i class="fas fa-info-circle"></i> Live tracking is not currently available for this order.</div>`;
      html += `<div class="${s.ordDetailNote}"><i class="fas fa-clock"></i> Estimated delivery information is currently unavailable.</div>`;
      html += '</div>';
      let followupHtml = `<div class="${s.followupWrap}">`;
      followupHtml += `<button class="${s.followupBtn}" data-action="ask-another"><i class="fas fa-arrow-left"></i> Back</button>`;
      followupHtml += '</div>';
      html += followupHtml;
      addBotMessage(html);
    }, 400);
  }

  return (
    <>
      <div
        className={`${s.overlay} ${isOpen ? s.overlayOpen : ''}`}
        onClick={onClose}
      />
      <div className={`${s.panel} ${isOpen ? s.panelOpen : ''} ${isFullscreen ? s.panelFullscreen : ''}`}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}><i className="fas fa-leaf"></i></div>
            <div className={s.headerInfo}>
              <span className={s.headerName}>{t('chat.title')}</span>
              <span className={s.headerStatus}>
                <span className={s.dot} /> {t('chat.online')}
              </span>
            </div>
          </div>
          <div className={s.headerActions}>
            <div className={s.menuWrap} ref={menuRef}>
              <button
                type="button"
                className={`${s.headerBtn} ${menuOpen ? s.headerBtnActive : ''}`}
                aria-label={t('chat.moreOptions')}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              {menuOpen && (
                <div className={s.menu} role="menu">
                  <button type="button" role="menuitem" onClick={restartChat}>
                    <i className="fas fa-redo"></i> {t('chat.restart')}
                  </button>
                  <a role="menuitem" href="mailto:support@vpnexues.com" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-envelope"></i> {t('chat.emailSupport')}
                  </a>
                </div>
              )}
            </div>
            <button type="button" className={s.headerBtn} onClick={() => setIsFullscreen((f) => !f)} aria-label={t('chat.fullscreen')}>
              <i className={`fas ${isFullscreen ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
            </button>
            <button type="button" className={s.closeBtn} onClick={onClose} aria-label={t('chat.closeChat')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className={s.body} ref={bodyRef} onClick={handleBodyClick}>
          {messages.map((msg, i) => {
            if (msg.html.startsWith('__OPTIONS__')) {
              const htmlContent = msg.html.split('::').slice(1).join('::');
              return <div key={i} className={s.optionsWrap} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
            }
            return (
              <div key={i} className={`${s.msg} ${msg.role === 'user' ? s.msgUser : s.msgBot}`}>
                {msg.role === 'bot' && <div className={s.msgAvatar}><i className="fas fa-robot"></i></div>}
                <div className={s.msgBubble} dangerouslySetInnerHTML={{ __html: msg.html }} />
              </div>
            );
          })}
        </div>

        <div className={s.footer}>
          <input
            ref={inputRef}
            type="text"
            className={s.input}
            placeholder={t('chat.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKey}
            autoComplete="off"
          />
          <button type="button" className={s.sendBtn} onClick={handleSend}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
}
