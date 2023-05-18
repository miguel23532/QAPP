<?php

    include("include/db.php");
    
    $codigo = $_GET["codigo"];
    $pass   = utf8_encode($_GET["pass"]);
    
    $sql = "SELECT * FROM `ALUMNO` WHERE `codigo` LIKE ('$codigo') AND `password` LIKE ('$pass')";
    
    $resultado=mysqli_query($conn,$sql);
    
    
   if(mysqli_num_rows($resultado)>0){
        while ($row = $resultado->fetch_assoc()) {
           echo json_encode($row);
        }
        
   }else{
    echo 0;
   }
   mysqli_close($conn);
    
?>