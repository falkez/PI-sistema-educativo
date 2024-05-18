<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$data = json_decode(file_get_contents("php://input"), true);

if (!is_null($data['item']['id'])
    && !is_null($data['item']['nome'])
    && !is_null($data['item']['username'])
    && !is_null($data['item']['senha'])){

    $artista->id = $data['item']['id'];
    $artista->nome = $data['item']['nome'];
    $artista->username = $data['item']['username'];
    $artista->senha = $data['item']['senha'];
} else {
    // set response code - 400 bad request
    http_response_code(400);

    // Informações incompletas
    echo -1;
    return;
}

if ($artista->atualizarAluno()) {
    // set response code - 201 created
    http_response_code(201);

    // Atualizado com sucesso
    echo 1;
} else {
    // set response code - 503 service unavailable
    http_response_code(503);

    // Não foi possível atualizar
    echo 0;
}
