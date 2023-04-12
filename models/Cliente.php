<?php

class Cliente
{
    public $id;
    public $nome;
    private $conn;
    private $table_name = 'cliente';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function verificar()
    {
        $query = 'SELECT senha
        FROM ' . $this->table_name . '
        WHERE (CAST(rm AS CHAR)) = :login OR email = :login
        LIMIT 0,1';

        $stmt = $this->conn->prepare($query);

        $this->login = strip_tags($this->login);
        $this->senha = strip_tags($this->senha);

        $stmt->bindParam(':login', $this->login);

        if ($stmt->execute()) {
            if ($stmt->rowCount() != 1) {
                return false;
            }

            $linha = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->senhaDb = $linha['senha'];

            return AuthUtil::checarSenha($this->senha, $this->senhaDb);
        }

        return false;
    }

    public function lerUnico()
    {
        $query = 'SELECT
            rm,
            user.nome,
            email,
            escola.nome AS escola,
            user.id_escola,
            curso.nome AS curso,
            user.id_curso,
            serie,
            data_cadastro
        FROM ' . $this->table_name . '
        JOIN curso ON user.id_curso = curso.id
        JOIN escola ON user.id_escola = escola.id
        WHERE rm = :login OR email = :login
        LIMIT 0,1';

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':login', $this->login);
        $stmt->execute();

        $linha = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->rm = $linha['rm'];
        $this->nome = $linha['nome'];
        $this->email = $linha['email'];
        $this->escola = $linha['escola'];
        $this->id_escola = $linha['id_escola'];
        $this->curso = $linha['curso'];
        $this->id_curso = $linha['id_curso'];
        $this->serie = $linha['serie'];
        $this->data_cadastro = DateUtil::getDataFormatada($linha['data_cadastro']);
    }

    public function lerConta()
    {
        $query = 'SELECT
            user.nome,
            escola.nome AS escola,
            user.id_escola,
            curso.nome AS curso,
            user.id_curso,
            serie
        FROM ' . $this->table_name . '
        JOIN curso ON user.id_curso = curso.id
        JOIN escola ON user.id_escola = escola.id
        WHERE rm = :rm
        LIMIT 0,1';

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':rm', $this->rm);
        $stmt->execute();

        $linha = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->nome = $linha['nome'];
        $this->escola = $linha['escola'];
        $this->id_escola = $linha['id_escola'];
        $this->curso = $linha['curso'];
        $this->id_curso = $linha['id_curso'];
        $this->serie = $linha['serie'];
    }

    public function atualizarUltimoLogin($rm)
    {
        $query = 'UPDATE ' . $this->table_name . '
        SET ultimo_login = NOW()
        WHERE rm = :rm';

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':rm', $rm);
        $stmt->execute();
    }

    public function cadastrar($cdg)
    {
        $voucher = new VoucherUser($this->conn);
        $voucher->cdg = $cdg;

        if (!$voucher->verificar($cdg)) {
            return false;
        }
        $voucher->lerUnico();

        $queryCadastrar = 'INSERT INTO ' . $this->table_name . '(
            rm,
            nome,
            email,
            senha,
            id_escola,
            id_curso,
            serie
        )
        VALUES(
            :rm,
            :nome,
            :email,
            :senha,
            :id_escola,
            :id_curso,
            :serie
        )';

        $this->senha = AuthUtil::criptografar($this->senha);

        $stmt = $this->conn->prepare($queryCadastrar);
        $stmt->bindParam(':rm', $this->rm);
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':senha', $this->senha);
        $stmt->bindParam(':id_escola', $voucher->id_escola);
        $stmt->bindParam(':id_curso', $voucher->id_curso);
        $stmt->bindParam(':serie', $voucher->serie);

        if ($stmt->execute()) {
            $queryAtualizarVoucher = 'UPDATE voucher_user
            SET status = 0
            WHERE id = :id';

            $stmt = $this->conn->prepare($queryAtualizarVoucher);
            $stmt->bindParam(':id', $voucher->id);
            $stmt->execute();

            $enquete = new Enquete($this->conn);
            $enquete->criarTracker($this->rm);

            return true;
        }

        // Se houver algum erro
        printf("Erro: %s.\n", $stmt->error);
        return false;
    }
}
