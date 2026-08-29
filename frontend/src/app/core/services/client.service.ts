import { Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Client,
  ClientRequest
} from '../models/client.model';

import {
  environment
} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ClientService {

  /*
   * Spring Boot
   *
   * Angular ne doit pas appeler directement FastAPI.
   */
  private readonly baseUrl =
    `${environment.apiUrl}/api/clients`;


  /*
   * Spring Boot Advisor Controller
   */
  private readonly advisorUrl =
    `${environment.apiUrl}/api/advisor`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // =========================================================
  // CLIENTS
  // =========================================================

  getAllClients(): Observable<Client[]> {

    return this.http.get<Client[]>(
      this.baseUrl
    );

  }


  getClientById(
    id: number
  ): Observable<Client> {

    return this.http.get<Client>(
      `${this.baseUrl}/${id}`
    );

  }


  getClientCount(): Observable<number> {

    return this.http.get<number>(
      `${this.baseUrl}/count`
    );

  }


  createClient(
    client: ClientRequest
  ): Observable<Client> {

    return this.http.post<Client>(
      this.baseUrl,
      client
    );

  }


  updateClient(
    id: number,
    client: ClientRequest
  ): Observable<Client> {

    return this.http.put<Client>(
      `${this.baseUrl}/${id}`,
      client
    );

  }


  deleteClient(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/${id}`
    );

  }


  // =========================================================
  // AI ADVISOR
  // =========================================================

  analyseClient(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.advisorUrl}/analyse/${id}`
    );

  }


  chatWithAdvisor(
    id: number,
    question: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.advisorUrl}/chat/${id}`,
      {
        question
      }
    );

  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  getDashboard(): Observable<any> {

    /*
     * IMPORTANT
     *
     * Angular -> Spring Boot
     *
     * NE PAS utiliser :
     *
     * http://localhost:8000/api/dashboard
     *
     * Le port 8000 est réservé au service FastAPI.
     */
    return this.http.get<any>(
      `${this.advisorUrl}/dashboard`
    );

  }


  // =========================================================
  // REPORTS
  // =========================================================

  getReportClientJson(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.advisorUrl}/report/client/${id}`
    );

  }


  getReportGlobalJson(): Observable<any> {

    return this.http.get<any>(
      `${this.advisorUrl}/report/global`
    );

  }


  downloadReportClientPdf(
    id: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.advisorUrl}/report/client/${id}/pdf`,
      {
        responseType: 'blob'
      }
    );

  }


  downloadReportGlobalPdf(): Observable<Blob> {

    return this.http.get(
      `${this.advisorUrl}/report/global/pdf`,
      {
        responseType: 'blob'
      }
    );

  }

}