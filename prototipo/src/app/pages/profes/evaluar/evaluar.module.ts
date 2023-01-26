import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EvaluarPageRoutingModule } from './evaluar-routing.module';

import { EvaluarPage } from './evaluar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EvaluarPageRoutingModule
  ],
  declarations: [EvaluarPage]
})
export class EvaluarPageModule {}
