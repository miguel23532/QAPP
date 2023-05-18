<?php
    include("include/db.php");
    
    $nombre = $_GET["nombre"]; 
    $clave = $_GET["clave"];
    $carrera =$_GET["carrera"];
    $creditos =$_GET["creditos"];
    
    $sql = "INSERT INTO `MATERIA`(`nombre`,`clave`,`creditos`) VALUES ('$nombre','$clave','$creditos')";
    $sql2 = "SELECT `clave` FROM `MATERIA` WHERE `clave` LIKE ('$clave')";
    $sql4= "INSERT INTO `CAR_MAT`(`fk_mat`,`fk_car`) VALUES ('$clave','$carrera')";
    $resultado=mysqli_query($conn,$sql2);
    
    /*while($row = mysqli_fetch_assoc($resultado)){
        
        echo $row['nombre'];
        //obtener sus datos con otra cconsulta
    }*/
    
    if(mysqli_num_rows($resultado)>0){
        //repetido
        $noexiste=true;
        $sql3="SELECT `fk_car` FROM `CAR_MAT` WHERE `fk_mat` LIKE ('$clave')";
        $resultado2=mysqli_query($conn,$sql3);
        while($row = mysqli_fetch_assoc($resultado2)){
            if($row['fk_car']==$carrera){
                $noexiste=false;
            }
        }
        if($noexiste){
            if(mysqli_query($conn,$sql4)){
                echo "1";
            }else{
                echo "0";
            }
            
        }else{
            echo "0";
        }
    }else{
    //no encontro al profe y lo guardo en el bolsillo
        if(mysqli_query($conn,$sql)){
            //se agrego bien
            if(mysqli_query($conn,$sql4)){
                echo "1";
            }else{
                echo "0";
            }
        }else{
        //ocurrio un error y no se guardo
            echo "0";
        }
    }
    
    mysqli_close($conn);
    
?>