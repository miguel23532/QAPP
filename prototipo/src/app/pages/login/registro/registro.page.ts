import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from './../../../servicios/apiservice.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  nombreRegistro:string;
  codigoRegistro:string;
  passRegistro:string;
  correoRegistro:string;
  carreraRegistro:string;
  camposValidos:boolean;
  nombreRegex:RegExp;
  correoRegex:RegExp;
  codigoRegex:RegExp;
  passRegex:RegExp;

  
  

  constructor(private route: Router,private servicio: ApiserviceService, public alertController: AlertController) { }

  ngOnInit() {

    window.addEventListener('keyboardDidShow', () => {
      console.log("Keyboard is open")
      let elements = document.querySelectorAll(".tabbar");
    
      if (elements != null) {
        Object.keys(elements).map((key) => {
          elements[key].style.display = 'none';
        });
      }
    });
    
    window.addEventListener('keyboardWillHide', () => {
      let elements = document.querySelectorAll(".tabbar");
    
      if (elements != null) {
        Object.keys(elements).map((key) => {
          elements[key].style.display = 'flex';
        });
      }
    });
  }
 
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'Registro exitoso',
      buttons: ['OK']
    });

    await alert.present();
  }

  async faltaAlert(){
    let campos = [this.nombreRegistro,this.codigoRegistro,this.correoRegistro,this.passRegistro,this.carreraRegistro];
    let camposNombre = ["\nnombre","\ncodigo","\ncorreo","\npassword","\ncarrera"];
    let camposMalos =[];

    let i = 0;
    
    while(i<5){
      
      if (!campos[i]){
        camposMalos.push(camposNombre[i]);
      }
      i++;
    }


    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'Favor de revisar los siguientes campos:'+camposMalos.toString()+'.',
      buttons: ['OK']
    }); 

    await alert.present();
  }

  async yaExisteAlert() {
    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'Este codigo de estudiante ya se encuentra registrado',
      buttons: ['OK']
    });

    await alert.present();
  }

  async errorAlert() {
    const alert = await this.alertController.create({
      header: 'AVISO',
      message: 'hubo un error en algun campo, verifica los campos',
      buttons: ['OK']
    });

    await alert.present();
  }
  
  //Boton regresar
  regresar(){
    this.route.navigate(['/login']);
  }
  
  registrar(){
    this.camposValidos = true;
    this.nombreRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,60}$/;
    this.correoRegex = /^[a-zA-Z0-9._]+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    this.codigoRegex = /^[0-9]{5,10}$/
    this.passRegex = /^.{4,20}$/

    //validar campos
    //Falta cambiar de color campos que esten erroneos
    //Falta validar campos con expresiones regulares
    if(!this.nombreRegex.test(this.nombreRegistro)){
      this.camposValidos = false;
      this.nombreRegistro="";
      //maximo de caracteres 
    }

    if(!this.codigoRegex.test(this.codigoRegistro)){
      this.camposValidos = false;
      this.codigoRegistro="";
      //maximo de caracteres y solo numeros
    }

    if(!this.correoRegex.test(this.correoRegistro)){
      this.camposValidos = false;
      this.correoRegistro="";
      //este ya sirve o deberia
    }else if(!(this.correoRegistro.length<61)){
      this.camposValidos = false;
      this.correoRegistro="";
    }

    if(!this.passRegex.test(this.passRegistro)){
      this.camposValidos = false;
      this.passRegistro="";
      //minimo de caracteres y mayuscula, numero y especial.
    }

    if(!this.carreraRegistro){
      this.camposValidos = false;
    }

    if(this.camposValidos){

      console.log("camposValidos");
      let socket = this.servicio.registrar( this.codigoRegistro,this.correoRegistro,this.carreraRegistro,this.passRegistro,this.nombreRegistro);

      socket.once(this.codigoRegistro, (respuesta) => {
        console.log("señal escuchada");
        console.log(respuesta);
        if(respuesta == 0){
          //ocurre error
          this.errorAlert()

        }else if(respuesta == 1){
          //registro exitoso
          //borrar valores y mandar alert
          this.codigoRegistro="";
          this.correoRegistro="";
          this.carreraRegistro="";
          this.passRegistro="";
          this.nombreRegistro="";
          
          this.presentAlert()
          this.regresar()
          
          
        }else if(respuesta == 2){
          //ya existe registro
          this.yaExisteAlert()
        }
        socket.disconnect();
        
      });

      
    
      /*  this.servicio.registrar(this.codigoRegistro,this.correoRegistro,this.carreraRegistro,this.passRegistro,this.nombreRegistro).subscribe(
        (respuesta) => {
          if(respuesta == 0){
            //ocurre error
            this.errorAlert()

          }else if(respuesta == 1){
            //registro exitoso
            //borrar valores y mandar alert
            this.codigoRegistro="";
            this.correoRegistro="";
            this.carreraRegistro="";
            this.passRegistro="";
            this.nombreRegistro="";
            
            this.presentAlert()
            this.regresar()
            
            
          }else if(respuesta == 2){
            //ya existe registro
            this.yaExisteAlert()
          }
        }
        
      )*/
    }else{
      //avisar que algunos campos no son validos
      console.log("Faltan campos");
      
      this.faltaAlert()
    }

  }//Registrar

}//EXPORT class
