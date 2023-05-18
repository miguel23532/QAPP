<?php
    include("include/db.php");
    
    //$nrc = $_GET["nrc"];
    
    $sql = "SELECT * FROM `PROFESOR`";
    
    $resultado=mysqli_query($conn,$sql);
    
    $datos=array();
    
   if(mysqli_num_rows($resultado)>0){
       while($row = mysqli_fetch_assoc($resultado)){
            //obtener cada uno y guardarlo
            $datos[] = $row;
        }
        echo json_encode($datos);
   }else{
    //no hay profes
    echo 0;
   }
   mysqli_close($conn);
    
?>