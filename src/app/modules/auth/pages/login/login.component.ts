import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importante: Importar ReactiveFormsModule para usar formularios reactivos
  // y RouterModule para los enlaces como "Regístrate aquí"
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  // Definición del formulario reactivo con validaciones
  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  // Getter para acceder fácilmente a los controles del formulario en el HTML
  get f() { return this.loginForm.controls; }

  onSubmit() {
    // 1. Verificar si el formulario es válido
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca los campos para mostrar errores
      return;
    }

    // 2. Preparar los datos
    this.isLoading = true;
    this.errorMessage = '';
    const credentials: LoginRequest = this.loginForm.value as LoginRequest;

    // 3. Llamar al servicio
    this.authService.login(credentials).subscribe({
      next: () => {
        console.log('Login exitoso');
        this.errorMessage = 'Login exitoso';
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente.',
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        }).then(() => {
          // this.router.navigate(['/dashboard']);
          console.log('Redirigiendo...');
        });
      },
      error: (err) => {
        console.error('Error en login', err);
        this.isLoading = false;
        let message = 'Ha ocurrido un error inesperado. Inténtalo más tarde.';
        if (err.status === 401 || err.status === 403) {
          message = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de acceso',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33',
          heightAuto: false
        });
      },
      complete: () => {
         if (this.isLoading) this.isLoading = false;
      }
    });
  }
}