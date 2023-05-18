<?php
    include("include/db.php");
    
    $carrera = $_GET["carrera"];
    
    $sql = "SELECT T1.nombre, T1.clave, T1.creditos, T2.fk_car FROM `MATERIA` AS T1 INNER JOIN `CAR_MAT` AS T2 ON T1.clave = T2.fk_mat WHERE T2.fk_car LIKE '$carrera'";
    
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