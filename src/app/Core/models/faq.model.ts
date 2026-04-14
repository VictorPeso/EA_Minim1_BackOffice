import { Resposta } from "./resposta.model";

export interface Faq {
  user: string;
  pregunta: string;
  respuestas: Resposta[];
  IsDeleted?: boolean;
}
