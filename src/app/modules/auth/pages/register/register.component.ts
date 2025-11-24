import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GenderType, RegisterRequest } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  // Opciones para el select de género
  genderOptions: { value: GenderType, label: string }[] = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'OTHER', label: 'Otro' }
  ];

  // Definición del formulario con validaciones para todos los campos
  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    // Contraseña más robusta: mín 8 caracteres
    password: ['', [Validators.required, Validators.minLength(8)]],
    gender: ['MALE' as GenderType, [Validators.required]], // Valor por defecto
    identifier: ['', [Validators.required]],
    // Validación simple para teléfono (solo números y símbolo +)
    phone: ['', [Validators.required, Validators.pattern('^[0-9+]+$')]]
  });

  // Getter para acceder fácilmente a los controles en el HTML
  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Casteamos los valores del formulario a la interfaz RegisterRequest
    const requestData: RegisterRequest = this.registerForm.value as unknown as RegisterRequest;

    this.authService.register(requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
           console.log('Registro exitoso');
           // Si hubo autologin, redirigimos al dashboard.
           // Si tu API requiere verificar email primero, redirige a una página de "Revisa tu correo".
           this.router.navigate(['/dashboard']); // Ajusta esta ruta según tu app
        }
      },
      error: (err) => {
        console.error('Error en registro', err);
        this.isLoading = false;
        // Manejo básico de errores. Tu API podría devolver detalles sobre qué campo falló.
        if (err.status === 409) {
           this.errorMessage = 'El correo electrónico ya está registrado.';
        } else if (err.status === 400) {
           this.errorMessage = 'Datos inválidos. Por favor revisa el formulario.';
        } else {
           this.errorMessage = 'Ha ocurrido un error en el registro. Inténtalo más tarde.';
        }
      }
    });
  }
}