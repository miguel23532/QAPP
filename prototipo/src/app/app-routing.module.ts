import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';




const routes: Routes = [
  //presentación de la app
  {
    path: 'presentacion',
    loadChildren: () => import('./pages/presentacion/presentacion.module').then( m => m.PresentacionPageModule)
  },

  {
    path: '',

    //Redirecciona a la pagina 
    redirectTo: 'presentacion',
    pathMatch: 'full'
  },

  //menu de las caracteristicas de la aplicación
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then( m => m.MenuPageModule)
  },
  //mapa de clases
  {
    path: 'mapa',
    loadChildren: () => import('./pages/mapa/mapa.module').then( m => m.MapaPageModule)
  },
  {
    path: 'pruebas',
    loadChildren: () => import('./pages/pruebas/pruebas.module').then( m => m.PruebasPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/login/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'horario',
    loadChildren: () => import('./pages/horario/horario.module').then( m => m.HorarioPageModule)
  },
  {
    path: 'profes',
    loadChildren: () => import('./pages/profes/profes.module').then( m => m.ProfesPageModule)
  },
  {
    path: 'materia',
    loadChildren: () => import('./pages/profes/materia/materia.module').then( m => m.MateriaPageModule)
  },
  {
    path: 'informacion',
    loadChildren: () => import('./pages/profes/informacion/informacion.module').then( m => m.InformacionPageModule)
  },
  {
    path: 'evaluar',
    loadChildren: () => import('./pages/profes/evaluar/evaluar.module').then( m => m.EvaluarPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/menu/chat/chat.module').then( m => m.ChatPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
