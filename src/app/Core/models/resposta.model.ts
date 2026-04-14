import { UsuarioRef } from './usuarioref.model';

export interface Resposta {
  _id?: string;
  user: string | UsuarioRef;
  respuesta: string;
  IsDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
