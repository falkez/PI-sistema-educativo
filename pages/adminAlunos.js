import store from "../store.js";

export default {
    name: 'AdminAlunos',

    setup() {
        let modalAluno, modalConfirmApagar;
        let zoomScale = 1;

        return {store, modalAluno, modalConfirmApagar, zoomScale}
    },
    data() {
        return {
            alunoNome: '',
            alunoUsername: '',
            alunoSenha: '',
            idAlunoAtual: -1,
            modalTitle: '',
            pesquisa: '',
        }
    },
    methods: {
        lerAlunos: function () {
            axios.post('api/aluno/ler_alunos.php')
                .then(function (response) {
                    store.isAlunosFirstLoad = false;
                    store.alunos = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        pesquisarAlunos: function () {
            axios.post('api/aluno/pesquisar_alunos.php', {
                pesquisa: this.pesquisa
            })
                .then(function (response) {
                    store.alunos = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        abrirModal: function (item, action) {
            if (item) {
                store.alunoAtual = item;
            }
            store.action = action;

            switch (action) {
                case 'create':
                    this.modalTitle = "Adicionar aluno"

                    this.alunoNome = ''
                    this.alunoUsername = ''
                    this.alunoSenha = ''

                    document.getElementById("senha-input").setAttribute('placeholder', 'Senha');

                    break;
                case 'edit':
                    this.modalTitle = "Editar aluno"

                    this.alunoNome = item.nome
                    this.alunoUsername = item.username
                    this.alunoSenha = ''

                    document.getElementById("senha-input").setAttribute('placeholder', 'Senha (vazio para não alterar)');

                    this.idAlunoAtual = item.id;
                    break;
            }

            this.handleZoom('reset')
            this.modalAluno.show();
        },
        abrirModalApagar: function (id) {
            this.idAlunoAtual = id;
            this.modalConfirmApagar.show();
        },
        criarAluno: function () {
            let vue = this;

            axios.post('api/aluno/criar_aluno.php', {
                nome: this.alunoNome,
                username: this.alunoUsername,
                senha: this.alunoSenha
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        vue.lerAlunos();

                        vue.modalAluno.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        atualizarAluno: function () {
            let vue = this;

            let item = {
                id: this.idAlunoAtual,
                nome: this.alunoNome,
                username: this.alunoUsername,
                senha: this.alunoSenha
            }

            axios.put('api/aluno/atualizar_aluno.php', {
                item
            })
                .then(function (response) {
                    if (response.data === 1) {
                        for (let x of store.alunos) {
                            if (x.id === item.id) {
                                x.id = item.id;
                                x.nome = item.nome;
                                x.username = item.username

                                break;
                            }
                        }

                        vue.modalAluno.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        apagarAluno: function () {
            let id = this.idAlunoAtual;
            let vue = this;

            axios.delete('api/aluno/deletar_aluno.php', {
                data: {
                    id: id
                }
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        for (let x of store.alunos) {
                            if (x.id === id) {
                                store.alunos = store.alunos.filter(x => {
                                    return x.id !== id;
                                });
                                break;
                            }
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

            vue.modalConfirmApagar.hide();
        },
        alunoHandler: function () {
            if (this.alunoNome === '' || this.alunoUsername === '') {

                alert('Preencha todos os campos.');
            } else {
                switch (store.action) {
                    case 'create':
                        this.criarAluno();
                        break;
                    case 'edit':
                        this.atualizarAluno();
                        break;
                    default:
                        break;
                }
            }
        },
        toggleDark: function (mode) {
            let btnLightToggle = document.getElementById("btn-light-toggle");
            let btnDarkToggle = document.getElementById("btn-dark-toggle");

            if (mode === 'dark') {
                document.getElementById("dark").removeAttribute('media');
                btnLightToggle.classList.remove('btn-outline-dark');
                btnLightToggle.classList.add('btn-outline-light');
                btnDarkToggle.classList.remove('btn-outline-dark');
                btnDarkToggle.classList.add('btn-outline-light');
            } else {
                document.getElementById("dark").setAttribute('media', 'media="max-width: 1px"');
                btnLightToggle.classList.remove('btn-outline-light');
                btnLightToggle.classList.add('btn-outline-dark');
                btnDarkToggle.classList.remove('btn-outline-light');
                btnDarkToggle.classList.add('btn-outline-dark');
            }
        },
        handleZoom: function (zoomType) {
            let btnZoomMinus = document.getElementById('btn-zoom-minus');
            let btnZoomPlus = document.getElementById('btn-zoom-plus');

            if (zoomType === 'minus') {
                this.zoomScale = +this.zoomScale - 0.1;
            } else if (zoomType === 'plus') {
                this.zoomScale = +this.zoomScale  + 0.1;
            } else if (zoomType === 'reset') {
                this.zoomScale = 1.0;
            }

            if (this.zoomScale < 0.8) {
                this.zoomScale = 0.8;
            } else if (this.zoomScale > 1.5) {
                this.zoomScale = 1.8;
            }

            if (this.zoomScale == 0.8) {
                btnZoomMinus.setAttribute('disabled', '');
                btnZoomPlus.removeAttribute('disabled');
            } else if (this.zoomScale == 1.5) {
                btnZoomPlus.setAttribute('disabled', '');
                btnZoomMinus.removeAttribute('disabled');
            } else {
                btnZoomMinus.removeAttribute('disabled');
                btnZoomPlus.removeAttribute('disabled');
            }

            document.getElementById('zoomRange').value = this.zoomScale;

            if (zoomType !== 'reset') {
                document.body.style['transform'] = 'scale(' + this.zoomScale + ')';
            } else {
                document.body.style['transform'] = 'none';
            }
            document.body.style['transform-origin'] = '0 0';
        }
    },
    created() {
        this.lerAlunos();
    },
    mounted() {
        this.modalAluno = new bootstrap.Modal(document.getElementById("aluno-modal"))
        this.modalConfirmApagar = new bootstrap.Modal(document.getElementById("confirmModal"))
    },

    template: `
      <nav id="main-nav" class="navbar navbar-light bg-light">
      <form class="form-inline">
        <input class="form-control mr-sm-2" type="search"
               :placeholder="'Pesquisar'"
               aria-label="Pesquisar" v-model="pesquisa">
        <button class="btn btn-outline-success my-2 my-sm-0 mr-sm-2" type="button" title="Pesquisar"
                @click="pesquisarAlunos()">
          <i class="fa fa-search fa-1"></i>
        </button>
      </form>

      <button id="btn-light-toggle" class="btn btn-outline-dark my-2 my-sm-0 mr-sm-2" @click="toggleDark('light')"><i
          class="fa fa-sun fa-1"></i></button>
      <button id="btn-dark-toggle" class="btn btn-outline-dark my-2 my-sm-0 mr-sm-2" @click="toggleDark('dark')"><i
          class="fa fa-moon fa-1"></i></button>
      <button id="btn-zoom-minus" class="btn" @click="handleZoom('minus')"><i class="fa fa-minus-circle fa-1"></i>
      </button>
      <input type="range" class="custom-range" min="0.8" max="1.5" step="0.1" id="zoomRange" v-model="this.zoomScale"
             @change="handleZoom()">
      <button id="btn-zoom-plus" class="btn" @click="handleZoom('plus')"><i class="fa fa-plus-circle fa-1"></i></button>
      </nav>
      <main role="main" class="container extra-bottom">
      <h1 class="mt-5">Alunos</h1>

      <div class="container">

        <!-- Button trigger modal -->
        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-success btn-sm" @click="abrirModal(null, 'create')">
            Adicionar aluno
          </button>
        </div>

        <div class="modal fade" id="aluno-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">{{ modalTitle }}</h5>
              </div>

              <div class="modal-body">
                <div class="input-group mb-3">
                  <div class="row-container">
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Nome</span>
                      <input type="text" class="form-control" placeholder="Nome"
                             v-model="alunoNome">
                    </div>
                  </div>
                  <div class="row-container">
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Username</span>
                      <input type="text" class="form-control" placeholder="Username"
                             v-model="alunoUsername">
                    </div>
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Senha</span>
                      <input id="senha-input" type="password" class="form-control" placeholder="Senha"
                             v-model="alunoSenha">
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalAluno.hide()">Fechar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="alunoHandler()">Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista artistas -->
      <div class="container table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th class="col-nome">Nome</th>
            <th class="update"></th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="item in store.alunos">
            <td class="col-nome">{{ item.nome }}</td>
            <td class="btn-container">
              <button type="button" class="btn btn-outline-info btn-sm" @click="abrirModal(item, 'edit')"
                      title="Editar">
                <i class="fa fa-pen fa-1"></i>
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm remove" title="Apagar"
                      @click="abrirModalApagar(item.id)"><i class="fa fa-trash fa-1"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal confirm -->
      <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
           aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-confirm" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">Apagar Aluno</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body modal-confirm">
              Deseja apagar esse aluno?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="apagarAluno()">Sim</button>
            </div>
          </div>
        </div>
      </div>

      </main>
    `,
};