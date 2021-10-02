<template>
  <div class="friends">
    <h1 class="text-lg text-center my-3">Your friends</h1>
    <div :class="{'friends_list w-11/12 md:w-5/12 lg:w-3/12 mx-auto':true, 'lg:flex lg:flex-row':user.friends.filter(item => item.confirmed==true).length>1}" v-if="user.friends.filter(item => item.confirmed==true).length>0">
      <div v-for="(el, index) in user.friends" :key="index">
        <div :class="{'friend bg-gray-50 hover:bg-gray-100 flex flex-row p-6 my-4 shadow-lg rounded-lg cursor-pointer': true, 'lg:w-5/12':user.friends.filter(item => item.confirmed==true).length>1}" v-if="el.confirmed == true" @click="$router.push({name: 'Chat', params: {username: el.username}})">
          <div class="friend_img rounded-full w-20 h-20 bg-gray-500" :style="'background-image:url(https://avatars.dicebear.com/api/gridy/'+el.username+'.svg)'"></div>
          <div class="friend_name my-auto ml-3" v-html="el.username"></div>
        </div>
      </div>
    </div>
    <h1 class="text-lg text-center mb-1 mt-16 block">Invite friends</h1>
    <div class="w-11/12 md:w-7/12 lg:w-5/12 mx-auto flex flex-row">
      <input type="text" placeholder="Insert the username who want to invite" class="bg-gray-100 shadow p-3 m-1 focus:outline-none rounded w-10/12" v-model="friendToInvite">
      <button class="p-3 bg-green-300 block rounded my-3 w-2/12 ml-2" :disabled="inviteLoading" @click="inviteFriend"><span v-if="!inviteLoading">Invite</span><span v-if="inviteLoading"><i class="fa fa-spinner"></i></span></button>
    </div>
    <p v-html="inviteError" class="text-red-500"></p>
    <h1 class="text-lg text-center my-4 mt-16 block">Incoming people requests</h1>
    <div :class="{'invites_list w-11/12 md:w-5/12 lg:w-3/12 mx-auto':true, 'lg:flex lg:flex-row':user.friends.filter(item => item.confirmed==false).length>1}" v-if="user.friends.filter(item => item.confirmed==false).length>0">
      <div v-for="(el, index) in user.friends" :key="index">
        <div :class="{'invite bg-gray-50 hover:bg-gray-100 flex flex-row p-6 my-4 shadow-lg rounded-lg items-center': true, 'lg:w-5/12': user.friends.filter(item => item.confirmed==false).length>1}" v-if="el.confirmed == false">
          <div class="invite_img rounded-full w-20 h-20 bg-gray-500" :style="'background-image:url(https://avatars.dicebear.com/api/gridy/'+el.username+'.svg)'"></div>
          <div class="invite_name my-auto ml-3" v-html="el.username"></div>
          <button class="p-4 rounded bg-green-200 hover:bg-green-300 mx-1 ml-auto" style="height:fit-content">Accept</button>
          <button class="p-4 rounded bg-yellow-200 hover:bg-yellow-300 mx-1 mr-0" style="height:fit-content">Reject</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="css">

.fa-spinner {animation: spinning .56s ease-in-out infinite;}
@keyframes spinning {
  from {transform: rotateZ(0);}
  to {transform: rotateZ(360deg);}
}
  
</style>
<script>
import {mapGetters} from 'vuex'
export default {
  name: 'Friends',
  data() {
    return {
      friendToInvite: '',
      inviteLoading: false,
      inviteError: ''
    }
  },
  methods: {
    inviteFriend() {
      this.inviteLoading = true
      this.inviteError = ''
      this.axios.post('/users/friends/invite', {
        username: this.friendToInvite
      }).then(res => {
        if(res.data.error == undefined && res.data.error != true) {
          this.inviteLoading = false
        }
        else {
          this.inviteError = res.data.message
          this.inviteLoading = false
        }
      })
    }
  },
  computed: {
    ...mapGetters(['axios', 'user'])
  },
  mounted() {
  }
}
</script>