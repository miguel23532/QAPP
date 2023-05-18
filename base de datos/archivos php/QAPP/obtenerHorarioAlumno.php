<?php
    include("include/db.php");
    
    $codigo_alumno = $_GET["codigo_alumno"];
    
    
    $sql = "SELECT T1.nrc_clase, T2.clave_materia FROM `CURSA` AS T1 INNER JOIN `CLASE` AS T2 ON T1.nrc_clase = T2.nrc WHERE `codigo_alumno` LIKE ('$codigo_alumno')";
    
    $resultado=mysqli_query($conn,$sql);
    
    $datos=array();
    
   if(mysqli_num_rows($resultado)>0){
       while($row = mysqli_fetch_assoc($resultado)){
            //obtener cada uno y guardarlo
            $datos[] = $row;
        }
        echo json_encode($datos);
   }else{
    //no hay materias
    echo 0;
   }
   mysqli_close($conn);
    
?>