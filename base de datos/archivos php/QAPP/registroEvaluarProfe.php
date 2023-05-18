<?php
    include("include/db.php");
    
    $codigo_estudiante =$_GET["codigo_estudiante"];
    $codigo_profe =$_GET["codigo_profe"];
    $flexibilidad = $_GET["flexibilidad"];
    $puntualidad =$_GET["puntualidad"];
    $recomendado =$_GET["recomendado"];
    $facilidad  = $_GET["facilidad"];
    $interes =$_GET["interes"];
    
    
    $sql = "SELECT * FROM `EVALUA` WHERE `codigo_profesor` LIKE ('$codigo_profe') and `codigo_alumno` LIKE ('$codigo_estudiante')" ;
;
    $sql2 = "INSERT INTO `EVALUA` (`codigo_alumno`,`codigo_profesor`,`flexibilidad`,`puntualidad`,`recomendado`,`facilidad`,`interes`) VALUES ('$codigo_estudiante','$codigo_profe','$flexibilidad','$puntualidad','$recomendado','$facilidad','$interes')";
    
    $resultado=mysqli_query($conn,$sql);
    
    
   if(mysqli_num_rows($resultado)>0){
       //ya existe
       $sql3="UPDATE `EVALUA` SET `codigo_alumno` = '$codigo_estudiante', `codigo_profesor` = '$codigo_profe', `flexibilidad` = '$flexibilidad', `puntualidad` = '$puntualidad', `recomendado` = '$recomendado', `facilidad` = '$facilidad', `interes` = '$interes' WHERE `codigo_alumno` LIKE $codigo_estudiante AND `codigo_profesor` LIKE $codigo_profe";
        if(mysqli_query($conn,$sql3)){
           //se actualizó bien
           echo "2";
           
        }else{
           //ocurrio un error y no se actualizó
           echo "0.0";
           
        }
        
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