import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from './../../servicios/apiservice.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';


class Horario{
  dia: string;
  horaInicio: string;
  horaTermino: string;
}

class Clase{
  nrc: string;
  horarios: Array<Horario>;
  nombreProfe: string;
  codigoProfe: string;
  isDisabled: boolean;
  isSelected: boolean = false;
}

class Materia{
  nombre:string;
  clave:string;
  clases: Array<Clase>
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})

export class HorarioPage implements OnInit {
  materias: Array<Materia>;
  busquedaMaterias: Array<Materia>;
  busquedaHorario: string;
  agregandoMateria: boolean;
  listaNrc: string;

  constructor(private route: Router, private servicio: ApiserviceService,public alertController: AlertController, private loadingCtrl: LoadingController,private socket: Socket) {
    this.materias = []; 
    this.busquedaMaterias = [];
    this.busquedaHorario = "";
    this.agregandoMateria = false;
    this.listaNrc = "";
  }

  ngOnInit(){   

  }

  ionViewWillEnter() {
    this.materias = [];
    this.asignarNombre();
    this.inicializar();
  }  

  async inicializar(){
    this.iniciarCarga("Cargando",3500);
    await this.inicializarBusqueda();//getMaterias()
    await this.delay(2000);
    await this.inicializarHorarioCuadricula();
    await this.delay(1000);
    await this.comprobarClases();

  }

  
  async inicializarHorarioCuadricula(){
    this.colorearCuadricula("#ffffff","0700","2100","L");
    this.colorearCuadricula("#ffffff","0700","2100","M");
    this.colorearCuadricula("#ffffff","0700","2100","I");
    this.colorearCuadricula("#ffffff","0700","2100","J");
    this.colorearCuadricula("#ffffff","0700","2100","V");
    this.colorearCuadricula("#ffffff","0700","2100","S");

    // obtener horario anterior
    this.servicio.getHorarioAlumno(this.servicio.getCodigo());
    this.socket.once(this.servicio.getCodigo(),async (response) => {
      let datos = JSON.parse(response);
      
      var i = 0;     
      let horarioAnteriorClaves=[];
      let horarioAnteriorNrc=[];
      while(datos[i] != undefined){
        horarioAnteriorClaves.push([datos[i]["clave_materia"]]);
        horarioAnteriorNrc.push([datos[i]["nrc_clase"]]);

        //console.log([datos[i]["clave_materia"]]);
        //console.log([datos[i]["nrc_clase"]]);
        i++;
        
      }

      console.log("horarioAnteriorClaves" + horarioAnteriorClaves);

      console.log("horarioAnteriorNrc" + horarioAnteriorNrc);

      console.log("tamaño busqueda:"+this.busquedaMaterias.length);

      console.log(this.busquedaMaterias);
      

      for (let indexM = 0; indexM < this.busquedaMaterias.length; indexM++) {
        console.log("buscando en materia : "+indexM);
        
        const materia = this.busquedaMaterias[indexM];

        for (let indexH = 0; indexH < horarioAnteriorClaves.length; indexH++) {
          console.log("buscando en clase : "+indexH);
          const clave = horarioAnteriorClaves[indexH];
          
          if(clave==materia.clave){

            //guardar los datos
            this.servicio.obtenerClases(materia.clave);
            this.socket.once(this.servicio.getCodigo()+materia.clave,(response) => {
              let datos = JSON.parse(response);

              
              
              //crear nueva materia con clases y horarios
              var materiaAgregar = new Materia();
              materiaAgregar.nombre = materia.nombre;//
              materiaAgregar.clave = materia.clave;//

              var clases = new Array<Clase>();

              let i = 0;  
              while (datos[i] != undefined){
                console.log(datos[i]['nrc']);
                let nrc = datos[i]['nrc'];
                let horario = datos[i]['horario'];
                let nombreProfe = datos[i]['nombre'];
                let indexHorario = 0;
                let horarios = []; 
                var arrayHorario = JSON.parse(horario);//Datos del horario separados
                let selected = false;
                //console.log(arrayHorario);
                for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {//
                  const horarioNrc = horarioAnteriorNrc[indexN];

                  //console.log("comparando " + nrc + " " + horarioNrc);
                  
                  if(nrc == horarioNrc){
                    selected=true;
                    console.log(arrayHorario);
                    console.log("nrc " + nrc);
                    console.log("arrayHorario" + horarioNrc);
                  }
                }
                
                while(arrayHorario.length>indexHorario){
                  let dia = arrayHorario[indexHorario][1];
                  let hora = arrayHorario[indexHorario][0];
                  let horario = new Horario();
                  horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
                  horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
                  horario.dia = dia;   
                  //POR AQUI XD
                  //colorea horario
                  

                  if(selected){   
                    console.log("Colorear: "+horario.horaInicio+ " " +horario.horaTermino+ " " +horario.dia);
                            
                    this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
                  }

                  horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
                  indexHorario-=-1;
                }             

                let c = new Clase();
                c.nombreProfe = nombreProfe.replaceAll(/,/g, "\n");
                c.nrc = "NRC: "+nrc;
                c.horarios = horarios;
                c.isDisabled = false;
                c.isSelected = selected;
                
                if(c.isSelected){
                  console.log("clase guardada: " + c.nrc);
                }
                
                
                clases.push(c);
                i++;
              }

              console.log(clases);
              

              materiaAgregar.clases = clases;

              this.materias.push(materiaAgregar);
              
            });

            

            /*
            this.servicio.obtenerClases(materia.clave).subscribe((datos) => {

              //crear nueva materia con clases y horarios
              var materiaAgregar = new Materia();
              materiaAgregar.nombre = materia.nombre;
              materiaAgregar.clave = materia.clave;

              var clases = new Array<Clase>();

              let i = 0;  
              while (datos[i] != undefined){
                let nrc = datos[i]['nrc'];
                let horario = datos[i]['horario'];
                let nombreProfe = datos[i]['nombre'];
                let indexHorario = 0;
                let horarios = [];
                var arrayHorario = JSON.parse(horario);//Datos del horario separados
                let selected = false;

                for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {
                  const horarioNrc = horarioAnteriorNrc[indexN];
 
                  if(nrc == horarioNrc){
                    selected=true;
                  }
                  
                }
                
                  while(arrayHorario.length>indexHorario){
                    let dia = arrayHorario[indexHorario][1];
                    let hora = arrayHorario[indexHorario][0];
                    let horario = new Horario();
                    horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
                    horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
                    horario.dia = dia;   

                    //colorea horario
                    if(selected){
                      
                      this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
                    }

                    horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
                    indexHorario-=-1;
                  }

                  

                let c = new Clase();
                c.nombreProfe = nombreProfe;
                c.nrc = "NRC: "+nrc;
                c.horarios = horarios;
                c.isDisabled = false;
                c.isSelected = selected;
                

                clases.push(c);
                i++;
              }

              materiaAgregar.clases = clases;

              this.materias.push(materiaAgregar);

              
              
            });
            */
          }
        }
        
      }

      //console.log("tamaño materias: "+ this.materias.length);
      //console.log("tamaño horarioAnterior: "+ horarioAnteriorClaves.length);

    });

    /*this.servicio.getHorarioAlumno(this.servicio.getCodigo()).subscribe((datos) => {
      console.log("cargando horario:");
      
      var i = 0;     
      let horarioAnteriorClaves=[];
      let horarioAnteriorNrc=[];
      while(datos[i] != undefined){
        horarioAnteriorClaves.push([datos[i]["clave_materia"]]);
        horarioAnteriorNrc.push([datos[i]["nrc_clase"]]);

        console.log([datos[i]["clave_materia"]]);
        console.log([datos[i]["nrc_clase"]]);
        i++;
        
      }

      console.log("tamaño busqueda:"+this.busquedaMaterias.length);
      

      for (let indexM = 0; indexM < this.busquedaMaterias.length; indexM++) {
        console.log("indexM: "+indexM);
        
        const materia = this.busquedaMaterias[indexM];

        for (let indexH = 0; indexH < horarioAnteriorClaves.length; indexH++) {
          const clave = horarioAnteriorClaves[indexH];
          
          if(clave==materia.clave){

            this.servicio.obtenerClases(materia.clave).subscribe((datos) => {

              //crear nueva materia con clases y horarios
              var materiaAgregar = new Materia();
              materiaAgregar.nombre = materia.nombre;
              materiaAgregar.clave = materia.clave;

              var clases = new Array<Clase>();

              let i = 0;  
              while (datos[i] != undefined){
                let nrc = datos[i]['nrc'];
                let horario = datos[i]['horario'];
                let nombreProfe = datos[i]['nombre'];
                let indexHorario = 0;
                let horarios = [];
                var arrayHorario = JSON.parse(horario);//Datos del horario separados
                let selected = false;

                for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {
                  const horarioNrc = horarioAnteriorNrc[indexN];
 
                  if(nrc == horarioNrc){
                    selected=true;
                  }
                  
                }
                
                  while(arrayHorario.length>indexHorario){
                    let dia = arrayHorario[indexHorario][1];
                    let hora = arrayHorario[indexHorario][0];
                    let horario = new Horario();
                    horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
                    horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
                    horario.dia = dia;   

                    //colorea horario
                    if(selected){
                      
                      this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
                    }

                    horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
                    indexHorario-=-1;
                  }

                  

                let c = new Clase();
                c.nombreProfe = nombreProfe;
                c.nrc = "NRC: "+nrc;
                c.horarios = horarios;
                c.isDisabled = false;
                c.isSelected = selected;
                

                clases.push(c);
                i++;
              }

              materiaAgregar.clases = clases;

              this.materias.push(materiaAgregar);

              
              
            });
            
          }
        }
        
      }

      console.log("tamaño materias: "+ this.materias.length);
      console.log("tamaño horarioAnterior: "+ horarioAnteriorClaves.length);

    });*/

    

  }

  /*async inicializarHorarioCuadricula(){
    this.colorearCuadricula("#ffffff","0700","2100","L");
    this.colorearCuadricula("#ffffff","0700","2100","M");
    this.colorearCuadricula("#ffffff","0700","2100","I");
    this.colorearCuadricula("#ffffff","0700","2100","J");
    this.colorearCuadricula("#ffffff","0700","2100","V");
    this.colorearCuadricula("#ffffff","0700","2100","S");

    // obtener horario anterior
    this.servicio.getHorarioAlumno(this.servicio.codigo);
    
    this.socket.once(this.servicio.getCodigo(),(datos)=>{

      this.servicio.obtenerClases(materia.clave).subscribe((datos) => {

        //crear nueva materia con clases y horarios
        var materiaAgregar = new Materia();
        materiaAgregar.nombre = materia.nombre;
        materiaAgregar.clave = materia.clave;

        var clases = new Array<Clase>();

        let i = 0;  
        while (datos[i] != undefined){
          let nrc = datos[i]['nrc'];
          let horario = datos[i]['horario'];
          let nombreProfe = datos[i]['nombre'];
          let indexHorario = 0;
          let horarios = [];
          var arrayHorario = JSON.parse(horario);//Datos del horario separados
          let selected = false;

          for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {
            const horarioNrc = horarioAnteriorNrc[indexN];

            if(nrc == horarioNrc){
              selected=true;
            }
            
          }
          
            while(arrayHorario.length>indexHorario){
              let dia = arrayHorario[indexHorario][1];
              let hora = arrayHorario[indexHorario][0];
              let horario = new Horario();
              horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
              horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
              horario.dia = dia;   

              //colorea horario
              if(selected){
                
                this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
              }

              horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
              indexHorario-=-1;
            }

            

          let c = new Clase();
          c.nombreProfe = nombreProfe;
          c.nrc = "NRC: "+nrc;
          c.horarios = horarios;
          c.isDisabled = false;
          c.isSelected = selected;
          

          clases.push(c);
          i++;
        }

        materiaAgregar.clases = clases;

        this.materias.push(materiaAgregar);
    });

    /*
    this.servicio.getHorarioAlumno(this.servicio.getCodigo()).subscribe((datos) => {
      console.log("cargando horario:");
      
      var i = 0;     
      let horarioAnteriorClaves=[];
      let horarioAnteriorNrc=[];
      while(datos[i] != undefined){
        horarioAnteriorClaves.push([datos[i]["clave_materia"]]);
        horarioAnteriorNrc.push([datos[i]["nrc_clase"]]);

        console.log([datos[i]["clave_materia"]]);
        console.log([datos[i]["nrc_clase"]]);
        i++;
        
      }

      console.log("tamaño busqueda:"+this.busquedaMaterias.length);
      

      for (let indexM = 0; indexM < this.busquedaMaterias.length; indexM++) {
        console.log("indexM: "+indexM);
        
        const materia = this.busquedaMaterias[indexM];

        for (let indexH = 0; indexH < horarioAnteriorClaves.length; indexH++) {
          const clave = horarioAnteriorClaves[indexH];
          
          if(clave==materia.clave){
            this.servicio.obtenerClases(materia.clave);
            this.socket.once(this.servicio.getCodigo(),(datos)=>{
              //crear nueva materia con clases y horarios
              var materiaAgregar = new Materia();
              materiaAgregar.nombre = materia.nombre;
              materiaAgregar.clave = materia.clave;

              var clases = new Array<Clase>();

              let i = 0;  
              while (datos[i] != undefined){
                let nrc = datos[i]['nrc'];
                let horario = datos[i]['horario'];
                let nombreProfe = datos[i]['nombre'];
                let indexHorario = 0;
                let horarios = [];
                var arrayHorario = JSON.parse(horario);//Datos del horario separados
                let selected = false;

                for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {
                  const horarioNrc = horarioAnteriorNrc[indexN];

                  if(nrc == horarioNrc){
                    selected=true;
                  }
                  
                }
                
                  while(arrayHorario.length>indexHorario){
                    let dia = arrayHorario[indexHorario][1];
                    let hora = arrayHorario[indexHorario][0];
                    let horario = new Horario();
                    horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
                    horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
                    horario.dia = dia;   

                    //colorea horario
                    if(selected){
                      
                      this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
                    }

                    horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
                    indexHorario-=-1;
                  }

                  

                let c = new Clase();
                c.nombreProfe = nombreProfe;
                c.nrc = "NRC: "+nrc;
                c.horarios = horarios;
                c.isDisabled = false;
                c.isSelected = selected;
                

                clases.push(c);
                i++;
              }

              materiaAgregar.clases = clases;

              this.materias.push(materiaAgregar);
            });
            this.servicio.obtenerClases(materia.clave).subscribe((datos) => {

              //crear nueva materia con clases y horarios
              var materiaAgregar = new Materia();
              materiaAgregar.nombre = materia.nombre;
              materiaAgregar.clave = materia.clave;

              var clases = new Array<Clase>();

              let i = 0;  
              while (datos[i] != undefined){
                let nrc = datos[i]['nrc'];
                let horario = datos[i]['horario'];
                let nombreProfe = datos[i]['nombre'];
                let indexHorario = 0;
                let horarios = [];
                var arrayHorario = JSON.parse(horario);//Datos del horario separados
                let selected = false;

                for (let indexN = 0; indexN < horarioAnteriorNrc.length; indexN++) {
                  const horarioNrc = horarioAnteriorNrc[indexN];

                  if(nrc == horarioNrc){
                    selected=true;
                  }
                  
                }
                
                  while(arrayHorario.length>indexHorario){
                    let dia = arrayHorario[indexHorario][1];
                    let hora = arrayHorario[indexHorario][0];
                    let horario = new Horario();
                    horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
                    horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
                    horario.dia = dia;   

                    //colorea horario
                    if(selected){
                      
                      this.colorearCuadricula(this.getRandomcolor(materiaAgregar.clave),horario.horaInicio,horario.horaTermino,horario.dia);
                    }

                    horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
                    indexHorario-=-1;
                  }

                  

                let c = new Clase();
                c.nombreProfe = nombreProfe;
                c.nrc = "NRC: "+nrc;
                c.horarios = horarios;
                c.isDisabled = false;
                c.isSelected = selected;
                

                clases.push(c);
                i++;
              }

              materiaAgregar.clases = clases;

              this.materias.push(materiaAgregar);
            });
            
          }
        }
        
      }

      console.log("tamaño materias: "+ this.materias.length);
      console.log("tamaño horarioAnterior: "+ horarioAnteriorClaves.length);*/

    //});
  //}*/

  getRandomcolor(clave){
    let reg = new RegExp('[^0-9]','g');
     
    clave = clave.replaceAll(reg, "");
    
    if(clave.length>3){
      var part1=clave[0]+clave[1];
      var part2=clave[2]+clave[3];
    }else{
      var part1=clave[0];
      var part2=clave[1]+clave[2];
    }
    
    var result=(((parseInt(part1)*7)+2)*((parseInt(part2)*5)+11))*67; 
    
    if(result>1048575 && result<=16777215){ //#FFFFF a #FFFFFF
      var hexResult=result.toString(16);
    }else if(result<=1048575){
      var hexResult=result.toString(16);
      hexResult="0"+hexResult;
    }else if(result>16777215){
      result-=result-10000000;
      var hexResult=result.toString(16);
    }else{
      var hexResult="";
    }
    
    return "#"+hexResult; 
    
    //return Math.floor(Math.random()*(255-0+1)+0);
    //"rgb("+r+", "+g+", "+b+")";
    //"#"+tuwea;
  }

  obtenerLaMadrinolaDelHorario(horaInicio,horaTermino,dia){
    var inicio = moment(horaInicio[0]+horaInicio[1]+":"+horaInicio[2]+horaInicio[3], 'HH:mm');
    var fin = moment(horaTermino[0]+horaTermino[1]+":"+horaTermino[2]+horaTermino[3], 'HH:mm');

    if(fin.format("mm")[1] != "0"){
      fin.add(5,'minute');
    }
    
    var columna = 0;
    switch(dia){//buscar cuadricula inicio
      case 'L':columna = 1;break;
      case 'M':columna = 2;break;
      case 'I':columna = 3;break;
      case 'J':columna = 4;break;
      case 'V':columna = 5;break;
      case 'S':columna = 6;break;
      default:break;
    }

    var fila = 0;
    if(Number(inicio.format('HH')) < 9 ){fila = 1;}
    else if(Number(inicio.format('HH')) < 11){fila = 2;}
    else if(Number(inicio.format('HH')) < 13){fila = 3;}
    else if(Number(inicio.format('HH')) < 15){fila = 4;}
    else if(Number(inicio.format('HH')) < 17){fila = 5;}
    else if(Number(inicio.format('HH')) < 19){fila = 6;}
    else if(Number(inicio.format('HH')) < 21){fila = 7;}

    var duracion = ((fin.diff(inicio)/1000)/60)/30;
    var comienzaALaMedia = inicio.format("mm") == "30";

    return {fila:fila,columna:columna,duracion:duracion,comienzaALaMedia:comienzaALaMedia};
  }

  async colorearCuadricula(rgb,horaInicio,horaTermino,dia){
    //añadir los mugres 5 minutos que quita siiau

    console.log("coloreando: hora inicio: " +horaInicio + ", dia: " + dia + ", color: " + rgb + ", horaTermino: "+ horaTermino); 
    
    
    let datos = this.obtenerLaMadrinolaDelHorario(horaInicio,horaTermino,dia);
    
    let fila = datos.fila;
    let columna = datos.columna;
    let duracion = datos.duracion;
    let comienzaALaMedia = datos.comienzaALaMedia;

    while(duracion > 0){
      
      //añadir color a la cuadricula
      var element = this.obtenerHorarioCuadricula(columna,fila);
      
      element = element.firstChild; //parte1

      if(comienzaALaMedia){
        element.nextSibling;  //parte2
        element.nextSibling;  //parte3
      }

      while (element != null && duracion > 0) {

        var htmlElement = element as HTMLElement;
        htmlElement.style.backgroundColor = rgb;
        element = element.nextSibling;
        duracion--;
      }
           
      fila++;
    }
  }

  comprobarSiHayCupo(horaInicio,horaTermino,dia){
    let datos = this.obtenerLaMadrinolaDelHorario(horaInicio,horaTermino,dia);

    let fila = datos.fila;
    let columna = datos.columna;
    let duracion = datos.duracion;
    let comienzaALaMedia = datos.comienzaALaMedia;
    let Cupo = true;

    while(duracion > 0){
      
      //añadir color a la cuadricula
      var element = this.obtenerHorarioCuadricula(columna,fila);
      element = element.firstChild; //parte1

      if(comienzaALaMedia){
        element.nextSibling;  //parte2
        element.nextSibling;  //parte3
      }

      while (element != null && duracion > 0) {

        var htmlElement = element as HTMLElement;

        if(htmlElement.style.backgroundColor != "rgb(255, 255, 255)"){
          
          Cupo = false;
          duracion = 0;
          break;
        }  

        element = element.nextSibling;
        duracion--;
      }
           
      fila++;
    }
    return Cupo;
  }


  asignarNombre(){
    console.log("****Hacking CIA****");//Hacking 
    console.log("****Hacking 20%****");
    console.log("****Hacking 40%****");
    console.log("****Hacking 60%****");
    console.log("****Hacking 80%****");
    console.log("****Hacking 99%****");
    console.log("*Hacking Completed*");//Easter Egg
    //here
    document.getElementById("nombreUsuarioHorario").textContent = this.servicio.getNombre();
    document.getElementById("nombreUsuarioMenuHorario").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuHorario").innerText = "codigo: "+this.servicio.getCodigo();
  }

  //sideMenu
  cerrar(){
    this.servicio.limpiarTodo();
    this.route.navigate(['/login']);
  }

  menu(){
    this.route.navigate(['/menu']);
  }//sideMenu ends 

  borrarColumna(indexM){//Boton borrar materia

    let s = this.comprobarSiHaySeleccionados(indexM);

    if(s.haySeleccionado){
      
      this.materias[indexM].clases[s.indexC].horarios.forEach(horario => {

        this.colorearCuadricula("#ffffff",horario.horaInicio,horario.horaTermino,horario.dia);
      });
    }


    this.materias.splice(indexM, 1);
  }

  async newAlert(_header: string, _message: string, _buttons: Array<string>) {
    const alert = await this.alertController.create({
      header: _header,
      message: _message,
      buttons: _buttons
    });

    await alert.present();
  }

  async iniciarCarga(mensaje,tiempo){
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      duration: tiempo,
    });

    loading.present();
  }

  fullDayNameSpanish(day: string): string {
    switch (day.toLowerCase()) {
        case "l":
            return "Lunes";
        case "m":
            return "Martes";
        case "i":
            return "Miercoles";
        case "j":
            return "Jueves";
        case "v":
            return "Viernes";
        case "s":
            return "Sabado";
        case "d":
            return "Domingo";
        default:
            return "Día con capacidades diferentes";
    }
  }


  agregar(){ 
    this.agregandoMateria = true;
    
    let materiaSeleccionada = new Materia();

    //buscar materia en lista
    if(this.busquedaHorario.length){      
      this.busquedaMaterias.forEach(materia => {
        if(materia.clave.toLowerCase() == this.busquedaHorario.toLowerCase()){
          materiaSeleccionada.clases = materia.clases;
          materiaSeleccionada.clave = materia.clave;
          materiaSeleccionada.nombre = materia.nombre;
        }
      }); 
    }

    if(materiaSeleccionada.clave == undefined){
      this.newAlert("¡Error!","No se encontró la materia",["Aceptar"]);
    }else{

      this.materias.forEach(materiaEnHorario => {
        if(materiaEnHorario.clave.toLowerCase() == materiaSeleccionada.clave.toLowerCase() ){
          //materia duplicada
          this.newAlert("¡Materia duplicada!","Has ingresado una materia ya registrada en un horario, intenta de nuevo.",["OK"]);
          materiaSeleccionada.clave = undefined;
        }
      });
    }
    
    if(materiaSeleccionada.clave != undefined){
      this.servicio.obtenerClases(materiaSeleccionada.clave);
      this.socket.once(this.servicio.getCodigo()+materiaSeleccionada.clave,(response) => {
        let datos = JSON.parse(response);
        //crear nueva materia con clases y horarios
        var materiaAgregar = new Materia();
        materiaAgregar.nombre = materiaSeleccionada.nombre;
        materiaAgregar.clave = materiaSeleccionada.clave;

        var clases = new Array<Clase>(); 

        let i = 0;  
          while (datos[i] != undefined){
          let nrc = datos[i]['nrc'];
          let horario = datos[i]['horario'];
          let nombreProfe = datos[i]['nombre'];
          let indexHorario = 0;
          let horarios = [];
          var arrayHorario = JSON.parse(horario);//Datos del horario separados
          
            while(arrayHorario.length>indexHorario){
              let dia = arrayHorario[indexHorario][1];
              let hora = arrayHorario[indexHorario][0];
              let horario = new Horario();
              horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
              horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
              horario.dia = dia;
              horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
              indexHorario-=-1;
            }

          let c = new Clase();
          c.nombreProfe = nombreProfe.replaceAll(/,/g, "\n");
          c.nrc = "NRC: "+nrc;
          c.horarios = horarios;
          c.isDisabled = false;
          clases.push(c);
          i++;
        }

        materiaAgregar.clases = clases;

        this.materias.push(materiaAgregar);
      });

      /*this.servicio.obtenerClases(materiaSeleccionada.clave).subscribe((datos) => {
        //crear nueva materia con clases y horarios
        var materiaAgregar = new Materia();
        materiaAgregar.nombre = materiaSeleccionada.nombre;
        materiaAgregar.clave = materiaSeleccionada.clave;

        var clases = new Array<Clase>();

        let i = 0;  
          while (datos[i] != undefined){
          let nrc = datos[i]['nrc'];
          let horario = datos[i]['horario'];
          let nombreProfe = datos[i]['nombre'];
          let indexHorario = 0;
          let horarios = [];
          var arrayHorario = JSON.parse(horario);//Datos del horario separados
          
            while(arrayHorario.length>indexHorario){
              let dia = arrayHorario[indexHorario][1];
              let hora = arrayHorario[indexHorario][0];
              let horario = new Horario();
              horario.horaInicio = hora[0]+hora[1]+hora[2]+hora[3];
              horario.horaTermino = hora[5]+hora[6]+hora[7]+hora[8];
              horario.dia = dia;   
              horarios.push(horario);//Añadir la info de las clases en las fichas del mapa
              indexHorario-=-1;
            }

          let c = new Clase();
          c.nombreProfe = nombreProfe;
          c.nrc = "NRC: "+nrc;
          c.horarios = horarios;
          c.isDisabled = false;
          clases.push(c);
          i++;
        }

        materiaAgregar.clases = clases;

        this.materias.push(materiaAgregar);
        
      });*/
    }

    this.iniciarCarga("agregando",2000);
    setTimeout(() => {
      this.comprobarClases();
      //desactiva imagen cargando
    }, 500);
    
    
  }

  async inicializarBusqueda(){
    
    this.servicio.getMaterias();
     this.socket.once(this.servicio.getCodigo()+"Materias", (response) =>  {
      let respuesta = JSON.parse(response);
      
      
      var i = 0;      
      while(respuesta[i] != undefined){
        //console.log(respuesta[i]);
        //console.log(respuesta[i]['clave']);
        var r = new Materia();
        r.clave = respuesta[i]['clave'].toString();
        r.nombre = respuesta[i]['nombre'].toString();
        this.busquedaMaterias.push(r);

        i++;
      }
    });
  }
  
  obtenerHorarioCuadricula(indexColumna, indexFila){
    let e = document.getElementById("horarioMatricula").lastChild;
    e = e.firstChild;
    var i =0;
    while (i!=indexColumna+1){
      e = e.nextSibling;
      i++;
    }

    e = e.firstChild;
    e = e.firstChild;

    var i =0;
    while (i!=indexFila){
      e = e.nextSibling;
      i++;
    }
    return e;
  }

  obtenerClaseCuadricula(indexMateria, indexClase){
    //devuelve elemento de la cuadricula de clases
    let e = document.getElementById("materiasHorario").lastChild;
    e = e.firstChild;

    var i =0;
    while (i!=indexMateria+1){      
      e = e.nextSibling;
      i++;
    }
    e = e.lastChild;
    e = e.lastChild;//llega a la cuadricula

    e = e.firstChild;//primera cuadricula
    i = 0;
    while (i!=indexClase+1){
      e = e.nextSibling;
      i++;
    }
    return e;
  }

  seleccionarClase(indexM, indexC){
    //si no esta deshabilitado
    if(!this.materias[indexM].clases[indexC].isDisabled){

      //Toggle: habilitar-deshabilitar clase seleccionada
      this.materias[indexM].clases[indexC].isSelected = !this.materias[indexM].clases[indexC].isSelected;

      //colorear horario de materia seleccionada
      if(!this.materias[indexM].clases[indexC].isSelected){
        this.materias[indexM].clases[indexC].horarios.forEach(horario => {

          let color = "#ffffff";
          this.colorearCuadricula(color,horario.horaInicio,horario.horaTermino,horario.dia);

        }); 
      }else{
        this.materias[indexM].clases[indexC].horarios.forEach(horario => {

          let color = this.getRandomcolor(this.materias[indexM].clave);
          this.colorearCuadricula(color,horario.horaInicio,horario.horaTermino,horario.dia);

        }); 
      }
      
      this.comprobarClases();//Comprobar clases
    }
  }

  comprobarSiHaySeleccionados(indexM){
    
    
    let haySeleccionado = false;
    let i = 0;
    let indexC;
    this.materias[indexM].clases.forEach(clase => {
      if(clase.isSelected){
        haySeleccionado = true;
        indexC = i;
      }
      i++;
    });

    return {haySeleccionado,indexC};
  }

  comprobarClases(){//comprueba todas las clases si es posible agregarlas al horario
    var nrc = "Lista de NRC";
    this.listaNrc = nrc;

    for (let indexM = 0; indexM < this.materias.length; indexM++) {//Recorre las materias agregadas
      const materia = this.materias[indexM];

      let haySeleccionados = this.comprobarSiHaySeleccionados(indexM).haySeleccionado;

      let claveM = materia.clave;

      for (let indexC = 0; indexC < materia.clases.length; indexC++) {//Recorre las clases de la materia
        const clase = materia.clases[indexC];

        if(clase.isSelected){
          this.listaNrc = this.listaNrc+"\n "+ materia.clave + ": " + clase.nrc.split(" ")[1];
        }

        for (let indexH = 0; indexH < clase.horarios.length; indexH++) {
          const horario = clase.horarios[indexH];

          
          
          if(this.comprobarSiHayCupo(horario.horaInicio,horario.horaTermino,horario.dia)){
            
            if(haySeleccionados){
              clase.isDisabled = true;
              var e = this.obtenerClaseCuadricula(indexM,indexC).lastChild as HTMLElement;
              e.style.backgroundColor = "#939393"; //no seleccionable 
              break;
              
            }else{
              //hay cupo y no hay seleccionados
              clase.isDisabled = false;
              var e = this.obtenerClaseCuadricula(indexM,indexC).lastChild as HTMLElement;
              e.style.backgroundColor = "#ffffff"; //seleccionable
            }
            
          }else{
            if(clase.isSelected){
              clase.isDisabled = false;
              var e = this.obtenerClaseCuadricula(indexM,indexC).lastChild as HTMLElement;
              
              e.style.backgroundColor = this.getRandomcolor(claveM); //seleccionado
            }else{
              clase.isDisabled = true;
              
              var e = this.obtenerClaseCuadricula(indexM,indexC).lastChild as HTMLElement;
              e.style.backgroundColor = "#939393";//no seleccionable
              break;
            }  
          }      
}; 
      }   
    }
    if (this.agregandoMateria){
      this.agregandoMateria = false;
    }
    var textarea = document.getElementById("textareaNRC");
    //textarea.style.backgroundColor = "aqua";
    //textarea.setAttribute("value", this.listaNrc);
    
  }


  guardarHorario(){
    this.servicio.borrarHorario(this.servicio.getCodigo());
    this.socket.once(this.servicio.getCodigo(),(resultado) => {
      console.log("el resultado es: " + resultado);
    });

    /*this.servicio.borrarHorario(this.servicio.getCodigo()).subscribe((resultado) => {
      console.log("el resultado es: " + resultado);
    });*/

    this.iniciarCarga("guardando",2000);
      
    this.guardarHorarioAsync();
  }

  delay = ms => new Promise(res => setTimeout(res, ms));

  guardarHorarioAsync = async () => {
    let banderaxD = false;
    await this.delay(1500);
    for (let indexM = 0; indexM < this.materias.length; indexM++) {
      const materia = this.materias[indexM];
      for (let indexC = 0; indexC < materia.clases.length; indexC++) {
        const clase = materia.clases[indexC];
        if(clase.isSelected){
          //subir clase
          //console.log("se Guarda:" + clase.nrc.split(" ")[1]);
          //console.log("con codigo: " + this.servicio.getCodigo());

          this.servicio.setHorarioAlumno(this.servicio.getCodigo(),clase.nrc.split(" ")[1]);
          this.socket.once(this.servicio.getCodigo(),(resultado) => {
            console.log("el resultado es: " + resultado); //CAMBIAR POR ALERT?
          })
          /*this.servicio.setHorarioAlumno(this.servicio.getCodigo(),clase.nrc.split(" ")[1]).subscribe((resultado) => {
            console.log("el resultado es: " + resultado);
            
          })*/
        }
      }
    }
    

  }
}