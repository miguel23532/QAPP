<?php

    //datos del servidor de prueba
    $servidor = "localhost";
    $usuario = "root";
    //$pass = "6P59P5#W%2shz&3i";
    $pass = "";
    $bd = "basededatosdelaoferta";
    
    $conn = mysqli_connect($servidor,$usuario,$pass,$bd);
    mysqli_query($conn, 'SET NAMES utf8');
?>