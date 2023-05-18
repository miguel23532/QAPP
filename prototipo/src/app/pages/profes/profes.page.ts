import { Component, OnInit, ViewChild, NgZone } from '@angular/core';

//import del service
import { ApiserviceService } from './../../servicios/apiservice.service';

import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { Keyboard } from '@capacitor/keyboard';


class resultado{
  
  text: string;
  value: string;

}


@Component({
  selector: 'app-profes',
  templateUrl: './profes.page.html',
  styleUrls: ['./profes.page.scss'],
})


export class ProfesPage implements OnInit {
  nombreUsuario:string;
  resultados = [];
  materias = [];
  profes = [];
  busqueda: string;
  

  constructor(private servicio: ApiserviceService, private ngZone: NgZone, private route: Router, public menuCtrl: MenuController,private socket: Socket) { }

  ionViewDidEnter() {}
  ngOnInit() {

    console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    this.asignarNombre();
    
    this.servicio.getProfes();
    this.socket.once(this.servicio.getCodigo()+"getProfes",(respuesta) => {
      respuesta = JSON.parse(respuesta);
      var i = 0;
      
      while(respuesta[i] != undefined){
        var r = new resultado();
        //console.log(respuesta[i]);
        
        
        r.value = respuesta[i]['codigo'].toString();
        r.text = respuesta[i]['nombre'].toString();

        this.profes.push(r);
        i++;
      }

      
      this.servicio.getMaterias();
      this.socket.once(this.servicio.getCodigo()+"Materias", (respuesta2) => {
        var i = 0;
        respuesta2 = JSON.parse(respuesta2);
        while(respuesta2[i] != undefined){
          var r = new resultado();
          //console.log(respuesta2[i]);
          r.value = respuesta2[i]['clave'].toString();
          r.text = respuesta2[i]['nombre'].toString();
  
          this.materias.push(r);
          i++;
        }

        console.log("HERE2 xd");
        console.log(this.profes);
        console.log(this.materias);
      });
    });
    
    

   
  }

  asignarNombre(){
    document.getElementById("nombreUsuarioProfes").textContent = this.servicio.getNombre();
    document.getElementById("nombreUsuarioMenuProfes").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuProfes").innerText = "codigo: "+this.servicio.getCodigo();
  }

  mostrarTeclado(){
    Keyboard.show()
  }
  
  BuscarMateriaProfe(datos){//Busca la opcion seleccionada   
    

    let regex = new RegExp(/^[a-z]$/);
    console.log(regex.test(datos.value[0].toLowerCase()));
    console.log(datos.value[0]);
    console.log(datos);
    
    
     
    if(regex.test(datos.value[0].toLowerCase())){
      this.servicio.setClaveMateria(datos.value);
      this.servicio.setNombreMateria(datos.text);
      this.route.navigate(['/materia'], { replaceUrl: true }); 
    }else{
      this.servicio.setCodigoProfe(datos.value);
      this.servicio.setNombreProfe(datos.text);
      this.route.navigate(['/informacion']), { replaceUrl: true }; 
    }
  }   

  mostrarResultados(){//muestra los resultados de la busqueda
    
    this.resultados = [];

    if(this.busqueda){

      this.materias.forEach(materia => {

        var texto = (materia.text + " " + materia.value).toLowerCase()
        
        if(texto.includes(this.busqueda.toLowerCase())){
          this.resultados.push(materia);
        }
      });

      this.profes.forEach(profe => {

        var texto = (profe.text + " " + profe.value).toLowerCase()
        
        if(texto.includes(this.busqueda.toLowerCase())){
          this.resultados.push(profe);
        }
      });
    }

    console.log("HERE");
    console.log(this.profes);
    console.log(this.materias);
    console.log(this.resultados);

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
