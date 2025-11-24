// Lo que envías al servidor para hacer login (esto se mantiene igual)
export interface LoginRequest {
    username: string;
    password: string;
  }

  // ... (Mantén el código existente: AuthData, ApiResponse, LoginRequest, LoginResponse) ...

// Definimos los tipos posibles de género para usar en el select
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: GenderType;
  identifier: string; // DNI, NIE, Pasaporte, etc.
  phone: string;
}

export type RegisterResponse = LoginResponse;
  
  // Estructura interna de los datos del usuario y token
  export interface AuthData {
    token: string;
    refreshToken: string;
    type: string; // ej. "Bearer"
    issuedAt: string;
    expiresAt: string;
    userId: number; // Ojo: en tu JSON es un número, no un string
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }
  
  // La respuesta completa envolvente de la API
  // Usamos un genérico <T> para poder reutilizar esta estructura si otras respuestas son similares
  export interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T; // Aquí dentro irá el objeto AuthData
  }
  
  // Alias específico para la respuesta de Login
  export type LoginResponse = ApiResponse<AuthData>;