<?php
    include("include/db.php");
    
    $dato = $_GET["profe"]; 
    
    $sql = "INSERT INTO `PROFESOR`(`nombre`) VALUES ('$dato')";
    $sql2 = "SELECT `nombre` FROM `PROFESOR` WHERE `nombre` LIKE ('$dato')";
    
    $resultado=mysqli_query($conn,$sql2);
    
    /*while($row = mysqli_fetch_assoc($resultado)){
        
        echo $row['nombre'];
        //obtener sus datos con otra cconsulta
    }*/
    
    if(mysqli_num_rows($resultado)>0){
        //repetido
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