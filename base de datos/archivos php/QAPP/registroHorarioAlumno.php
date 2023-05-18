<?php
    include("include/db.php");
    
    $codigo_alumno = $_GET["codigo_alumno"];
    $nrc_clase = $_GET["nrc_clase"];
    
    $sql = "INSERT INTO `CURSA` (`codigo_alumno`,`nrc_clase`) VALUES ('$codigo_alumno','$nrc_clase')";
    
 
    if(mysqli_query($conn,$sql)){
       //se agrego bien
       echo "1";
       
    }else{
        //ocurrio un error y no se guardo
        echo "0";
           
    }
   mysqli_close($conn);
    
?>