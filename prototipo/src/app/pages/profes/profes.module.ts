import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfesPageRoutingModule } from './profes-routing.module';

import { ProfesPage } from './profes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfesPageRoutingModule
  ],
  declarations: [ProfesPage]
})
export class ProfesPageModule {}
