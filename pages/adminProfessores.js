import store from "../store.js";

export default {
    name: 'AdminProfessores',

    setup() {
        let modalProfessor, modalConfirmApagar;
        let zoomScale = 1;

        return {store, modalProfessor, modalConfirmApagar, zoomScale}
    },
    data() {
        return {
            professorNome: '',
            professorUsername: '',
            professorSenha: '',
            idProfessorAtual: -1,
            modalTitle: '',
            pesquisa: '',
        }
    },
    methods: {
        lerProfessores: function () {
            axios.post('api/professor/ler_professores.php')
                .then(function (response) {
                    store.isProfessoresFirstLoad = false;
                    store.professores = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        pesquisarProfessores: function () {
            axios.post('api/professor/pesquisar_professores.php', {
                pesquisa: this.pesquisa
            })
                .then(function (response) {
                    store.professores = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        abrirModal: function (item, action) {
            if (item) {
                store.professorAtual = item;
            }
            store.action = action;

            switch (action) {
                case 'create':
                    this.modalTitle = "Adicionar professor"

                    this.professorNome = ''
                    this.professorUsername = ''
                    this.professorSenha = ''

                    document.getElementById("senha-input").setAttribute('placeholder', 'Senha');

                    break;
                case 'edit':
                    this.modalTitle = "Editar professor"

                    this.professorNome = item.nome
                    this.professorUsername = item.username
                    this.professorSenha = ''

                    document.getElementById("senha-input").setAttribute('placeholder', 'Senha (vazio para não alterar)');

                    this.idProfessorAtual = item.id;
                    break;
            }

            this.handleZoom('reset')
            this.modalProfessor.show();
        },
        abrirModalApagar: function (id) {
            this.idProfessorAtual = id;
            this.modalConfirmApagar.show();
        },
        criarProfessor: function () {
            let vue = this;

            axios.post('api/professor/criar_professor.php', {
                nome: this.professorNome,
                username: this.professorUsername,
                senha: this.professorSenha
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        vue.lerProfessores();

                        vue.modalProfessor.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        atualizarProfessor: function () {
            let vue = this;

            let item = {
                id: this.idProfessorAtual,
                nome: this.professorNome,
                username: this.professorUsername,
                senha: this.professorSenha
            }

            axios.put('api/professor/atualizar_professor.php', {
                item
            })
                .then(function (response) {
                    if (response.data === 1) {
                        for (let x of store.professores) {
                            if (x.id === item.id) {
                                x.id = item.id;
                                x.nome = item.nome;
                                x.username = item.username

                                break;
                            }
                        }

                        vue.modalProfessor.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        apagarProfessor: function () {
            let id = this.idProfessorAtual;
            let vue = this;

            axios.delete('api/professor/deletar_professor.php', {
                data: {
                    id: id
                }
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        for (let x of store.professores) {
                            if (x.id === id) {
                                store.professores = store.professores.filter(x => {
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
        professorHandler: function () {
            if (this.professorNome === '' || this.professorUsername === '') {

                alert('Preencha todos os campos.');
            } else {
                switch (store.action) {
                    case 'create':
                        this.criarProfessor();
                        break;
                    case 'edit':
                        this.atualizarProfessor();
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
        this.lerProfessores();
    },
    mounted() {
        this.modalProfessor = new bootstrap.Modal(document.getElementById("professor-modal"))
        this.modalConfirmApagar = new bootstrap.Modal(document.getElementById("confirmModal"))
    },

    template: `
      <nav id="main-nav" class="navbar navbar-light bg-light">
      <form class="form-inline">
        <input class="form-control mr-sm-2" type="search"
               :placeholder="'Pesquisar'"
               aria-label="Pesquisar" v-model="pesquisa">
        <button class="btn btn-outline-success my-2 my-sm-0 mr-sm-2" type="button" title="Pesquisar"
                @click="pesquisarProfessores()">
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
      <h1 class="mt-5">Professores</h1>

      <div class="container">

        <!-- Button trigger modal -->
        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-success btn-sm" @click="abrirModal(null, 'create')">
            Adicionar professor
          </button>
        </div>

        <div class="modal fade" id="professor-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
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
                             v-model="professorNome">
                    </div>
                  </div>
                  <div class="row-container">
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Username</span>
                      <input type="text" class="form-control" placeholder="Username"
                             v-model="professorUsername">
                    </div>
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Senha</span>
                      <input id="senha-input" type="password" class="form-control" placeholder="Senha"
                             v-model="professorSenha">
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalProfessor.hide()">Fechar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="professorHandler()">Salvar
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
          <tr v-for="item in store.professores">
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
              <h5 class="modal-title" id="exampleModalLongTitle">Apagar Professor</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body modal-confirm">
              Deseja apagar esse professor?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="apagarProfessor()">Sim</button>
            </div>
          </div>
        </div>
      </div>

      </main>
    `,
};