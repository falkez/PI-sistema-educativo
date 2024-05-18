export default Vue.reactive({
    /* variables starting with $ are automatically saved in localstorage */

    $currentUserAccess: -1,
    $currentUserId: -1,

    isCursosFirstLoad: true,
    cursos: null,
    cursoAtual: null,
    actionCurso: '',

    isProfessoresFirstLoad: true,
    professores: null,
    professorAtual: null,
    actionProfessor: '',

    isAlunosFirstLoad: true,
    alunos: null,
    alunoAtual: null,
    actionAluno: '',
    cursosAluno: '',
})