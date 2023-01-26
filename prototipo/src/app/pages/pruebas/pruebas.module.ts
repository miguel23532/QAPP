import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PruebasPageRoutingModule } from './pruebas-routing.module';

import { PruebasPage } from './pruebas.page';

//import { Geolocation } from '@ionic-native/geolocation/ngx';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PruebasPageRoutingModule,
  ],
  declarations: [PruebasPage],
  providers: [
    Geolocation,
  ]
})
export class PruebasPageModule {}
