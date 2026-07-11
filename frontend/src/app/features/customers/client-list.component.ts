import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatChipsModule, MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  allClients = signal<Client[]>([]);
  loading = signal(true);
  error = signal('');
  search = signal('');

  pageSize = 10;
  currentPage = signal(0);

  displayedColumns: string[] = ['clientId', 'name', 'age', 'ville', 'actions'];

  filteredClients = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.allClients();
    return this.allClients().filter(c =>
      c.nom.toLowerCase().includes(term) ||
      c.prenom.toLowerCase().includes(term) ||
      c.ville.toLowerCase().includes(term) ||
      String(c.clientId).includes(term)
    );
  });

  displayedClients = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredClients().slice(start, start + this.pageSize);
  });

  private avatarColors = [
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  ];

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  getAvatarColor(client: Client): string {
    const idx = client.clientId % this.avatarColors.length;
    return this.avatarColors[idx];
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.allClients.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des clients');
        this.loading.set(false);
        this.notificationService.error('Impossible de charger les clients');
        console.error(err);
      }
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.currentPage.set(0);
  }

  handlePageEvent(e: PageEvent): void {
    this.pageSize = e.pageSize;
    this.currentPage.set(e.pageIndex);
  }

  deleteClient(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.notificationService.success('Client supprime avec succes');
          this.loadClients();
        },
        error: (err) => {
          this.notificationService.error('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  }
}
