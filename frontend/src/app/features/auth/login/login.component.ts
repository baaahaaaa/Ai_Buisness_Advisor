import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      username: this.form.value.username!,
      password: this.form.value.password!
    };

    this.authService.login(credentials).subscribe({

      next: () => {

        this.loading.set(false);

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.error(err);

        this.loading.set(false);

        this.errorMessage.set(
          'Identifiants incorrects. Veuillez réessayer.'
        );

      }

    });

  }

}