<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
require_once '../../models/SistemaEscolar.php';

$database = new Database();
$db = $database->connect();

$artista = new SistemaEscolar($db);

$data = json_decode(file_get_contents("php://input"), true);

$user = '';
$senha = '';

if (!empty($data['user']) &&
    !empty($data['senha'])){
    $user = $data['user'];
    $senha = $data['senha'];
} else {
    // set response code - 400 bad request
    http_response_code(400);

    // Informações incompletas
    echo -1;
    return;
}

$stmt = $artista->login($user, $senha);
$linhas = $stmt->rowCount();

if ($linhas > 0) {
    $artistas_arr = array();

    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($linha);

        $artista_item = array(
            'id' => $id,
            'accessId' => $accessId
        );

        array_push($artistas_arr, $artista_item);
    }

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($artistas_arr, JSON_NUMERIC_CHECK);
} else {
    $artistas_arr = array();

    $artista_item = array(
        'id' => -1,
        'accessId' => -1
    );

    array_push($artistas_arr, $artista_item);

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($artistas_arr, JSON_NUMERIC_CHECK);
}

?>