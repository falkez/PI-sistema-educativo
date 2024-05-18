import homepage from './pages/home.js'
import * as pages from './pages/index.js'
import store from './store.js'

export default {
    name: 'App',
    components: Object.assign({homepage}, pages),

    setup() {
        const {watchEffect, onMounted, ref} = Vue;
        const page = ref(null);

        //store management: save $variables to localstorage
        onMounted(() => {
            window.addEventListener('beforeunload', () => {
                Object.keys(store).forEach(function (key){
                    if (key.charAt(0) == "$") {localStorage.setItem(key, store[key]); } else {localStorage.removeItem("$" + key);}
                });
            });
            Object.keys(store).forEach(function (key){
                if (key.charAt(0) == "$") {
                    if (localStorage.getItem(key)) store[key] = localStorage.getItem(key);
                }}
            )
        })

        //url management
        watchEffect(() => {
            const urlpage = window.location.pathname.split("/").pop();
            if (page.value == null) {page.value = urlpage}
            if (page.value != urlpage) {const url = page.value ? page.value : './'; window.history.pushState({url: url}, '', url);                                }
            window.onpopstate = function() {page.value = window.location.pathname.split("/").pop()};
        })

        return {page, pages, store}
    },
    methods: {
        logout: function () {
            store.$currentUserId = '-1';
            store.$currentUserAccess = '-1';
            window.location.href = window.location.origin + '/sistema-escolar';
        }
    },

    template: `
        <div id="sidebar">
            <nav>
                <button class="btn btn-primary" v-on:click="page = 'adminCursos'" v-if="store.$currentUserAccess == 1">Cursos</button>
                <button class="btn btn-primary" v-on:click="page = 'adminProfessores'" v-if="store.$currentUserAccess == 1">Professores</button>
                <button class="btn btn-primary" v-on:click="page = 'adminAlunos'" v-if="store.$currentUserAccess == 1">Alunos</button>

                <button class="btn btn-primary" v-on:click="page = 'professorCursos'" v-if="store.$currentUserAccess == 2">Cursos</button>
                <button class="btn btn-primary" v-on:click="page = 'professorMensagens'" v-if="store.$currentUserAccess == 2">Mensagens</button>
              
                <button class="btn btn-primary" v-on:click="page = 'alunoCursos'" v-if="store.$currentUserAccess == 3">Cursos</button>
                <button class="btn btn-primary" v-on:click="page = 'alunoMensagens'" v-if="store.$currentUserAccess == 3">Mensagens</button>
              
                <button class="btn btn-danger" style="float: right" @click="logout()">Logout</button>
            </nav><hr>
        </div>
        <div id="content">
            <component :is="page || 'homepage'"></component>
        </div>
    `,
  };