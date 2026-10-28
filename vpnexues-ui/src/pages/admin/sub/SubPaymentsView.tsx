import PaymentAnalytics from './PaymentAnalytics';
import type { CountryConfig } from '../../../config/countryConfig';

export default function SubPaymentsView({ config }: { config: CountryConfig }) {
  return <PaymentAnalytics config={config} />;
}
