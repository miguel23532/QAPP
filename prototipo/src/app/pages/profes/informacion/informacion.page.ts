import { Component, OnInit  } from '@angular/core';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';


class materia{
  nombre: string;
  creditos: string;
  clave: string;
}

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.page.html',
  styleUrls: ['./informacion.page.scss'],
})

export class InformacionPage implements OnInit {
  nombreUsuario:string;
  nombreProfe:string;
  codigoProfe:string;
  materias = [];
  imageName: string;
  evaluaciones: number;


  slideOpts = {
    on: {
      beforeInit() {
        const swiper = this;
        const overwriteParams = {
          slidesPerView: 1,
          watchSlidesProgress: true,
          spaceBetween: 10,
          width: 130,         
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
  }}
  
  constructor(private servicio: ApiserviceService,private route: Router, public menuCtrl: MenuController,private socket: Socket) { 
    this.evaluaciones = 0;
  }

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    
    this.asignarNombre();
    this.codigoProfe = this.servicio.getCodigoProfe().toString();
    this.nombreProfe = this.servicio.getNombreProfe().toString();
    this.asignarMateriasProfe();
    this.asignarDatosProfe();
    
  }

  evaluarProfe(event){ 
    this.route.navigate(['/evaluar'], { replaceUrl: true }); 
  }   

  irMateria(event){  
     if(event.target.swiper.clickedIndex != undefined){
      let index = event.target.swiper.clickedIndex;
      let clave = this.materias[index].clave;
      let nombre = this.materias[index].nombre;

      this.servicio.limpiarMateria();

      this.servicio.setClaveMateria(clave);
      this.servicio.setNombreMateria(nombre);

      this.route.navigate(['/materia'], { replaceUrl: true }); 
     }
  }

  asignarNombre(){
    document.getElementById("nombreUsuarioInformacion").textContent = this.servicio.getNombre();
    document.getElementById("nombreUsuarioMenuInformacion").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuInformacion").innerText = "codigo: "+this.servicio.getCodigo();
  }

  asignarDatosProfe(){
    document.getElementById("nombreProfeInformacion").textContent = this.nombreProfe;
  }

  asignarMateriasProfe(){
    this.servicio.getDatosProfe(this.codigoProfe);
    this.socket.once(this.servicio.getCodigo()+"getDatosProfe",(response) => {
      let datos = JSON.parse(response);
      var i = 0;
      while(datos[i] != undefined){
        var m = new materia(); 
        console.log(datos[i]);
        console.log(datos); 
        m.nombre =    datos[i]['nombre'].toString();
        m.clave =     datos[i]['clave'].toString();
        m.creditos =  datos[i]['creditos'].toString();
        this.materias.push(m);
        i++;
      } 
      this.asignarEvaluacionProfe();
    }); 
    
    /*this.servicio.getDatosProfe(this.codigoProfe).subscribe((datos) => {//aqui necesitamos el soket
      var i = 0;
      while(datos[i] != undefined){
        var m = new materia();        
        m.nombre =    datos[i]['nombre'].toString();
        m.clave =     datos[i]['clave'].toString();
        m.creditos =  datos[i]['creditos'].toString();
        this.materias.push(m);
        i++;
      } 
    })*/
  }

  asignarEvaluacionProfe(){
    this.servicio.getPromedioProfe(this.codigoProfe);
    this.socket.once(this.servicio.getCodigo()+"getPromedioProfe",(response)=>{
    let datos = JSON.parse(response);

    
    this.evaluaciones = datos[0]['COUNT(`codigo_profesor`)'];
    
    if(datos[0]['AVG(`flexibilidad`)'] == null){
      document.getElementById("gridEvaluacion").style.display = "none";
      document.getElementById("noEvaluacion").style.display = "block";
    }else{
      document.getElementById("gridEvaluacion").style.display = "block";
      document.getElementById("noEvaluacion").style.display = "none";
    }
      
    let flexibilidad = 10.00*parseFloat(datos[0]['AVG(`flexibilidad`)']);
    let puntualidad = 10.00*parseFloat(datos[0]['AVG(`puntualidad`)']);
    let recomendado = 10.00*parseFloat(datos[0]['AVG(`recomendado`)']);
    let facilidad = 10.00*parseFloat(datos[0]['AVG(`facilidad`)']);
    let interes = 10.00*parseFloat(datos[0]['AVG(`interes`)']);

    if (flexibilidad >= 0){
      document.getElementById("flexibilidad").style.width = flexibilidad.toString()+"%";
      document.getElementById("flexibilidad").style.backgroundColor = this.SeleccionarColorCalificación(flexibilidad);
      document.getElementById("flexibilidad").innerText = flexibilidad.toString()+"";
      document.getElementById("flexibilidad").style.textAlign = "center";
      document.getElementById("flexibilidad").style.color = this.SeleccionarColorCalificación(flexibilidad);
    }

    if (puntualidad >= 0){
      document.getElementById("puntualidad").style.width = puntualidad.toString()+"%";
      document.getElementById("puntualidad").style.backgroundColor = this.SeleccionarColorCalificación(puntualidad);
      document.getElementById("puntualidad").innerText = puntualidad.toString()+"";
      document.getElementById("puntualidad").style.textAlign = "center";
      document.getElementById("puntualidad").style.color = this.SeleccionarColorCalificación(puntualidad);
    }

    if (recomendado >= 0){
      document.getElementById("recomendado").style.width = recomendado.toString()+"%";
      document.getElementById("recomendado").style.backgroundColor = this.SeleccionarColorCalificación(recomendado);
      document.getElementById("recomendado").innerText = recomendado.toString()+"";
      document.getElementById("recomendado").style.textAlign = "center";
      document.getElementById("recomendado").style.color = this.SeleccionarColorCalificación(recomendado);
    }

    if (facilidad >= 0){
      document.getElementById("facilidad").style.width = facilidad.toString()+"%";
      document.getElementById("facilidad").style.backgroundColor = this.SeleccionarColorCalificación(facilidad);
      document.getElementById("facilidad").innerText = facilidad.toString()+"";
      document.getElementById("facilidad").style.textAlign = "center";
      document.getElementById("facilidad").style.color = this.SeleccionarColorCalificación(facilidad);
    }

    if (interes >= 0){
      document.getElementById("interes").style.width = interes.toString()+"%";
      document.getElementById("interes").style.backgroundColor = this.SeleccionarColorCalificación(interes);
      document.getElementById("interes").innerText = interes.toString()+"";
      document.getElementById("interes").style.textAlign = "center";
      document.getElementById("interes").style.color = this.SeleccionarColorCalificación(interes);
    }

    let promedio = (flexibilidad+puntualidad+recomendado+facilidad+interes)/5;
    let medalla = this.SeleccionarMedallaPromedio(promedio);
    this.imageName = "../../../../assets/icon/"+medalla+".png";
  });

    /*this.servicio.getPromedioProfe(this.codigoProfe).subscribe((datos)=>{
       
      this.evaluaciones = datos[0]['COUNT(`codigo_profesor`)'];
      
      if(datos[0]['AVG(`flexibilidad`)'] == null){
        document.getElementById("gridEvaluacion").style.display = "none";
        document.getElementById("noEvaluacion").style.display = "block";
      }else{
        document.getElementById("gridEvaluacion").style.display = "block";
        document.getElementById("noEvaluacion").style.display = "none";
      }
       
      let flexibilidad = 10.00*parseFloat(datos[0]['AVG(`flexibilidad`)']);
      let puntualidad = 10.00*parseFloat(datos[0]['AVG(`puntualidad`)']);
      let recomendado = 10.00*parseFloat(datos[0]['AVG(`recomendado`)']);
      let facilidad = 10.00*parseFloat(datos[0]['AVG(`facilidad`)']);
      let interes = 10.00*parseFloat(datos[0]['AVG(`interes`)']);
 
      if (flexibilidad >= 0){
        document.getElementById("flexibilidad").style.width = flexibilidad.toString()+"%";
        document.getElementById("flexibilidad").style.backgroundColor = this.SeleccionarColorCalificación(flexibilidad);
        document.getElementById("flexibilidad").innerText = flexibilidad.toString()+"";
        document.getElementById("flexibilidad").style.textAlign = "center";
        document.getElementById("flexibilidad").style.color = this.SeleccionarColorCalificación(flexibilidad);
      }

      if (puntualidad >= 0){
        document.getElementById("puntualidad").style.width = puntualidad.toString()+"%";
        document.getElementById("puntualidad").style.backgroundColor = this.SeleccionarColorCalificación(puntualidad);
        document.getElementById("puntualidad").innerText = puntualidad.toString()+"";
        document.getElementById("puntualidad").style.textAlign = "center";
        document.getElementById("puntualidad").style.color = this.SeleccionarColorCalificación(puntualidad);
      }

      if (recomendado >= 0){
        document.getElementById("recomendado").style.width = recomendado.toString()+"%";
        document.getElementById("recomendado").style.backgroundColor = this.SeleccionarColorCalificación(recomendado);
        document.getElementById("recomendado").innerText = recomendado.toString()+"";
        document.getElementById("recomendado").style.textAlign = "center";
        document.getElementById("recomendado").style.color = this.SeleccionarColorCalificación(recomendado);
      }

      if (facilidad >= 0){
        document.getElementById("facilidad").style.width = facilidad.toString()+"%";
        document.getElementById("facilidad").style.backgroundColor = this.SeleccionarColorCalificación(facilidad);
        document.getElementById("facilidad").innerText = facilidad.toString()+"";
        document.getElementById("facilidad").style.textAlign = "center";
        document.getElementById("facilidad").style.color = this.SeleccionarColorCalificación(facilidad);
      }

      if (interes >= 0){
        document.getElementById("interes").style.width = interes.toString()+"%";
        document.getElementById("interes").style.backgroundColor = this.SeleccionarColorCalificación(interes);
        document.getElementById("interes").innerText = interes.toString()+"";
        document.getElementById("interes").style.textAlign = "center";
        document.getElementById("interes").style.color = this.SeleccionarColorCalificación(interes);
      }

      let promedio = (flexibilidad+puntualidad+recomendado+facilidad+interes)/5;
      let medalla = this.SeleccionarMedallaPromedio(promedio);
      this.imageName = "../../../../assets/icon/"+medalla+".png";
    })*/
  }

  SeleccionarColorCalificación(percent){
    if(percent<20){
      return "#FF0000";
    }else if(percent<40){
      return "#FF8300";
    }else if(percent<60){
      return "#FFD500";
    }else if(percent<80){
      return "#E0FF00";
    }else if(percent<=100){
      return "#70FF00";
    }
  }

  SeleccionarMedallaPromedio(promedio){
    if(promedio<20){
      return "bronze";
    }else if(promedio<40){
      return "silver";
    }else if(promedio<60){
      return "gold";
    }else if(promedio<80){
      return "platinum";
    }else if(promedio<=100){
      return "diamond";
    } 
  }

  //sideMenu

  cerrar(){
    this.servicio.limpiarTodo();
    this.route.navigate(['/login']);
  }

  menu(){
    this.route.navigate(['/menu']);
  }

  //sideMenu ends

  openMenu(){
    this.menuCtrl.close();
    this.menuCtrl.isEnabled().then(response2 => {
      if (!response2){
        this.menuCtrl.enable(true);
      }
      console.log(response2);
      
      this.menuCtrl.toggle();
    })  

    this.menuCtrl.enable(true).then(() => {
      this.menuCtrl.open();
    });
  }

}

