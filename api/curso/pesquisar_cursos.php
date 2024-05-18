<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $artista->pesquisarCurso($data['pesquisa']);
$linhas = $stmt->rowCount();

if ($linhas > 0) {
    $artistas_arr = array();

    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($linha);

        $artista_item = array(
            'id' => $id,
            'nome' => $nome,
            'descricao' => $descricao
        );

        array_push($artistas_arr, $artista_item);
    }

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($artistas_arr, JSON_NUMERIC_CHECK);
} else {
    // set response code - 404 Not found
    http_response_code(404);

    echo json_encode(
        array("error_message" => "Nenhum curso foi encontrado.")
    );
}


?>