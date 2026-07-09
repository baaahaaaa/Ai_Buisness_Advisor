import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  allClients = signal<Client[]>([]);
  loading = signal(true);
  error = signal('');
  search = signal('');

  pageSize = 20;
  currentPage = signal(1);

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

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredClients().length / this.pageSize)));

  displayedClients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredClients().slice(start, start + this.pageSize);
  });

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients().subscribe({
      next: (data) => { this.allClients.set(data); this.loading.set(false); },
      error: (err) => { this.error.set('Erreur lors du chargement des clients'); this.loading.set(false); console.error(err); }
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  previousPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

  deleteClient(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error(err)
      });
    }
  }
}