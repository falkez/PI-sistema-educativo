<?php

class SistemaEscolar
{
    public $id;
    public $id_user;
    public $user_dest;
    public $parent_id;
    public $id_curso;
    public $nome;
    public $descricao;
    public $texto;
    public $username;
    public $senha;

    private $conn;
    private $table_name = 'curso';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function login($user, $senha)
    {
        $query = "SELECT
            user.id as id,
            user.id_acesso as accessId
        FROM user
        WHERE user.username = :user
        AND user.senha = :senha";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user', $user);
        $stmt->bindValue(':senha', $senha);

        $stmt->execute();

        return $stmt;
    }

    public function lerCursos()
    {
        $query = "SELECT
            curso.id as id,
            curso.nome as nome,
            curso.descricao as descricao
        FROM curso";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function lerCursosProfessor()
    {
        $query = "SELECT
            c.id as id,
            c.nome as nome,
            c.descricao as descricao
        FROM curso c
        JOIN matricula m on c.id = m.id_curso
        WHERE m.id_user = :id_user";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);

        $stmt->execute();

        return $stmt;
    }

    public function lerCursosByUser()
    {
        $query = "SELECT
            curso.id as id,
            curso.nome as nome,
            curso.descricao as descricao
        FROM curso
        JOIN matricula m on curso.id = m.id_curso
        WHERE m.id_user = :id_user";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);

        $stmt->execute();

        return $stmt;
    }

    public function lerCursosAlunoSemMatricula($id_cursos)
    {
        if (!$id_cursos) {
            $query = "SELECT
                curso.id as id,
                curso.nome as nome,
                curso.descricao as descricao
            FROM curso";
        } else {
            $id_cursos = implode(',',array_map('intval', $id_cursos));

            $query = "SELECT
                curso.id as id,
                curso.nome as nome,
                curso.descricao as descricao
            FROM curso
            WHERE curso.id NOT IN ($id_cursos)";
        }

        $stmt = $this->conn->prepare($query);

        $stmt->execute();

        return $stmt;
    }

    public function lerProfessores()
    {
        $query = "SELECT
            user.id as id,
            user.nome as nome,
            user.username as username
        FROM user
        WHERE user.id_acesso = 2
        ORDER BY user.nome";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function lerAlunos()
    {
        $query = "SELECT
            user.id as id,
            user.nome as nome,
            user.username as username
        FROM user
        WHERE user.id_acesso = 3
        ORDER BY user.nome";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function lerMensagens($user_dest)
    {
        $query = "SELECT
            m.id as id,
            m.texto as texto,
            m.id_user as remetente,
            u.nome as remetenteFullName,
            m.id_user_dest as userDestId,
            m.parent_id as parentId,
            m.data as data,
            (SELECT texto FROM mensagem WHERE id = parentId) as textoAnterior
        FROM mensagem m
        JOIN user u
        ON u.id = m.id_user
        WHERE m.id_user_dest = :id_user_dest
        ORDER BY m.data DESC";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user_dest', (int)$user_dest);

        $stmt->execute();

        return $stmt;
    }

    public function lerUsers()
    {
        $query = "SELECT
            id as id,
            nome as nome
        FROM user
        WHERE id != :id_user
        AND id_acesso != 1
        ORDER BY nome";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);

        $stmt->execute();

        return $stmt;
    }

    public function pesquisarCurso($pesquisa)
    {
        $query = "SELECT
            curso.id as id,
            curso.nome as nome,
            curso.descricao as descricao
        FROM curso
        WHERE curso.nome LIKE :pesquisa";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':pesquisa', '%' . strip_tags($pesquisa) . '%');

        $stmt->execute();

        return $stmt;
    }

    public function pesquisarCursoProfessor($pesquisa)
    {
        $query = "SELECT
            c.id as id,
            c.nome as nome,
            c.descricao as descricao
        FROM curso c
        JOIN matricula m on c.id = m.id_curso
        WHERE m.id_user = :id_user
        AND c.nome LIKE :pesquisa";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);
        $stmt->bindValue(':pesquisa', '%' . strip_tags($pesquisa) . '%');

        $stmt->execute();

        return $stmt;
    }

    public function pesquisarProfessor($pesquisa)
    {
        $query = "SELECT
            user.id as id,
            user.nome as nome,
            user.username as username
        FROM user
        WHERE user.id_acesso = 2 AND user.nome LIKE :pesquisa";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':pesquisa', '%' . strip_tags($pesquisa) . '%');

        $stmt->execute();

        return $stmt;
    }

    public function pesquisarAluno($pesquisa)
    {
        $query = "SELECT
            user.id as id,
            user.nome as nome,
            user.username as username
        FROM user
        WHERE user.id_acesso = 3 AND user.nome LIKE :pesquisa";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':pesquisa', '%' . strip_tags($pesquisa) . '%');

        $stmt->execute();

        return $stmt;
    }

    public function criarCurso()
    {
        $query = "INSERT INTO curso
        SET nome = :nome, descricao = :descricao";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':nome', strip_tags($this->nome));
        $stmt->bindParam(':descricao', strip_tags($this->descricao));

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function matricula()
    {
        $query = "INSERT INTO matricula
        SET id_user = :id_user, id_curso = :id_curso";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);
        $stmt->bindParam(':id_curso', $this->id_curso);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function criarMensagem()
    {
        $query = "INSERT INTO mensagem
        SET texto = :texto, id_user = :id_user, id_user_dest = :id_user_dest, parent_id = :parent_id";

        $stmt = $this->conn->prepare($query);

        $texto = strip_tags($this->texto);

        $stmt->bindParam(':texto', $texto);
        $stmt->bindValue(':id_user', (int)$this->id_user);
        $stmt->bindParam(':id_user_dest', $this->user_dest);
        $stmt->bindParam(':parent_id', $this->parent_id);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function criarProfessor()
    {
        $query = "INSERT INTO user
        SET nome = :nome, id_acesso = 2, username = :username, senha = :senha";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':nome', strip_tags($this->nome));
        $stmt->bindParam(':username', strip_tags($this->username));
        $stmt->bindParam(':senha', strip_tags($this->senha));

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function criarAluno()
    {
        $query = "INSERT INTO user
        SET nome = :nome, id_acesso = 3, username = :username, senha = :senha";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':nome', strip_tags($this->nome));
        $stmt->bindParam(':username', strip_tags($this->username));
        $stmt->bindParam(':senha', strip_tags($this->senha));

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function atualizarCurso()
    {
        $query = "UPDATE curso
        SET nome = :nome, descricao = :descricao
        WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':descricao', $this->descricao);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function atualizarProfessor()
    {
        $query = "";

        if ($this->senha == "") {
            $query = "UPDATE user
            SET nome = :nome, username = :username
            WHERE id = :id";
        } else {
            $query = "UPDATE user
            SET nome = :nome, username = :username, senha = :senha
            WHERE id = :id";
        }


        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id', $this->id);
        $stmt->bindValue(':nome', strip_tags($this->nome));
        $stmt->bindValue(':username', strip_tags($this->username));
        if ($this->senha != "") {
            $stmt->bindValue(':senha', strip_tags($this->senha));
        }

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function atualizarAluno()
    {
        $query = "";

        if ($this->senha == "") {
            $query = "UPDATE user
            SET nome = :nome, username = :username
            WHERE id = :id";
        } else {
            $query = "UPDATE user
            SET nome = :nome, username = :username, senha = :senha
            WHERE id = :id";
        }


        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id', $this->id);
        $stmt->bindValue(':nome', strip_tags($this->nome));
        $stmt->bindValue(':username', strip_tags($this->username));
        if ($this->senha != "") {
            $stmt->bindValue(':senha', strip_tags($this->senha));
        }

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function deletarCurso()
    {
        $query = "DELETE FROM matricula 
        WHERE id_curso = :id_curso;

        DELETE FROM curso 
        WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id_curso', $this->id);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function deletarProfessor()
    {
        $query = "DELETE FROM matricula 
        WHERE id_user = :id;

        DELETE FROM user WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function deletarAluno()
    {
        $query = "DELETE FROM matricula 
        WHERE id_user = :id;

        DELETE FROM user WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }

    public function cancelarMatricula()
    {
        $query = "DELETE FROM matricula
        WHERE id_user = :id_user
        AND id_curso = :id_curso";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id_user', (int)$this->id_user);
        $stmt->bindParam(':id_curso', $this->id_curso);

        if ($stmt->execute()) {
            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }
}
