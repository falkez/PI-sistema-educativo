<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/database.php';
require_once '../../models/agendamento.php';

$database = new Database();
$db = $database->connect();

$agendamento = new Agendamento($db);

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id']) &&
    !empty($data['status'])) {
    $agendamento->id = $data['id'];
    $agendamento->status = $data['status'];
} else {
    // set response code - 400 bad request
    http_response_code(400);

    // Informações incompletas
    echo -1;
    return;
}

switch ($agendamento->status) {
    case "Aguardando":
        $agendamento->status = "Em andamento";
        break;
    case "Em andamento":
        $agendamento->status = "Finalizado";
        break;
    default:
        $agendamento->status = "Aguardando";
        break;
}

if ($agendamento->atualizar_status()) {
    // set response code - 201 created
    http_response_code(201);

    // Atualizado com sucesso
    echo $agendamento->status;
} else {
    // set response code - 503 service unavailable
    http_response_code(503);

    // Não foi possível atualizar
    echo 0;
}
