<?php
    include("include/db.php");
    
    $codigo = $_GET["codigo"];
    
    
    $sql = 
    "
    SELECT `t1`.`nombre`, `t2`.`horario`
    FROM `MATERIA` AS `t1` 
	    INNER JOIN `CLASE` AS `t2` ON `t2`.`clave_materia` = `t1`.`clave`
        INNER JOIN	`CURSA` AS `t3` ON `t3`.`nrc_clase` = `t2`.`nrc`
    WHERE `t3`.`codigo_alumno` LIKE ('$codigo');
    ";
    
    $resultado=mysqli_query($conn,$sql);
    
    $datos=array();
    
   if(mysqli_num_rows($resultado)>0){
       while($row = mysqli_fetch_assoc($resultado)){
            $datos[] = $row;
        }
        echo json_encode($datos);
   }else{
    //no hay materias
    echo 0;
   }
   mysqli_close($conn);
    
?>