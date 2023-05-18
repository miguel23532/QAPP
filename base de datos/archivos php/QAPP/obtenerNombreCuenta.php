<?php
    include("include/db.php");
    
    $codigo = $_GET["codigo"];
    
    $sql = "SELECT `nombre` FROM `ALUMNO` WHERE `codigo` LIKE ('$codigo')";
    
    $resultado=mysqli_query($conn,$sql);
    
    
   if(mysqli_num_rows($resultado)>0){
       while ($row = $resultado->fetch_assoc()) {
           echo $row['nombre'];
        }
   }else{
    //no hay 
    echo 0;
   }
   mysqli_close($conn);
    
?>