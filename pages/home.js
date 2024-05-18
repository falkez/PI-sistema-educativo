import store from "../store.js";

export default {
    name: 'Home',

    setup() {
        let user, senha;

        return {store}
    },
    data() {
        return {
            user: '',
            senha: '',
        }
    },
    methods: {
        login: function () {
            axios.post('api/util/login.php' , {
                user: this.user,
                senha: this.senha
            })
                .then(function (response) {
                    store.$currentUserId = response.data[0].id;

                    let page = ''

                    if (store.$currentUserId === -1) {
                        alert('Login inválido')
                    } else {
                        switch (response.data[0].accessId) {
                            case 1:
                                page = 'adminCursos'
                                break;
                            case 2:
                                page = 'professorCursos'
                                break;
                            case 3:
                                page = 'alunoCursos'
                                break;
                        }

                        store.$currentUserAccess = response.data[0].accessId;
                        window.location.href = window.location.href + page;
                        document.getElementById('sidebar').style.display = 'block';
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    },
    created() {
        document.getElementById('sidebar').style.display = 'none';
    },
    mounted() {

    },

    template: `
      <main>
        <div class="modal-body" style="margin: 0 auto; width: 300px">
          <div style="margin: 0 auto">
            <label for="uname"><b>Usuário</b></label>
            <input type="text" placeholder="Usuário" name="uname" style="width: 100%"  v-model="user" required>

            <label for="psw"><b>Senha</b></label>
            <input type="password" placeholder="Senha" name="psw" style="width: 100%" v-model="senha" required>
            
            <button id="login-btn" type="button" class="btn btn-primary"
                    @click="login()" style="width: 100%">Login
            </button>
          </div>
        </div>
      </main>
    `,
};
