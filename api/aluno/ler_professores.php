<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$stmt = $artista->lerProfessores();
$linhas = $stmt->rowCount();

if ($linhas > 0) {
    $categorias_arr = array();

    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($linha);

        $categoria_item = array(
            'id' => $id,
            'nome' => $nome,
            'username' => $username
        );

        array_push($categorias_arr, $categoria_item);
    }

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($categorias_arr, JSON_NUMERIC_CHECK);
} else {
    // set response code - 404 Not found
    http_response_code(404);

    echo json_encode(
        array("error_message" => "Nenhum professor foi encontrado.")
    );
}

?>