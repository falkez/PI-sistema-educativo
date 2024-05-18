<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id'])) {
    $artista->id = $data['id'];
} else {
    // set response code - 400 bad request
    http_response_code(400);

    // Informações incompletas
    echo -1;
    return;
}

if ($artista->deletarCurso()) {
    // set response code - 200 ok
    http_response_code(200);

    echo 1;
} else {
    // set response code - 503 service unavailable
    http_response_code(503);

    echo 0;
}
