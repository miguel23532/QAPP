import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//import google maps
import { GoogleMapComponent } from './google-map/google-map.component';

import { HttpClientModule } from '@angular/common/http';

//import { ReactiveFormsModule } from '@angular/forms';

// home.module.ts
import { SwiperModule } from 'swiper/angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
//const config: SocketIoConfig = { url: 'http://localhost:3001', options: {} };
const config: SocketIoConfig = { url: 'http://187.201.148.222:3001', options: {} };

@NgModule({
    declarations: [AppComponent, GoogleMapComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, SwiperModule, SocketIoModule.forRoot(config), /*ReactiveFormsModule*/],
    providers: [ScreenOrientation, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy, }],
    bootstrap: [AppComponent]
})
export class AppModule {} 
