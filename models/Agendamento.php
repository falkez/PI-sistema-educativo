<?php

class Agendamento
{
    public $id;
    public $cliente;
    public $funcionario;
    public $texto;
    public $status;
    public $data;
    private $conn;
    private $table_name = 'agendamento';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function lerAgendamentos()
    {
        $query = "SELECT
            agendamento.id id,
            agendamento.cliente cliente_id,
            cliente.nome cliente,
            agendamento.funcionario funcionario_id,
            funcionario.nome funcionario,
            agendamento.texto texto,
            agendamento.status status,
            agendamento.data data
        FROM {$this->table_name}
        JOIN cliente ON cliente.id = agendamento.cliente
        JOIN funcionario ON funcionario.id = agendamento.funcionario";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function pesquisar($nome, $escola, $curso)
    {
        $select = 'SELECT
            canal.id,
            canal.nome,
            escola.nome AS escola,
            canal.id_escola,
            curso.nome AS curso,
            canal.id_curso,
            canal.serie
        FROM ' . $this->table_name;

        $leftJoin = $select . '
        LEFT JOIN escola ON canal.id_escola = escola.id
        LEFT JOIN curso ON canal.id_curso = curso.id';

        $rightJoin = $select . '
        RIGHT JOIN escola ON canal.id_escola = escola.id
        RIGHT JOIN curso ON canal.id_curso = curso.id';

        if ($nome != null) {
            $query = $leftJoin . '
            WHERE canal.nome LIKE :nome
            UNION
            ' . $rightJoin . '
            WHERE canal.nome LIKE :nome';

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nome', $nome);
        } else if ($escola != null) {
            $query = $leftJoin . '
            WHERE escola.nome LIKE :escola
            UNION
            ' . $rightJoin . '
            WHERE escola.nome LIKE :escola';

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':escola', $escola);
        } else if ($curso != null) {
            $query = $leftJoin . '
            WHERE curso.nome LIKE :curso
            UNION
            ' . $rightJoin . '
            WHERE curso.nome LIKE :curso';

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':curso', $curso);
        }

        $stmt->execute();

        return $stmt;
    }

    public function criar()
    {
        $query = "INSERT INTO {$this->table_name}
        SET texto = :texto, cliente = 1, funcionario = 1, status = \"Aguardando\"";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':texto', strip_tags($this->texto));

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function atualizar_status()
    {
        $query = "UPDATE {$this->table_name}
        SET status = :status
        WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->id = strip_tags($this->id);
        $this->status = strip_tags($this->status);

        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':status', $this->status);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function atualizar_agendamento()
    {
        $query = "UPDATE {$this->table_name}
        SET texto = :texto
        WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->id = strip_tags($this->id);
        $this->texto = strip_tags($this->texto);

        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':texto', $this->texto);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function deletar()
    {
        $query = "DELETE FROM {$this->table_name} WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->id = strip_tags($this->id);

        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }
}
