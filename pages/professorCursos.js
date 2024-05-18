import store from "../store.js";

export default {
    name: 'ProfessorCursos',

    setup() {
        let modalCurso, modalConfirmApagar;
        let zoomScale = 1;

        return {store, modalCurso, modalConfirmApagar, zoomScale}
    },
    data() {
        return {
            cursoNome: '',
            cursoDescricao: '',
            idCursoAtual: -1,
            modalTitle: '',
            pesquisa: '',
        }
    },
    methods: {
        lerCursos: function () {
            axios.post('api/professor/ler_cursos_professor.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
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
        abrirModal: function (item, action) {
            if (item) {
                store.cursoAtual = item;
            }
            store.action = action;

            switch (action) {
                case 'edit':
                    this.modalTitle = "Editar curso"

                    this.cursoNome = item.nome
                    this.cursoDescricao = item.descricao

                    this.idCursoAtual = item.id;
                    break;
            }

            this.handleZoom('reset')
            this.modalCurso.show();
        },
        atualizarCurso: function () {
            let vue = this;

            let item = {
                id: this.idCursoAtual,
                nome: this.cursoNome,
                descricao: this.cursoDescricao
            }

            axios.put('api/curso/atualizar_curso.php', {
                item
            })
                .then(function (response) {
                    if (response.data === 1) {
                        for (let x of store.cursos) {
                            if (x.id === item.id) {
                                x.id = item.id;
                                x.nome = item.nome;
                                x.descricao = item.descricao;

                                break;
                            }
                        }

                        vue.modalCurso.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        cursoHandler: function () {
            if (this.cursoNome === '' || this.cursoDescricao === '') {

                alert('Preencha todos os campos.');
            } else {
                switch (store.action) {
                    case 'edit':
                        this.atualizarCurso();
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
        this.lerCursos();
    },
    mounted() {
        this.modalCurso = new bootstrap.Modal(document.getElementById("curso-modal"))
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
        
        <div class="modal fade" id="curso-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
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
                             v-model="cursoNome">
                    </div>
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Descrição</span>
                      <input type="text" class="form-control" placeholder="Descrição"
                             v-model="cursoDescricao">
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalCurso.hide()">Fechar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="cursoHandler()">Salvar
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
          <tr v-for="item in store.cursos">
            <td class="col-nome">{{ item.nome }}</td>
            <td class="col-apelido">{{ item.descricao }}</td>
            <td class="btn-container">
              <button type="button" class="btn btn-outline-info btn-sm" @click="abrirModal(item, 'edit')"
                      title="Editar">
                <i class="fa fa-pen fa-1"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      </main>
    `,
};