var XMLHttpRequest = require('xhr2');
var express = require('express'); 
const { once } = require('events');
var app = express();
var server = require('http').createServer(app);


const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


var port = process.env.PORT || 3001;


io.engine.on("connection_error", (err) => {
  console.log(err.req);      // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});

//socket.emit('pregunta', 'Puto');
io.sockets.on('connection', function(socket){
  console.log(socket.handshake.address);
  
  //-----------------------------------------------------------------------------------
  socket.on('login', function({user,pass}) {
    const req = new XMLHttpRequest();
    //leaveRoom(user);
    socket.join(user);
    console.log(user+ " se conecto al servidor");
    //login
    req.addEventListener("load", function() {
      console.log("Login: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+user);
      socket.emit(user+"login", req.responseText);
      
    });

    req.socket = socket;
    req.user = user;
    req.open("GET", `http://localhost/QAPP/loginAlumno.php?codigo=`+user+`&pass=`+pass);
    console.log(`http://localhost/QAPP/loginAlumno.php?codigo=`+user+`&pass=`+pass);
    req.send();
  });
  //-----------------------------------------------------------------------------------

  socket.on('registrar', function({codigo,correo,carrera,pass,nombre}) {
    const req = new XMLHttpRequest();
    console.log("registrar " + codigo);

    socket.join(codigo);

    
    req.addEventListener("load", function() {
      console.log("registrar: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigo);
      socket.emit(codigo+"registrar", req.responseText);
    });
    req.socket = socket;
    req.user = codigo;
    console.log(`http://localhost/QAPP/registroAlumno.php?codigo=`+codigo+`&pass=`+pass+`&correo=`+correo+`&carrera=`+carrera+`&nombre=`+nombre);
    req.open("GET", `http://localhost/QAPP/registroAlumno.php?codigo=`+codigo+`&pass=`+pass+`&correo=`+correo+`&carrera=`+carrera+`&nombre=`+nombre);
    req.send();
    //return this.http.get(`http://localhost/QAPP/registroAlumno.php?codigo=`+codigo+`&pass=`+pass+`&correo=`+correo+`&carrera=`+carrera+`&nombre=`+nombre);
  });
    //-----------------------------------------------------------------------------------

  socket.on('evaluarProfe', function({codigo,evaluacion}) {
    const req = new XMLHttpRequest();

    console.log("evaluarProfe " + evaluacion.codigoEstudiante); //CODIGO DA UNDEFINED
    console.log(evaluacion);
    console.log(`http://localhost/QAPP/registroEvaluarProfe.php?codigo_estudiante=`
    +evaluacion.codigoEstudiante+`&codigo_profe=`
    +evaluacion.codigoProfe+`&flexibilidad=`
    +evaluacion.flexibilidad+`&puntualidad=`
    +evaluacion.puntualidad+`&recomendado=`
    +evaluacion.recomendado+`&facilidad=`
    +evaluacion.facilidad+`&interes=`
    +evaluacion.interes);

    req.addEventListener("load", function() {
      console.log("evaluarProfe: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+ evaluacion.codigoEstudiante);
      socket.emit(evaluacion.codigoEstudiante+"evaluarProfe", req.responseText);
    });
    req.socket = socket;
    req.user = evaluacion.codigoEstudiante;
    
    req.open("GET", `http://localhost/QAPP/registroEvaluarProfe.php?codigo_estudiante=`
    +evaluacion.codigoEstudiante+`&codigo_profe=`
    +evaluacion.codigoProfe+`&flexibilidad=`
    +evaluacion.flexibilidad+`&puntualidad=`
    +evaluacion.puntualidad+`&recomendado=`
    +evaluacion.recomendado+`&facilidad=`
    +evaluacion.facilidad+`&interes=`
    +evaluacion.interes);
    req.send();
  });
    //-----------------------------------------------------------------------------------

  socket.on('obtenerEvaluacionProfe', function({codigoEstudiante,codigoProfe}) {
    const req = new XMLHttpRequest();
    console.log("obtenerEvaluacionProfe " + codigoEstudiante);
    req.addEventListener("load", function() {
      console.log("obtenerEvaluacionProfe: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigoEstudiante);
      socket.emit(codigoEstudiante+"obtenerEvaluacionProfe", req.responseText);
    });
    req.socket = socket;
    req.user = codigoEstudiante;
    console.log(`https://localhost/QAPP/obtenerEvaluacionProfe.php?codigoAlumno=`+codigoEstudiante+`&codigoProfe=`+codigoProfe);
    req.open("GET", `https://localhost/QAPP/obtenerEvaluacionProfe.php?codigoAlumno=`+codigoEstudiante+`&codigoProfe=`+codigoProfe);
    req.send();
   
  });
    //-----------------------------------------------------------------------------------
    socket.on('getProfes', function({codigo}) {
      const req = new XMLHttpRequest();
      console.log("getProfes " + codigo);
      req.addEventListener("load", function() {
        console.log("getProfes: OBTENIDO DE myslq:");
        console.log(req.responseText);
        console.log("Enviando a: "+codigo);
        socket.emit(codigo+"getProfes", req.responseText);
      });
      req.socket = socket;
      req.user = codigo;
      req.open("GET", `http://localhost/QAPP/obtenerProfes.php`);
      req.send();
    });
  //-----------------------------------------------------------------------------------
  socket.on('getMaterias', function({codigo}) {
    const req = new XMLHttpRequest();
    console.log("getMaterias " + codigo);
    req.addEventListener("load", function() {
      console.log("getMaterias: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigo);
      socket.emit(codigo+"Materias", req.responseText);
    });
    req.socket = socket;
    req.user = codigo;
    req.open("GET", `http://localhost/QAPP/obtenerMaterias.php`);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('getHorario', function(codigoEstudiante) {
    const req = new XMLHttpRequest();
    console.log("getHorario " + codigoEstudiante);
    req.addEventListener("load", function() {
      console.log("getHorario: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigoEstudiante);
      socket.emit(codigoEstudiante+"getHorario", req.responseText);
    });
    req.socket = socket;
    req.user = codigoEstudiante;
    req.open("GET", `http://localhost/QAPP/obtenerHorario.php?codigo=`+codigoEstudiante);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  
  socket.on('getDatosProfe', function({codigo,codigoEstudiante}) {
    const req = new XMLHttpRequest();
    console.log("getDatosProfe " + codigoEstudiante);
    console.log("codigo profe:" + codigo);
    req.addEventListener("load", function() {
      console.log("getDatosProfe: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigoEstudiante);
      socket.emit(codigoEstudiante+"getDatosProfe", req.responseText);
    });
    req.socket = socket;
    req.user = codigoEstudiante;
    req.open("GET", `http://localhost/QAPP/obtenerMateriasDeProfe.php?codigoProfe=`+codigo);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('getPromedioProfe', function({codigoProfe,codigoEstudiante}) {
    const req = new XMLHttpRequest();
    console.log("getPromedioProfe " + codigoEstudiante);
    req.addEventListener("load", function() {
      console.log("getPromedioProfe: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigoEstudiante);
      socket.emit(codigoEstudiante+"getPromedioProfe", req.responseText);
    });
    req.socket = socket;
    req.user = codigoEstudiante;
    req.open("GET", `http://localhost/QAPP/obtenerPromedioProfe.php?codigoProfe=`+codigoProfe);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('obtenerClases', function({materia,codigoEstudiante}) {
    const req = new XMLHttpRequest();
    console.log("obtenerClases " + codigoEstudiante);
    console.log(materia);
    req.addEventListener("load", function() {
      console.log("obtenerClases: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigoEstudiante);
      socket.emit(codigoEstudiante+materia, req.responseText);
    });
    req.socket = socket;
    req.user = codigoEstudiante;
    req.open("GET", `http://localhost/QAPP/obtenerClaseConMateria.php?materia=`+materia);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('setHorarioAlumno', function({codigo,nrc}) {
    const req = new XMLHttpRequest();
    console.log("setHorarioAlumno " + codigo);
    req.addEventListener("load", function() {
      console.log("setHorarioAlumno: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigo);
      socket.emit(codigo+"setHorarioAlumno", req.responseText);
    });
    req.socket = socket;
    req.user = codigo;
    req.open("GET", `http://localhost/QAPP/registroHorarioAlumno.php?codigo_alumno=`+codigo+`&nrc_clase=`+nrc);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('getHorarioAlumno', function({codigo}) {
    const req = new XMLHttpRequest();
    console.log("getHorarioAlumno " + codigo);
    req.addEventListener("load", function() {
      console.log("getHorarioAlumno: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigo);
      socket.emit(codigo+"getHorarioAlumno", req.responseText);
    });
    req.socket = socket;
    req.user = codigo;
    req.open("GET", `http://localhost/QAPP/obtenerHorarioAlumno.php?codigo_alumno=`+codigo);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('borrarHorario', function({codigo}) {
    const req = new XMLHttpRequest();
    console.log("borrarHorario " + codigo);
    req.addEventListener("load", function() {
      console.log("borrarHorario: OBTENIDO DE myslq:");
      console.log(req.responseText);
      console.log("Enviando a: "+codigo);
      socket.emit(codigo+"borrarHorario", req.responseText);
    });
    req.socket = socket;
    req.user = codigo;
    req.open("GET", `http://localhost/QAPP/eliminarHorarioAlumno.php?codigo_alumno=`+codigo);
    req.send();
  });
  //-----------------------------------------------------------------------------------
  socket.on('mensaje', function({codigoEstudiante, msj}) {
    console.log("mensaje " + msj + " de " + codigoEstudiante);
    let datos = [codigoEstudiante, msj];
    //socket.emit('pregunta', datos);
    io.emit('pregunta', datos);
    //preguntar(datos);
  
  });
  //-----------------------------------------------------------------------------------
  socket.on('respuesta', function(datos) {
    console.log("respuesta para " + datos[0]);
    io.emit('mensaje'+datos[0], datos)
  });
});

/*
// server-side
io.on("connection", (socket) => {
  console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
});



io.on("connection", function (socket) { 
    console.log("A new client has connected with the id " + socket.id + "i");
    socket.on("disconnect", function(){ 
        console.log("the client has disconnected!");
    });
    socket.on("Message", function(data) { 
        console.log(data.message);
        io.emit ("Message", data)
    });

    socket.on('message', function(data){
      console.log("mensaje recibido" +data);
    });

    socket.on('disconnect', function(){
        io.emit('users-changed', {user: socket.username, event: 'left'});  
      });
      socket.on('set-name', (name) => {
        socket.username = name;
        io.emit('users-changed', {user: name, event: 'joined'});    
      });
      
      socket.on('send-message', (message) => {
        io.emit('message', {msg: message.text, user: socket.username, createdAt: new Date()});    
      });
})*/

server.listen(port, function(){
     console.log("Listening on PORT" +port);
});