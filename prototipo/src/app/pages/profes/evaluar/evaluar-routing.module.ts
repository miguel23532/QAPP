import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EvaluarPage } from './evaluar.page';

const routes: Routes = [
  {
    path: '',
    component: EvaluarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluarPageRoutingModule {}
