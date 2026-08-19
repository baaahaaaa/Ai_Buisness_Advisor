export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

export interface ClientRequest {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}