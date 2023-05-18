<?php
    include("include/db.php");
    
    $materia = $_GET["materia"];
    
    $sql = "SELECT T1.nrc, T1.horario, T2.nombre, T2.codigo FROM `CLASE` AS T1 INNER JOIN `PROFESOR` AS T2 ON T1.codigo_profesor = T2.codigo WHERE T1.clave_materia LIKE '$materia'";
    
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