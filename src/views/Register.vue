<template>
  <div class="login my-12">
    <h1 class="text-2xl my-5 text-center">Login</h1>
    <div @keyup.enter="login" class="flex flex-col w-11/12 md:w-5/12 lg:w-3/12 bg-white rounded-lg shadow-lg p-8 m-auto">
      <input type="text" v-model="name" class="bg-gray-100 shadow p-3 m-1 focus:outline-none" placeholder="Name" autofocus>
      <input type="email" v-model="email" class="bg-gray-100 shadow p-3 m-1 focus:outline-none" placeholder="Email">
      <input type="text" v-model="username" class="bg-gray-100 shadow p-3 m-1 focus:outline-none" placeholder="Username">
      <input type="password" v-model="password" class="bg-gray-100 shadow p-3 m-1 focus:outline-none" placeholder="Password" >
      <button @click="login" class="p-3 bg-green-300 block rounded my-3">Sign Up</button>
      <p class="text-red-500" v-html="loginError"></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      username: '',
      password: '',
      loginError: ''
    }
  },
  computed: {
    axios: {
      get: function() {
        return this.$store.state.axios
      },
      set: function(newValue) {
        this.$store.state.axios = newValue
      }
    }
  },
  methods: {
    login() {
      this.axios.post('/auth/register', {
        name: this.name,
        email:this.email,
        username: this.username,
        password: this.password
      }).then(res => {
        if(res.data.error == undefined && res.data.error != true) {
          localStorage.setItem('access_token', res.data.access_token)
          this.axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
          this.$router.push({name:'Login'})
        }
        else {
          this.username = ''
          this.password = ''
          this.loginError = res.data.message
        }
      })
    }
  }
}
</script>