import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

class Mensaje { 
  nombre: string;
  img: string;
  mensaje: string;
  href: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  constructor(private route: Router, private servicio: ApiserviceService, private socket: Socket) { }
  
  messages: Mensaje[];
  newMessage: Mensaje;
  msj = "";
  msjAnt = "";
  interval: any;

  backgroundColor = 'primary';

  ngOnInit() {
    this.messages = new Array<Mensaje>; 
    // this.interval = setInterval(() => {
    //   this.ajustarScroll();
    // }, 200);
  }

  ionViewWillLeave(){//Detener el intervalo cuando se sale del mapa
    // clearInterval(this.interval);
    this.messages = [];
  }

  

  ajustarScroll(){
    var element = document.getElementById("mensajesChat");
    element.scrollTop = element.scrollHeight+100;
  }
  

  sendMessage() {
    if(this.msj == ""){
      return
    }

    //eliminar mensajes excedentes
    if(this.messages.length>40){
      this.messages.shift();
    }
    //crear mensaje del usuario
    this.newMessage = new Mensaje();
    this.newMessage.img = "./../../assets/icon/descarga.gif";
    this.newMessage.mensaje = this.msj;
    this.newMessage.nombre = "TU";
    this.msjAnt = this.msj;
    this.msj = "";

    //agregar nuevo mensaje
    this.messages.push(this.newMessage);
    
    //conexion del socket
    this.servicio.enviarMensaje(this.newMessage.mensaje);
    console.log("mensaje enviado");
    this.socket.once("mensaje"+this.servicio.getCodigo(),(respuesta) => {
      if(this.messages.length>6){
        this.messages.shift();
      }


      


      

      //crear mensaje del Qmono
      this.newMessage = new Mensaje();
      this.newMessage.img = "./../../assets/icon/Qmono.png";
      this.newMessage.mensaje = respuesta[1];
      this.newMessage.nombre = "Qmono";

      
      //acciones especiales
      if(respuesta[1] == "/REPETIR/"){
        this.newMessage.mensaje = this.msjAnt+"?";

      }else if(respuesta[1] == "/RIPITIR/"){

        const vocales = /[aeiou]/gi; // Expresión regular para buscar vocales

        this.newMessage.mensaje = "''"+this.msjAnt.replace(vocales, "i")+"''"; // Reemplazar vocales por el valor especificado
        
      }else{
        

      }
      
      
      //tag de respuesta de qmono
      switch(respuesta[2]){
        case "qinfo": {
          console.log("qinfo");
          this.newMessage.href = "profes";
          this.messages.push(this.newMessage);
          break;
        }
        case "qhorario": {
          console.log("qhorario");
          this.newMessage.href = "horario";
          this.messages.push(this.newMessage);
          break;
        }
        case "qmapa": {
          console.log("qmapa");
          this.newMessage.href = "mapa";
          this.messages.push(this.newMessage);
          break;
        }
        default: {
          console.log("sin href");
          this.messages.push(this.newMessage);
          break;
        }
      }
      
      
      console.log("mensaje recibido");
      //document.getElementById("mensajesChat").lastChild.scrollIntoView();
    });

    setTimeout(() => {
      this.ajustarScroll();
      //desactiva imagen cargando
    }, 400);

  }

  irA(href){
    this.route.navigate(['/'+href]);
  }
 
  changeBackgroundColor() { 
    this.backgroundColor = this.backgroundColor === 'primary' ? 'secondary' : 'primary' 
  }

}
