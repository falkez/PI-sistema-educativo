import store from "../store.js";

export default {
    name: 'AlunoMensagens',

    setup() {
        let modalMensagem, modalMensagemView, modalMensagemResponder;
        let zoomScale = 1;

        return {store, modalMensagem, modalMensagemView, modalMensagemResponder, zoomScale}
    },
    data() {
        return {
            mensagemId: '',
            mensagemRemetente: '',
            mensagemTexto: '',
            userDest: '',
            mensagemAnterior: -1,
            mensagemTextoAnterior: '',
            mensagemRespostaTexto: '',
            idRemetente: -1,
            modalTitle: '',
            pesquisa: '',
        }
    },
    methods: {
        lerMensagens: function () {
            axios.post('api/mensagem/ler_mensagens.php' , {
                idUser: window.localStorage.getItem('$currentUserId'),
            })
                .then(function (response) {
                    store.isCursosFirstLoad = false;
                    store.mensagens = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        lerUsers: function () {
            let vue = this;

            axios.post('api/professor/ler_users.php' , {
                idUser: window.localStorage.getItem('$currentUserId'),
            })
                .then(function (response) {
                    let datalist = document.getElementById('userList');
                    let fragment = document.createDocumentFragment();

                    vue.userList = response.data;

                    response.data.forEach(item => {
                        let option = document.createElement('option');
                        let text = document.createTextNode(item.nome);

                        option.data = item.id;
                        option.innerText = item.nome;
                        fragment.appendChild(option);
                    });

                    datalist.appendChild(fragment);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        abrirModal: function (item, action) {
            if (item) {
                store.mensagemAtual = item;
            }
            store.action = action;

            this.handleZoom('reset')
            
            switch (action) {
                case 'create':
                    this.modalTitle = "Nova mensagem"

                    this.mensagemId = -1
                    this.mensagemTexto = ''
                    this.idRemetente = ''
                    this.mensagemRemetente = ''
                    this.mensagemAnterior = ''
                    this.mensagemTextoAnterior = ''
                    this.userDest = ''

                    this.modalMensagem.show();

                    break;
                case 'view':
                    this.modalTitle = "Visualizar mensagem"

                    this.mensagemId = item.id
                    this.mensagemTexto = item.texto
                    this.idRemetente = item.remetente
                    this.mensagemRemetente = item.remetenteFullName
                    this.mensagemAnterior = item.parentId
                    this.mensagemTextoAnterior = item.textoAnterior

                    this.modalMensagemView.show();

                    break;
                case 'reply':
                    this.mensagemRespostaTexto = ''

                    document.getElementById("mensagem-modal-view").style['z-index'] = 1;
                    this.modalMensagemResponder.show();

                    break;
            }
        },
        fecharModalResposta: function () {
            this.modalMensagemResponder.hide();
            document.getElementById("mensagem-modal-view").style['z-index'] = 1050;
        },
        criarMensagem: function () {
            let vue = this;

            this.userDest = this.userList.find(x => x.nome === this.userDest);

            axios.post('api/mensagem/criar_mensagem.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
                texto: this.mensagemTexto,
                userDest: this.userDest.id,
                parentId: -1
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        vue.lerMensagens();

                        vue.modalMensagem.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        responderMensagem: function () {
            let vue = this;

            axios.post('api/mensagem/criar_mensagem.php', {
                idUser: window.localStorage.getItem('$currentUserId'),
                texto: this.mensagemRespostaTexto,
                userDest: this.idRemetente,
                parentId: this.mensagemId
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        vue.lerMensagens();

                        vue.fecharModalResposta();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        mensagemHandler: function () {
            switch (store.action) {
                case 'create':
                    if (this.mensagemTexto === '' || !this.userDest || this.userDest === -1 || this.userDest === '') {
                        alert('Preencha todos os campos.');
                    }
                    this.criarMensagem();
                    break;
                case 'reply':
                    if (this.mensagemRespostaTexto === '') {
                        alert('Preencha o texto da mensagem.');
                    }
                    this.responderMensagem();
                    break;
                default:
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
        this.lerMensagens();
        this.lerUsers();
    },
    mounted() {
        this.modalMensagem = new bootstrap.Modal(document.getElementById("mensagem-modal"))
        this.modalMensagemView = new bootstrap.Modal(document.getElementById("mensagem-modal-view"))
        this.modalMensagemResponder = new bootstrap.Modal(document.getElementById("mensagem-modal-responder"))
    },

    template: `
      <nav id="main-nav" class="navbar navbar-light bg-light">

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
      <h1 class="mt-5">Mensagens</h1>

      <div class="container">

        <!-- Button trigger modal -->
        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-success btn-sm" @click="abrirModal(null, 'create')">
            Adicionar mensagem
          </button>
        </div>

        <div class="modal fade" id="mensagem-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">{{ modalTitle }}</h5>
              </div>

              <div class="modal-body">
                <div class="input-group mb-3">
                  <div class="row-container">
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Destinatário</span>
                      <input type="text" name="userList" list="userList" v-model="userDest" placeholder="Destinatário"/>
                      <datalist id="userList"></datalist>
                    </div>
                  </div>
                  <div id="mensagem-textarea">
                    <span class="input-group-text" id="agendamento-form-display">Texto</span>
                    <textarea class="form-control" placeholder="Texto..."
                              v-model="mensagemTexto"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalMensagem.hide()">Fechar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="mensagemHandler()">Salvar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal fade" id="mensagem-modal-view" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">{{ modalTitle }}</h5>
              </div>

              <div class="modal-body">
                <div class="input-group mb-3">
                  <div class="row-container">
                    <div>
                      <span class="input-group-text" id="agendamento-form-display">Remetente</span>
                      <p>{{ mensagemRemetente }}</p>
                      <datalist id="userList"></datalist>
                    </div>
                  </div>
                  <div id="mensagem-textarea" v-if="mensagemAnterior !== -1">
                    <span class="input-group-text" id="agendamento-form-display">Mensagem Anterior</span>
                    <p>{{ mensagemTextoAnterior }}</p>
                  </div>
                  <div id="mensagem-textarea">
                    <span class="input-group-text" id="agendamento-form-display">Texto</span>
                    <p>{{ mensagemTexto }}</p>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.modalMensagemView.hide()">Fechar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="abrirModal(null, 'reply')">
                  Responder
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal fade" id="mensagem-modal-responder" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div id="responder-container" class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">Responder Mensagem</h5>
              </div>

              <div class="modal-body">
                <div class="input-group mb-3">
                  <div id="mensagem-textarea">
                    <span class="input-group-text" id="agendamento-form-display">Texto</span>
                    <textarea class="form-control" placeholder="Texto..."
                              v-model="mensagemRespostaTexto"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="fecharModalResposta()">Cancelar
                </button>
                <button id="submit-task" type="button" class="btn btn-primary"
                        @click="mensagemHandler()">Responder
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
            <th class="col-nome">Remetente</th>
            <th class="col-apelido">Texto</th>
            <th class="col-apelido">Data</th>
            <th class="update"></th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="item in store.mensagens">
            <td class="col-nome">{{ item.remetenteFullName }}</td>
            <td class="col-apelido">{{ item.texto }}</td>
            <td class="col-apelido">{{ new Date(item.data).toLocaleString('pt-BR') }}</td>
            <td class="btn-container">
              <button type="button" class="btn btn-outline-info btn-sm" @click="abrirModal(item, 'view')"
                      title="Visualizar">
                <i class="fa fa-eye fa-1"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      </main>
    `,
};