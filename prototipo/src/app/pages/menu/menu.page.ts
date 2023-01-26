import { Component, OnInit  } from '@angular/core';
import { ApiserviceService } from './../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})

export class MenuPage implements OnInit {
  nombreUsuario:string;
  constructor(private route: Router, private servicio: ApiserviceService,private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      
    });
  }
 
  ngOnInit() {
    
    this.asignarNombre();
  }

  

  asignarNombre(){
    document.getElementById("nombreUsuario").textContent = this.servicio.getNombre();
    //document.getElementById("nombreUsuarioMenu").innerText = this.servicio.getNombre();
    //document.getElementById("codigoUsuarioMenu").innerText = "codigo: "+this.servicio.getCodigo();
    
    this.nombreUsuario = this.servicio.getNombre();
    console.log(this.servicio.getNombre());
  }

  mapa(){
    this.route.navigate(['/mapa']);
  }

  horario(){
    this.route.navigate(['/horario']);
  }

  profes(){
    this.route.navigate(['/profes']);
  }

  //sideMenu

  cerrar(){
    this.servicio.limpiarTodo();
    this.route.navigate(['/login']);
  }

  menu(){
    this.route.navigate(['/menu']);
  }

  chat(){
    this.route.navigate(['/chat']);
  }

  //sideMenu ends

}
