import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = 'http://localhost:8080/api/clients';
  private advisorUrl = 'http://localhost:8080/api/advisor';

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  getClientCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  createClient(client: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  updateClient(id: number, client: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  analyseClient(id: number): Observable<any> {
    return this.http.get<any>(`${this.advisorUrl}/analyse/${id}`);
  }

  chatWithAdvisor(id: number, question: string): Observable<any> {
    return this.http.post<any>(`${this.advisorUrl}/chat/${id}`, { question });
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.advisorUrl}/dashboard`);
  }
}