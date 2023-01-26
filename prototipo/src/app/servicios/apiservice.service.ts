import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})

export class ApiserviceService {

  nombre:string;
  codigo:string;
  clave_materia:string;
  nombre_materia:string;
  id_profe:string;
  nombreProfe:string;


  constructor(private http:HttpClient,private socket: Socket) {
    this.nombre = "";
    this.codigo = "";
    this.clave_materia = "";
    this.nombre_materia = "";
    this.id_profe = "";
    this.nombreProfe = "";
  }

  //mandar constraseña y usuario al servidor para loguearse
  login(pass,user): any{

    this.socket.connect();
    

    //var s = require('socket.io-client')('localhost:3001');
    this.socket.emit('login', {user,pass});

    return this.socket;
   //return this.http.get(`http://localhost/QAPP/loginAlumno.php?codigo=`+user+`&pass=`+pass);
  }

  registrar(codigo,correo,carrera,pass,nombre){
    this.socket.connect();
    this.socket.emit('registrar', {codigo,correo,carrera,pass,nombre});

    return this.socket;
    //return this.http.get(`https://localhost/QAPP/registroAlumno.php?codigo=`+codigo+`&pass=`+pass+`&correo=`+correo+`&carrera=`+carrera+`&nombre=`+nombre);
  }

  /*obtenerNombre(codigo){

    return this.http.get(`https://localhost/QAPP/obtenerNombreCuenta.php?codigo=`+codigo);
  }*/

  evaluarProfe(evaluacion): any{
    const codigo = this.codigo;
    console.log(this.codigo);
    console.log(codigo);
    
    this.socket.emit('evaluarProfe', {codigo,evaluacion});

    return this.socket; 
    
  }

  obtenerEvaluacionProfe(codigoEstudiante,codigoProfe){ 
    this.socket.emit('obtenerEvaluacionProfe', {codigoEstudiante,codigoProfe});

    this.socket.once(this.codigo, (respuesta) => {
      console.log(respuesta);
      return respuesta;
    });



    //return this.http.get(`https://localhost/QAPP/obtenerEvaluacionProfe.php?codigoAlumno=`+codigoEstudiante+`&codigoProfe=`+codigoProfe);
  }

  getHorario(){ 

    this.socket.emit('getHorario',this.codigo);
    return this.socket; 

    this.socket.once(this.codigo, (respuesta) => {
      console.log(respuesta);
      return respuesta;
    });
    
    //return  this.http.get(`xhttps://localhost/QAPP/obtenerHorario.php?codigo=`+this.codigo);
  }

  /*async getHorario2() : Promise<string>{ 

    return this.http.get(
      `xhttps://localhost/QAPP/obtenerHorario.php?codigo=`+this.codigo
    ).toPromise().then(response => {

        var data = JSON.stringify(response, null, 2);

        // here i do some stuff about the data
        return JSON.parse(data);
    });
  }*/
  
  getProfes(){
    const codigo = this.codigo;
    this.socket.emit('getProfes', {codigo});
    return this.socket; 

    //return this.http.get(`https://localhost/QAPP/obtenerProfes.php`);
  }

  getMaterias(){
    const codigo = this.codigo;
    this.socket.emit('getMaterias', {codigo});
    return this.socket; 
    
    //return this.http.get(`xhttps://localhost/QAPP/obtenerMaterias.php`);
  } 

  getDatosProfe(codigo){
    console.log(codigo);
    console.log(this.codigo);
    const codigoEstudiante = this.codigo;
    this.socket.emit('getDatosProfe', {codigo,codigoEstudiante});
    return this.socket; 

    //return this.http.get(`xhttp://localhost/QAPP/obtenerMateriasDeProfe.php?codigoProfe=`+codigo);
  }

  getPromedioProfe(codigoProfe){ 
    const codigoEstudiante = this.codigo;
    this.socket.emit('getPromedioProfe', {codigoEstudiante,codigoProfe});
    return this.socket; 
    
    //return this.http.get(`xhttp://localhost/QAPP/obtenerPromedioProfe.php?codigoProfe=`+codigo);
  }

  obtenerClases(materia){
    const codigoEstudiante = this.codigo;
    this.socket.emit('obtenerClases', {materia,codigoEstudiante});
    return this.socket;
    
    //return this.http.get(`xhttp://localhost/QAPP/obtenerClaseConMateria.php?materia=`+materia);
  }

  setHorarioAlumno(codigo,nrc){
    this.socket.emit('setHorarioAlumno', {codigo,nrc});
    return this.socket;
    //return this.http.get(`xhttp://localhost/QAPP/registroHorarioAlumno.php?codigo_alumno=`+codigo+`&nrc_clase=`+nrc);
  }

  getHorarioAlumno(codigo){
    this.socket.emit('getHorarioAlumno', {codigo});
    return this.socket;
    //return this.http.get(`xhttp://localhost/QAPP/obtenerHorarioAlumno.php?codigo_alumno=`+codigo); 
  }

  borrarHorario(codigo){
    this.socket.emit('borrarHorario', {codigo});
    return this.socket;
    //return this.http.get(`xhttp://localhost/QAPP/eliminarHorarioAlumno.php?codigo_alumno=`+codigo);
  }

  enviarMensaje(msj){
    console.log(msj + " enviado a qmono");
    
    const codigoEstudiante = this.codigo;
    this.socket.emit('mensaje', {codigoEstudiante, msj});
    return this.socket;
  }

  setNombre(name){
    this.nombre = name;
  }
  setCodigo(code){
    this.codigo = code; 
  }

  getNombre(){
    return this.nombre;
  }

  getCodigo(){
    return this.codigo;
  }

  
  limpiarProfe(){
    this.id_profe = "";
    this.nombreProfe = "";
  }

  limpiarMateria(){
    this.clave_materia = "";
    this.nombre_materia = "";
  }

  limpiarTodo(){
    this.nombre = "";
    this.codigo = "";
    this.clave_materia = "";
    this.nombre_materia = "";
    this.id_profe = "";
    this.nombreProfe = "";
  }

  setCodigoProfe(I_profe){
    this.id_profe = I_profe;
  }

  setNombreProfe(N_profe){
    this.nombreProfe = N_profe;
  }

  setClaveMateria(clave_M){
    this.clave_materia = clave_M;
  }

  setNombreMateria(nombre_M){
    this.nombre_materia = nombre_M;
  }

  getNombreProfe(){
    if (this.nombreProfe.length){
      return this.nombreProfe;
    }else{
      return 0;
    }
  }

  getCodigoProfe(){
    if (this.id_profe.length){
      return this.id_profe;
    }else{
      return 0;
    }
  }

  getClaveMateria(){
    if (this.clave_materia.length){
      return this.clave_materia;
    }else{
      return 0;
    }
  }

  getNombreMateria(){
    if (this.nombre_materia.length){
      return this.nombre_materia;
    }else{
      return 0;
    }
  }

}