<?php
    include("include/db.php");
    

    $codigo = $_GET["codigo"];
    $nombre = utf8_encode($_GET["nombre"]);
    $correo   = $_GET["correo"];
    $carrera   = $_GET["carrera"];
    $pass   = utf8_encode($_GET["pass"]);
    
    $sql= "SELECT * FROM `ALUMNO` WHERE `codigo` LIKE ('$codigo') ";
    $sql2 = "INSERT INTO `ALUMNO` (`nombre`,`codigo`,`correo`,`carrera`,`password`) VALUES ('$nombre','$codigo','$correo','$carrera','$pass')";
    
    $resultado=mysqli_query($conn,$sql);
    
    
   if(mysqli_num_rows($resultado)>0){
       //ya existe
        echo 2;
        
   }else{
       //No existe y ase agrega
       if(mysqli_query($conn,$sql2)){
           //se agrego bien
           echo "1";
           
       }else{
           //ocurrio un error y no se guardo
           echo "0";
           
       }
   }
   mysqli_close($conn);
    
?>