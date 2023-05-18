<?php
    include("include/db.php");
    
    $codigo_alumno = $_GET["codigo_alumno"];
    
    $sql = "DELETE FROM `CURSA` WHERE `codigo_alumno` Like ('$codigo_alumno')";
    
 
    if(mysqli_query($conn,$sql)){
       //se elimino bien
       echo "1";
       
    }else{
        //ocurrio un error y no se guardo
        echo "0";
           
    }
   mysqli_close($conn);
    
?>