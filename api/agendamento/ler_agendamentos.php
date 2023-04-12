<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
require_once '../../models/agendamento.php';

$database = new Database();
$db = $database->connect();

$agendamento = new Agendamento($db);

$stmt = $agendamento->lerAgendamentos();
$linhas = $stmt->rowCount();

if ($linhas > 0) {
    $agendamentos_arr = array();

    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($linha);

        $agendamento_item = array(
            'id' => $id,
            'cliente_id' => $cliente_id,
            'cliente' => $cliente,
            'funcionario_id' => $cliente_id,
            'funcionario' => $funcionario,
            'texto' => $texto,
            'status' => $status,
            'data' => $data,
        );

        array_push($agendamentos_arr, $agendamento_item);
    }

    // set response code - 200 OK
    http_response_code(200);

    echo json_encode($agendamentos_arr, JSON_NUMERIC_CHECK);
} else {
    // set response code - 404 Not found
    http_response_code(404);

    echo json_encode(
        array("error_message" => "Nenhum agendamento foi encontrado.")
    );
}

?>