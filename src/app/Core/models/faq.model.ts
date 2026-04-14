import { UsuarioRef } from './usuarioref.model';
import { Resposta } from './resposta.model';


export interface Faq {
  _id?: string;
  user: string | UsuarioRef;
  pregunta: string;
  respuestas: string[] | Resposta[];
  IsDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
