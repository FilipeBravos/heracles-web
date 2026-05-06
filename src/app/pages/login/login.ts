import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'; // Adicione Router
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  erroLogin = false;

 fazerLogin() {
    if (this.loginForm.valid) {
      this.http.post<any>('http://localhost:8080/api/auth/login', this.loginForm.value)
        .subscribe({
          next: (resposta) => {
            // Ajuste o nome da propriedade aqui para tokenJWT
            const token = resposta.tokenJWT || resposta.token; 
            
            if (token) {
              localStorage.setItem('heracles_token', token);
              console.log('Token salvo! Navegando...');
              this.router.navigate(['/dashboard/alunos']);
            } else {
              console.error('O backend não enviou o token com o nome esperado.');
            }
          },
          error: (err) => {
            console.error('Erro na requisição:', err);
            this.erroLogin = true;
          }
        });
    }
  } 
}