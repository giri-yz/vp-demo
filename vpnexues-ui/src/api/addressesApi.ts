import httpClient from './httpClient';
import type { Address, CreateAddressInput } from '../types';

export async function listAddresses(): Promise<Address[]> {
  const { data } = await httpClient.get<Address[]>('/api/addresses');
  return data;
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  const { data } = await httpClient.post<Address>('/api/addresses', input);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await httpClient.delete(`/api/addresses/${id}`);
}
