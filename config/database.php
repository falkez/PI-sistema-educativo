<?php

class Database
{
    private $host = 'localhost';
    private $db_name = 'educacao';
    private $username = 'root';
    private $password = '';

    // Conectar com o bando de dados
    public function connect()
    {
        $conn = null;

        try {
            $conn = new PDO('mysql:host=' . $this->host . ';dbname=' .
                $this->db_name . ';charset=utf8', $this->username, $this->password,
                array(PDO::MYSQL_ATTR_FOUND_ROWS => true));
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo 'Erro na conexão: ' . $exception->getMessage();
        }

        return $conn;
    }
}
