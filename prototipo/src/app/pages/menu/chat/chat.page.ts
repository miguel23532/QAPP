import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

class Mensaje { 
  nombre: string;
  img: string;
  mensaje: string;
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
  interval: any;

  backgroundColor = 'primary';

  ngOnInit() {
    this.messages = new Array<Mensaje>; 
    this.interval = setInterval(() => {
      this.ajustarScroll();
    }, 200);
  }

  ionViewWillLeave(){//Detener el intervalo cuando se sale del mapa
    clearInterval(this.interval);
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
    if(this.messages.length>6){
      this.messages.shift();
    }
    //crear mensaje del usuario
    this.newMessage = new Mensaje();
    this.newMessage.img = "./../../assets/icon/descarga.gif";
    this.newMessage.mensaje = this.msj;
    this.newMessage.nombre = "TU";

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
      this.newMessage.mensaje = respuesta;
      this.newMessage.nombre = "Qmono";

      this.messages.push(this.newMessage);
      
      console.log("mensaje recibido");
      //document.getElementById("mensajesChat").lastChild.scrollIntoView();
    });

  }
 
  changeBackgroundColor() { 
    this.backgroundColor = this.backgroundColor === 'primary' ? 'secondary' : 'primary' 
  }

}
