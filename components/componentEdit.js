import store from '../store.js'


export default {
    name: 'One',

    setup() {
        return {store};
    },

    template: `
      <div>
        <h1>Agendas</h1>
        <button v-on:click="store.$counter++">You clicked me {{ store.$counter }} times.</button><br>
        <br>
        <a href="javascript:void(0);" v-on:click="store.$counter = 0">Reset</a>
      </div>
    `,
};