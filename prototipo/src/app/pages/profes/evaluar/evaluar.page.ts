import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';

class Evaluacion{
  codigoEstudiante:string;
  codigoProfe:string;

  flexibilidad:string;
  puntualidad:string;
  recomendado:string;
  facilidad:string;
  interes:string; 
}

@Component({
  selector: 'app-evaluar',
  templateUrl: './evaluar.page.html',
  styleUrls: ['./evaluar.page.scss'],
})

export class EvaluarPage implements OnInit {
  nombreUsuario:string;
  nombreProfe:string;
  codigoProfe:string;

  constructor(private servicio: ApiserviceService,private route: Router, public alertController: AlertController, public menuCtrl: MenuController,private socket: Socket) { }

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    this.codigoProfe = this.servicio.getCodigoProfe().toString();
    this.nombreProfe = this.servicio.getNombreProfe().toString();
    this.asignarNombre();
    this.asignarDatosProfe();

    this.obtenerEvaluacionAnterior();
  }

  obtenerEvaluacionAnterior(){
    console.log(this.servicio.getCodigo()+" codigo profe: "+ this.codigoProfe);
    
    this.servicio.obtenerEvaluacionProfe(this.servicio.getCodigo(),this.codigoProfe);
    this.socket.once(this.servicio.getCodigo(), (respuesta) => {
      if(respuesta){
        console.log("obtenerEvaluacionAnt");
        (<HTMLIonRangeElement>document.getElementById("flexibilidadEvaluar")).value = respuesta[0]["flexibilidad"];
        (<HTMLIonRangeElement>document.getElementById("puntualidadEvaluar")).value = respuesta[0]["puntualidad"];
        (<HTMLIonRangeElement>document.getElementById("recomendadoEvaluar")).value = respuesta[0]["recomendado"];
        (<HTMLIonRangeElement>document.getElementById("facilidadEvaluar")).value = respuesta[0]["facilidad"];
        (<HTMLIonRangeElement>document.getElementById("interesEvaluar")).value = respuesta[0]["interes"];
      }
    });
  }

  cambioValor(event){
    console.log("hola");
    console.log(event);
    console.log(event.value);
  }

  evaluarProfe(){  
    var e = new Evaluacion;
    e.codigoEstudiante = this.servicio.getCodigo();
    e.codigoProfe = this.codigoProfe;

    e.flexibilidad = (<HTMLIonRangeElement>document.getElementById("flexibilidadEvaluar")).value.toString();
    e.puntualidad = (<HTMLIonRangeElement>document.getElementById("puntualidadEvaluar")).value.toString();
    e.recomendado = (<HTMLIonRangeElement>document.getElementById("recomendadoEvaluar")).value.toString();
    e.facilidad = (<HTMLIonRangeElement>document.getElementById("facilidadEvaluar")).value.toString();
    e.interes = (<HTMLIonRangeElement>document.getElementById("interesEvaluar")).value.toString();

    this.servicio.evaluarProfe(e);
    this.socket.once(this.servicio.getCodigo(), (respuesta) => {
      if(respuesta = 0){
        console.log("Hubo un problema al subir la evaluacion");        
      }else{
        
        this.evaluacionEnviada();
        
        this.route.navigate(['/informacion'], { replaceUrl: true });
      }
    })
  }

  async evaluacionEnviada() {
    const alert = await this.alertController.create({
      header: '¡Exito!',
      message: '¡Se ha enviado la evaluacion!',
      buttons: ['OK']
      
    });

    await alert.present();
  }

  asignarNombre(){
    document.getElementById("nombreUsuarioEvaluar").textContent = this.servicio.getNombre();
    document.getElementById("nombreUsuarioMenuEvaluar").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuEvaluar").innerText = "codigo: "+this.servicio.getCodigo();
    console.log(this.servicio.getNombre());
  }

  asignarDatosProfe(){
    document.getElementById("nombreProfeEvaluar").textContent = this.nombreProfe;
    console.log(this.servicio.getNombre());
  }

  openMenu(){
    this.menuCtrl.isEnabled().then(response2 => {
      if (!response2){
        this.menuCtrl.enable(true);
      }
      this.menuCtrl.toggle();
    })  
  }

  //sideMenu

  cerrar(){
    this.servicio.limpiarTodo();
    this.route.navigate(['/login'], { replaceUrl: true });
  }

  menu(){
    this.route.navigate(['/menu'], { replaceUrl: true });
  }

  //sideMenu ends
}