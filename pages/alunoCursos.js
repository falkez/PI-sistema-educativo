import store from "../store.js";

export default {
    name: 'AlunoCursos',

    setup() {
        let modalCurso, modalConfirm;
        let zoomScale = 1;

        return {store, modalCurso, modalConfirm, zoomScale}
    },
    data() {
        return {
            cursoNome: '',
            cursoDescricao: '',
            idCursoAtual: -1,
            idMatricula: -1,
            modalTitle: '',
            modalConfirmText: '',
            modalConfirmHeader: '',
            pesquisa: '',
        }
    },
    methods: {
        lerCursosAluno: function () {
            let vue = this;

            axios.post('api/aluno/ler_cursos.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
            })
                .then(function (response) {
                    store.isCursosFirstLoad = false;
                    store.cursosAluno = response.data;

                    vue.lerCursos();
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        lerCursos: function () {
            let ids = [];

            if (store.cursosAluno) {
                store.cursosAluno.forEach(x => {
                    ids.push(x.id);
                })
            }

            axios.post('api/curso/ler_cursos_aluno_sem_matricula.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
                idCursos: ids
            })
                .then(function (response) {
                    store.isCursosFirstLoad = false;
                    store.cursos = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        pesquisarCursos: function () {
            axios.post('api/professor/pesquisar_cursos_professor.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
                pesquisa: this.pesquisa
            })
                .then(function (response) {
                    store.cursos = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        matricula: function (item) {
            let vue = this;

            axios.post('api/curso/matricula.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
                idCurso: this.idCursoAtual
            })
                .then(function (response) {
                    vue.modalConfirm.hide();
                    vue.modalCurso.hide();
                    vue.lerCursosAluno();
                    vue.lerCursos();
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        cancelarMatricula: function () {
            let id = this.idCursoAtual;
            let vue = this;

            axios.delete('api/curso/cancelar_matricula.php', {
                data: {
                    idUser: window.localStorage.getItem('$currentUserId'),
                    idCurso: this.idCursoAtual
                }
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        for (let x of store.cursosAluno) {
                            if (x.id === id) {
                                store.cursosAluno = store.cursosAluno.filter(x => {
                                    return x.id !== id;
                                });
                                break;
                            }
                        }

                        vue.lerCursos();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

            vue.modalConfirm.hide();
        },
        abrirModal: function (item, action) {
            if (item) {
                store.cursoAtual = item;
            }
            store.action = action;

            switch (action) {
                case 'create':
                    this.modalTitle = "Matricular-se"

                    break;
            }

            this.handleZoom('reset')
            this.modalCurso.show();
        },
        abrirModalConfirm: function (id, action) {
            store.actionAluno = action;

            switch (action) {
                case 'delete':
                    this.modalConfirmHeader = 'Cancelar Matrícula';
                    this.modalConfirmText = 'Deseja cancelar sua matrícula nesse curso?';

                    break;
                case 'matricular':
                    this.modalConfirmHeader = 'Matricular-se';
                    this.modalConfirmText = 'Deseja matricular-se nesse curso?';

                    break;
            }

            this.idCursoAtual = id;
            this.modalConfirm.show();
        },
        handleConfirm: function () {
            switch (store.actionAluno) {
                case 'delete':
                    this.cancelarMatricula();

                    break;
                case 'matricular':
                    this.matricula()

                    break;
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
        this.lerCursosAluno();
    },
    mounted() {
        this.modalCurso = new bootstrap.Modal(document.getElementById("curso-modal"))
        this.modalConfirm = new bootstrap.Modal(document.getElementById("confirmModal"))
    },

    template: `
      <nav id="main-nav" class="navbar navbar-light bg-light">
      <form class="form-inline">
        <input class="form-control mr-sm-2" type="search"
               :placeholder="'Pesquisar'"
               aria-label="Pesquisar" v-model="pesquisa">
        <button class="btn btn-outline-success my-2 my-sm-0 mr-sm-2" type="button" title="Pesquisar"
                @click="pesquisarCursos()">
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
      <h1 class="mt-5">Cursos</h1>

      <div class="container">

        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-success btn-sm" @click="abrirModal(null, 'create')">
            Matricular-se
          </button>
        </div>

        <div class="modal fade" id="curso-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">{{ modalTitle }}</h5>
              </div>

              <div class="modal-body">
                <div class="container table-responsive">
                  <table class="table">
                    <thead>
                    <tr>
                      <th class="col-nome">Nome</th>
                      <th class="col-apelido">Descrição</th>
                      <th class="update"></th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr v-for="item in store.cursos">
                      <td class="col-nome">{{ item.nome }}</td>
                      <td class="col-apelido">{{ item.descricao }}</td>
                      <td class="btn-container">
                        <button type="button" class="btn btn-outline-success btn-sm" @click="abrirModalConfirm(item.id, 'matricular')"
                                title="Efetuar matrícula">
                          <i class="fa fa-check fa-1"></i>
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalCurso.hide()">Fechar
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
            <th class="col-apelido">Descrição</th>
            <th class="update"></th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="item in store.cursosAluno">
            <td class="col-nome">{{ item.nome }}</td>
            <td class="col-apelido">{{ item.descricao }}</td>
            <td class="btn-container">
              <button type="button" class="btn btn-outline-danger btn-sm remove" title="Cancelar Matrícula"
                      @click="abrirModalConfirm(item.id, 'delete')"><i class="fa fa-times fa-1"></i>
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
              <h5 class="modal-title" id="exampleModalLongTitle">{{ this.modalConfirmHeader }}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body modal-confirm">
              {{ this.modalConfirmText }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="handleConfirm()">Sim</button>
            </div>
          </div>
        </div>
      </div>

      </main>
    `,
};