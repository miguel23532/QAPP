<?php
    include("include/db.php");
    
    $codigoProfe = $_GET["codigoProfe"];
    
    $sql = "SELECT AVG(`flexibilidad`),AVG(`puntualidad`),AVG(`recomendado`),AVG(`facilidad`),AVG(`interes`),COUNT(`codigo_profesor`) FROM `EVALUA` WHERE `codigo_profesor` LIKE ('$codigoProfe')";
    
    
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