import httpClient from './httpClient';

export interface B2BEnquiryInput {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  productInterest?: string;
  quantity?: string;
  estimatedValue?: number;
}

export async function submitB2BEnquiry(input: B2BEnquiryInput): Promise<void> {
  await httpClient.post('/api/b2b-enquiries', input);
}
