<?php
    include("include/db.php");
    
    $dato = $_GET["loquequieras"]; 
    
    $sql = "INSERT INTO `tabla`(`loqueasea`) VALUES ('$dato')";
    
    if(mysqli_query($conn,$sql)){
        echo "1";
    }else{
    //ocurrio un error y no se guardo
        echo "0";
    }
    
    mysqli_close($conn);
    
?>