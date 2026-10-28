export interface PlatformSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  timezone: string;
  language: string;
  websiteUrl: string;
  supportUrl: string;
  platformDescription: string;
  platformLogo: string;
  favicon: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailVerification: boolean;
  multiLanguage: boolean;
  cookieConsent: boolean;
  emailProvider: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  twoFA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordExpiry: number;
  ipWhitelistEnabled: boolean;
  allowedIps: string;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  theme: string;
  density: string;
  sidebarStyle: string;
  dashboardLayout: string;
  primaryColor: string;
  notifNewOrder: boolean;
  notifTickets: boolean;
  notifUsers: boolean;
  notifStock: boolean;
  notifPayments: boolean;
  notifMessages: boolean;
  notifUpdates: boolean;
  notifSystem: boolean;
  emailDigest: boolean;
  quietHours: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  autoBackups: boolean;
  backupFrequency: string;
  backupFormat: string;
  logRetention: number;
  lastBackup: string;
}

export const DEFAULT_PLATFORM: PlatformSettings = {
  platformName: 'VPNexues',
  tagline: 'Fresh groceries, delivered',
  contactEmail: 'hello@vpnexues.com',
  phone: '+65 6000 0000',
  timezone: 'Asia/Singapore',
  language: 'English',
  websiteUrl: 'https://vpnexues.com',
  supportUrl: 'https://vpnexues.com/support',
  platformDescription: 'VPNexues is a modern grocery ordering and delivery platform.',
  platformLogo: '',
  favicon: '',
  maintenanceMode: false,
  allowRegistration: true,
  emailVerification: false,
  multiLanguage: false,
  cookieConsent: false,
  emailProvider: 'Gmail',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUsername: 'admin@vpnexues.com',
  smtpPassword: '',
  fromName: 'VPNexues Support',
  fromEmail: 'noreply@vpnexues.com',
  twoFA: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  passwordExpiry: 90,
  ipWhitelistEnabled: false,
  allowedIps: '',
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
  theme: 'Light',
  density: 'Comfortable',
  sidebarStyle: 'Full Sidebar',
  dashboardLayout: 'Default',
  primaryColor: '#2E7D32',
  notifNewOrder: true,
  notifTickets: true,
  notifUsers: false,
  notifStock: true,
  notifPayments: true,
  notifMessages: true,
  notifUpdates: false,
  notifSystem: true,
  emailDigest: false,
  quietHours: false,
  quietHoursFrom: '22:00',
  quietHoursTo: '07:00',
  autoBackups: true,
  backupFrequency: 'Daily',
  backupFormat: 'JSON',
  logRetention: 30,
  lastBackup: '17 Aug 2026, 02:00 AM',
};

let sessionSettings: PlatformSettings | null = null;

export function getPlatformSettings(): PlatformSettings {
  if (!sessionSettings) sessionSettings = { ...DEFAULT_PLATFORM };
  return { ...sessionSettings };
}

export function savePlatformSettings(settings: PlatformSettings): void {
  sessionSettings = { ...settings };
}
