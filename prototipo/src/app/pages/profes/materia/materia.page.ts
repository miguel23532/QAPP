import { Component, OnInit,ViewChild } from '@angular/core';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';

class Horario{
  dia: string;
  hora: string;
}

class clase{
  nrc: string;
  horarios: Array<Horario>;
  nombreProfe: string;
  codigoProfe: string;
}

@Component({
  selector: 'app-materia',
  templateUrl: './materia.page.html',
  styleUrls: ['./materia.page.scss'],
})

export class MateriaPage implements OnInit {
  nombreUsuario:string;
  materia: string;
  claveMateria:string;
  clases: Array<clase>;

  constructor(private servicio: ApiserviceService,private route: Router, public menuCtrl: MenuController,private socket: Socket) { 
    this.materia = "";
    this.claveMateria = "";
    this.nombreUsuario = ""; 
    this.clases = [];
  }

  ngOnInit() {
    
    
  } 

  ionViewWillEnter(){
    this.asignarMateria();
    this.asignarNombre();
    this.asignarClases(); 
  }

  asignarMateria(){
    let nombreMateria = "";
    let claveMateria = "";
    nombreMateria = this.servicio.getNombreMateria().toString();
    claveMateria = this.servicio.getClaveMateria().toString();

    //prueba
    //nombreMateria = "SEMINARIO DE SOLUCION DE PROBLEMAS DE USO, ADAPTACION, EXPLOTACION DE SISTEMAS OPERATIVOS";
   // claveMateria = "I5904";
    //borrar o comentar

    nombreMateria = nombreMateria[0] + nombreMateria.slice(1).toLowerCase()
    this.materia = nombreMateria;
    this.claveMateria = claveMateria;

    

    console.log(this.materia+" "+this.claveMateria);
  }

  asignarNombre(){
    document.getElementById("nombreUsuarioMateria").textContent = this.servicio.getNombre();
    document.getElementById("nombreUsuarioMenuMateria").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuMateria").innerText = "codigo: "+this.servicio.getCodigo();
  }

  asignarClases(){
    this.servicio.obtenerClases(this.claveMateria);
    this.socket.once(this.servicio.getCodigo()+this.claveMateria,(response)=>{
      let datos = JSON.parse(response);
      console.log(response);
      console.log(datos);
      

      let i = 0;  
      while (datos[i] != undefined){let nrc = datos[i]['nrc'];
        let horario = datos[i]['horario'];
        let nombreProfe = datos[i]['nombre'];
        let codigoProfe = datos[i]['codigo'];
        let indexHorario = 0;
        let horarios = [];
        
        
        var arrayHorario = JSON.parse(horario);//Datos del horario separados
        
        while(arrayHorario.length>indexHorario){
         
          let dia = arrayHorario[indexHorario][1];
          let hora = arrayHorario[indexHorario][0];
          let horario = new Horario();
          horario.hora = hora;

          if(dia=="L"){
            horario.dia = "Lunes\n";
          }else if(dia=="M"){
            horario.dia = "Martes\n";
          }else if(dia=="I"){
            horario.dia = "Miercoles\n";
          }else if(dia=="J"){
            horario.dia = "Jueves\n";
          }else if(dia=="V"){
            horario.dia = "Viernes\n";
          }else if(dia=="S"){
            horario.dia = "Sabado\n";
          }
          
          horarios.push(horario);//Anadir la info de las clases en las fichas del mapa
          indexHorario-=-1;
        }
        let c = new clase();

        c.nombreProfe = nombreProfe;
        c.nrc = "NRC: "+nrc;
        c.horarios = horarios;
        c.codigoProfe = codigoProfe;
        this.clases.push(c);
        i++;
      }
    /*this.servicio.obtenerClases(this.claveMateria).subscribe((datos)=>{
      let i = 0;  
      while (datos[i] != undefined){let nrc = datos[i]['nrc'];
        let horario = datos[i]['horario'];
        let nombreProfe = datos[i]['nombre'];
        let codigoProfe = datos[i]['codigo'];
        let indexHorario = 0;
        let horarios = [];
        
        var arrayHorario = JSON.parse(horario);//Datos del horario separados
        
        while(arrayHorario.length>indexHorario){
         
          let dia = arrayHorario[indexHorario][1];
          let hora = arrayHorario[indexHorario][0];
          let horario = new Horario();
          horario.hora = hora;

          if(dia=="L"){
            horario.dia = "Lunes\n";
          }else if(dia=="M"){
            horario.dia = "Martes\n";
          }else if(dia=="I"){
            horario.dia = "Miercoles\n";
          }else if(dia=="J"){
            horario.dia = "Jueves\n";
          }else if(dia=="V"){
            horario.dia = "Viernes\n";
          }else if(dia=="S"){
            horario.dia = "Sabado\n";
          }
          
          horarios.push(horario);//Anadir la info de las clases en las fichas del mapa
          indexHorario-=-1;
        }
        let c = new clase();

        c.nombreProfe = nombreProfe;
        c.nrc = "NRC: "+nrc;
        c.horarios = horarios;
        c.codigoProfe = codigoProfe;
        this.clases.push(c);
        i++;
      }
    })*/
    })
  }
  
  irProfe(index){ 
    
    let codigo = this.clases[index].codigoProfe;
    let nombre = this.clases[index].nombreProfe;

    this.servicio.limpiarProfe();

    this.servicio.setCodigoProfe(codigo);
    this.servicio.setNombreProfe(nombre);

    this.route.navigate(['/informacion'], { replaceUrl: true }); 
    
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
