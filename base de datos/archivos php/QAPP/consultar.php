<?php

    include("include/db.php");
    
    $sql = "SELECT * FROM `tabla`";
    
    $resul = mysqli_query($conn,$sql);
    
    $datos=array();
    
    if(mysqli_num_rows($resul)>0){
        while($row = mysqli_fetch_assoc($resul)){
            $datos[]=$row;
        }
    }
    
    
    echo json_encode($datos);
    
    

?>