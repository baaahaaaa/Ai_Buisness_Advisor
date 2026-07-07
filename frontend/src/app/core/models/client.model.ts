export interface Client {
  clientId: number;
  nom: string;
  prenom: string;
  age: number;
  dateInscription: string;
  ancienneteAnnees: number;
  puissanceVehicule: number;
  kmAnnuel: number;
  ville: string;
}

export interface ClientRequest {
  nom: string;
  prenom: string;
  age: number;
  dateInscription: string;
  ancienneteAnnees: number;
  puissanceVehicule: number;
  kmAnnuel: number;
  ville: string;
}