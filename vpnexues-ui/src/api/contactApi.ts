import httpClient from './httpClient';

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(input: ContactFormInput): Promise<void> {
  await httpClient.post('/api/contact-messages', input);
}
