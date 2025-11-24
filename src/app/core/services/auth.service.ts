import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
// Importamos las nuevas interfaces
import { LoginRequest, LoginResponse, AuthData, RegisterResponse, RegisterRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`; // Asegúrate que esto apunte a tu backend

  // CAMBIO 1: La señal ahora guarda el objeto AuthData completo (usuario + tokens) o null
  currentUserSignal = signal<AuthData | null>(null);

  constructor() {
    this.checkLocalStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // El tipo de retorno Observable<LoginResponse> ya es correcto con los nuevos modelos
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
            // CAMBIO 2: Verificamos si la respuesta fue exitosa antes de procesar
            if (response.success && response.data) {
                this.handleLoginSuccess(response.data);
            }
        })
      );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
            if (response.success && response.data) {
                this.handleLoginSuccess(response.data);
            }
        })
      );
  }

  logout() {
    // CAMBIO 3: Limpiamos la clave única que usaremos ahora
    localStorage.removeItem('auth_session');
    this.currentUserSignal.set(null);
    // TODO: Aquí deberías inyectar el Router y redirigir al login:
    // this.router.navigate(['/auth/login']);
  }

  private handleLoginSuccess(authData: AuthData) {
    // CAMBIO 4: Guardamos TODO el objeto de datos en una sola entrada del localStorage.
    // Es más fácil de manejar que guardar token y usuario por separado.
    localStorage.setItem('auth_session', JSON.stringify(authData));

    // Actualizamos la señal
    this.currentUserSignal.set(authData);
  }

  private checkLocalStorage() {
    // CAMBIO 5: Leemos de la nueva clave única
    const sessionDataStr = localStorage.getItem('auth_session');
    if (sessionDataStr) {
      try {
        const authData: AuthData = JSON.parse(sessionDataStr);
        // Verificación básica de que los datos tienen sentido
        if (authData.token && authData.email) {
            this.currentUserSignal.set(authData);
        } else {
            this.logout(); // Datos corruptos
        }
      } catch (e) {
        console.error('Error al leer la sesión del local storage', e);
        this.logout();
      }
    }
  }

  // Helpers útiles
  isLoggedIn(): boolean {
    return this.currentUserSignal() !== null;
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }
  
  getUserRoles(): string[] {
      return this.currentUserSignal()?.roles || [];
  }
}