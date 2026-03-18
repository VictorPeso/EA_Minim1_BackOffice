import { Routes } from '@angular/router';
import { OrganizacionList } from './organizacion-list/organizacion-list';
import { UsuarioList } from './usuario-list/usuario-list';
import { LibreriaList } from './libreria-list/libreria-list';
import { LibroList } from './libro-list/libro-list';

export const routes: Routes = [
  { path: '', component: OrganizacionList },
  { path: 'usuarios', component: UsuarioList },
  { path: 'librerias', component: LibreriaList },
  { path: 'libros', component: LibroList }
];