<?php
    include("include/db.php");
    
    $nrc = $_GET["nrc"]; 
    $seccion = $_GET["seccion"];
    $horario =$_GET["horario"];
    $clave_materia =$_GET["clave_materia"];
    $codigo_profesor=$_GET["codigo_profesor"];
    $ciclo=$_GET["ciclo"];
    
    $sql = "INSERT INTO `CLASE`(`nrc`,`seccion`,`horario`,`clave_materia`,`codigo_profesor`,`ciclo`) VALUES ('$nrc','$seccion','$horario','$clave_materia',(SELECT `codigo` FROM `PROFESOR` WHERE `nombre` LIKE ('$codigo_profesor')),'$ciclo')";
    $sql2 = "SELECT `nrc` FROM `CLASE` WHERE `nrc` LIKE ('$nrc')";
    
    $resultado=mysqli_query($conn,$sql2);
    
    /*while($row = mysqli_fetch_assoc($resultado)){
        
        echo $row['nombre'];
        //obtener sus datos con otra cconsulta
    }*/
    
    if(mysqli_num_rows($resultado)>0){
        //repetido
        //actualizar cupos
        echo "0";
    }else{
    //no encontro al profe y lo guardo en el bolsillo
        if(mysqli_query($conn,$sql)){
            //se agrego bien
            echo "1";
        }else{
        //ocurrio un error y no se guardo
            echo "0";
        }
    }
    
    mysqli_close($conn);
    
?>