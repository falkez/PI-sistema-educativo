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

if (!empty($data['userDest'])
    && !empty($data['texto'])
    && !empty($data['idUser'])
    && !empty($data['parentId'])){

    $artista->user_dest = $data['userDest'];
    $artista->texto = $data['texto'];
    $artista->id_user = $data['idUser'];
    $artista->parent_id = $data['parentId'];
} else {
    // set response code - 400 bad request
    http_response_code(400);

    // Informações incompletas
    echo -1;
    return;
}

if ($artista->criarMensagem()) {
    // set response code - 201 created
    http_response_code(201);

    // Criado com sucesso
    echo 1;
} else {
    // set response code - 503 service unavailable
    http_response_code(503);

    // Não foi possível criar
    echo 0;
}
