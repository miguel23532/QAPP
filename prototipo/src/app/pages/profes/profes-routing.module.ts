import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfesPage } from './profes.page';

const routes: Routes = [
  {
    path: '',
    component: ProfesPage
  },
  {
    path: 'materia',
    loadChildren: () => import('./materia/materia.module').then( m => m.MateriaPageModule)
  },
  {
    path: 'informacion',
    loadChildren: () => import('./informacion/informacion.module').then( m => m.InformacionPageModule)
  },
  {
    path: 'evaluar',
    loadChildren: () => import('./evaluar/evaluar.module').then( m => m.EvaluarPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfesPageRoutingModule {}
