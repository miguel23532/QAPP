<?php
    include("include/db.php");
    
    $codigoProfe = $_GET["codigoProfe"];
    
    
    $sql = "SELECT DISTINCT T1.nombre, T1.clave, T1.creditos FROM `MATERIA` AS T1 INNER JOIN `CLASE` AS T2 ON T1.clave = T2.clave_materia WHERE T2.codigo_profesor LIKE '$codigoProfe'";
    
    //SELECT DISTINCT
    
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