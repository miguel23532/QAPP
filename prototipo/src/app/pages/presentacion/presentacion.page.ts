import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({

  
  selector: 'app-presentacion',
  templateUrl: './presentacion.page.html',
  styleUrls: ['./presentacion.page.scss'],
  //slides template
  /*template: `
    <ion-content>
      <h1 class="ion-text-center">HOLA</h1>
      <!--- " --->
      <ion-slides pager="true" [options]="slideOpts" (ionSlideReachEnd)="Ultima_diapositiva()">
        <ion-slide>
          <h1>Conoces?</h1>
        </ion-slide>

        <ion-slide>
          <h1>A nuestro</h1>
        </ion-slide>

        <ion-slide>
          <h1>Señor jesus?</h1>
          <ion-img name="image" src="assets/icon/biblia.jpg"></ion-img>
        </ion-slide>
        
      </ion-slides>

      <!--- button ir a home --->
      <div class="ion-text-center">
        <ion-button disabled={{!bandera_palanca}} shape="round" fill="outline" href="menu">IR A HOME</ion-button>
      </div>
      
      

      <!--- Palanca ---
      <--- [(ngModel)] es el nombre de la señal---
      <ion-list>
        <ion-item>
          <ion-label>Pepperoni</ion-label>
          <ion-toggle [(ngModel)]="pepperoni"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label>Sausage</ion-label>
          <ion-toggle [(ngModel)]="sausage"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label>Mushrooms</ion-label>
          <ion-toggle [(ngModel)]="mushrooms"></ion-toggle>
        </ion-item>

      </ion-list>
      
      <--- medalla /notificacion ---
      <ion-badge color="primary">11</ion-badge>

      <--- etiqueta ---
      <ion-chip [disabled]="false">
        <ion-label>Default</ion-label>
      </ion-chip>
      
      <--- boton de check ---
      <ion-checkbox color="primary" [(ngModel)]="checkcaja"></ion-checkbox>
      
      <--- Salto de linea ---
      <br>
      
      <ion-progress-bar color = "secondary" value = "0.55" buffer="0.5"></ion-progress-bar>

      <--- selector de hora ---
      <--- <ion-datetime presentation="time"></ion-datetime> ---
      
      
      
      <--- calendario ---
      
      <ion-datetime #calendarioChido (ionChange)="cambioFecha( calendarioChido.value )" ></ion-datetime>
      <div class="ion-text-center">hora: {{fechaSelect}}</div>
      <--->
      
    </ion-content>

    
  `*/
})
export class PresentacionPage implements OnInit {
  

  constructor(private route: Router, private so: ScreenOrientation) { }

  nextpage(page) {
    this.route.navigate(['/'+page+'']);
  }

  ngOnInit() {
  }
  ionViewDidEnter() {
    this.so.lock(this.so.ORIENTATIONS.PORTRAIT);
  }
   

}

//clase para el slide
export class Slide {
  // Optional parameters to pass to the swiper instance.
  // See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {
    initialSlide: 1,
    speed: 400,
  };
  constructor() {}
}

