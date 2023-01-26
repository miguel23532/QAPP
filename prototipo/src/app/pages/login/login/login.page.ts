import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  
}) 
export class LoginPage implements OnInit {
  codigoLogin:string;
  passLogin:string;
  camposValidos:boolean;
  regimg;
  loginimg;
  selectedCardIndexlogin = 0;
  selectedCardIndexreg = 0;

  visible = false;
  constructor(private route: Router, private servicio: ApiserviceService, public alertController: AlertController,private socket: Socket) {
    this.regimg = [
      {
        img: "../../../../assets/icon/Registro.png",
      },
      {
        img: "../../../../assets/icon/Registro_shadow.png",
      }
    ];
    this.loginimg = [
      {
        img: "../../../../assets/icon/Login.png",
      },
      {
        img: "../../../../assets/icon/Login_shadow.png",
      }
    ];
    

  }

  ngOnInit() {}

  async datosIncorrectosAlert() {
    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'El usuario no se encuentra registrado o las credenciales ingresadas no son correctas.',
      buttons: ['OK']
      
    });

    await alert.present();
  }

  async campoVacioAlert() {
    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'Falta algun campo',
      buttons: ['OK']
    });

    await alert.present();
  }

  nextpage(page) {
    this.route.navigate([page]);
  }

  turnvisible() {
    //visible = !visible;
  }

 

  overlogin(event){
    this.selectedCardIndexlogin = 1;

  }

  outlogin(event){
    this.selectedCardIndexlogin = 0;
  }

  overreg(event){
    this.selectedCardIndexreg = 1;
    
  }

  outreg(event){
    this.selectedCardIndexreg = 0;
  }

  hideHelp(){
    document.getElementById("help").style.display = "none";
    document.getElementById("ayuda").style.display = "block";
  }


  //ARREGLAR SEGURIDAD AQUI ↓
  login(){
    this.camposValidos=true;

    if(!this.codigoLogin){
      this.camposValidos = false;
      //cambiar campo de color maybe...
    }

    if(!this.passLogin){
      this.camposValidos = false;
      //cambiar campo de color maybe...
    }
    
    if(this.camposValidos){

      let socket = this.servicio.login(this.passLogin,this.codigoLogin);

      socket.once(this.codigoLogin, (respuesta) => {
      respuesta = JSON.parse(respuesta);

      if(respuesta && respuesta!=undefined){

        this.servicio.setNombre(respuesta['nombre']);
        this.servicio.setCodigo(this.codigoLogin);

        this.passLogin = "";
        this.codigoLogin = "";

        this.route.navigate(['/menu']); 

      }else{
        //datos incorrectos 
        this.datosIncorrectosAlert();
      }

    });
      
      
      /*this.servicio.login(this.passLogin,this.codigoLogin).subscribe(
        (respuesta) => {
          if(respuesta){
            
            this.servicio.setNombre(respuesta['nombre']);
            this.servicio.setCodigo(this.codigoLogin);

            this.passLogin = "";
            this.codigoLogin = "";

            this.route.navigate(['/menu']); 
          }else{
            //datos incorrectos 
            this.datosIncorrectosAlert();
          }
        }
      )
      
      this.servicio.setNombre("fulanito");
      this.servicio.setCodigo("no");
      this.route.navigate(['/menu']); 
      */


    }else{
      //llamar alert campo vacio
      this.campoVacioAlert();
    }
    
    
  }
} 
