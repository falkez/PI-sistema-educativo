<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$stmt = $artista->lerAlunos();
$linhas = $stmt->rowCount();

if ($linhas > 0) {
    $instrumentos_arr = array();

    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($linha);

        $instrumento_item = array(
            'id' => $id,
            'nome' => $nome
        );

        array_push($instrumentos_arr, $instrumento_item);
    }

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($instrumentos_arr, JSON_NUMERIC_CHECK);
} else {
    // set response code - 404 Not found
    http_response_code(404);

    echo json_encode(
        array("error_message" => "Nenhum aluno foi encontrado.")
    );
}