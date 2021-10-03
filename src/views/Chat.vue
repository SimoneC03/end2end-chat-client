<template>
  <div class="chat">
    <h1 class="text-lg my-3 text-center">Chat</h1>
    <div class="chat-container w-10/12 p-3 overflow-y-auto overflow-x-hidden relative rounded-xl shadow-xl mx-auto bg-white">
      <div :class="{'loading-overlay relative': pageLoading}">
        <div v-if="pageLoading" class="z-50 h-full block relative flex flex-col items-center">
          <h1 class="text-center"><i class="fa fa-spinner"></i></h1>
          <h1 class="text-center">Decrypting your messages...</h1>
        </div>
        <div v-for="(el, index) in messages" :key="index" class="flex flex-row">
          <div :class="{'message p-3 rounded shadow-sm text-sm m-2 max-w-sm lg:max-w-lg': true, 'ml-auto mr-0': el.author == user.username, 'ml-0 mr-auto': el.author == receiverSelected.username}" v-if="(el.copy === true && el.author === user.username) || (el.copy === false && el.author === receiverSelected.username)">
            <span v-html="el.text" class="block"></span>
            <span v-html="new Date(el.created_at).toLocaleTimeString()" class="text-gray-500"></span>
          </div>
        </div>
      </div>
      <div class="input container absolute bottom-0 right-0 left-0 bg-gray-100 p-3 flex flex-row justify-center align-middle items-center" style="max-width:unset!important">
        <p :class="{'text-sm mr-2 text-gray-600':true, 'text-red-500':messageToSend.length > maxMessageLength}" v-html="messageToSend.length+'/'+maxMessageLength"></p>
        <input type="text" max="190" class="bg-white shadow-lg rounded p-3 inline-block w-10/12 focus:outline-none" v-model="messageToSend" @keyup.enter="sendMessage()">
        <i class="fas fa-paper-plane text-gray-300 hover:text-gray-400 text-2xl cursor-pointer ml-3" @click="sendMessage()"></i>
      </div>
    </div> 
  </div>
</template>
<style lang="css">
  body {background: rgb(238, 238, 238);}
  .chat-container {height: 600px; max-width: unset!important;}
  .message {background: rgb(188, 255, 222); word-break: break-word;}
  .loading-overlay::before {content: ''; position: absolute; top: 0; bottom: 0;left: 0;right: 0; background: rgba(255,255,255,.78); z-index: 1;}
</style>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Chat',
  data() {
    return {
      user: {},
      messages: [],
      maxMessageLength: 190,
      privateKeyFormatted: {},
      publicKeyFormatted: {},
      receiverPublicKeyFormatted: {},
      receiverSelected: {},
      messageToSend: '',
      pageLoading: true
    }
  },
  props: ['username'],
  computed: {
    ...mapGetters(['axios'])
  },
  methods: {
    async getMessages() {
      const res = await this.axios.get('/messages/'+this.receiverSelected.username)
      this.messages = res.data
    },
    async sendMessage() {
      const app = this
      if(app.messageToSend.length <= app.maxMessageLength) {
        const encryptedText = await crypto.subtle.encrypt({name: 'RSA-OAEP'}, app.receiverPublicKeyFormatted, Buffer.from(app.messageToSend, 'utf8'));
        const encryptedTextCopy = await crypto.subtle.encrypt({name: 'RSA-OAEP'}, app.publicKeyFormatted, Buffer.from(app.messageToSend, 'utf8'));

        const res = await app.axios.post('/messages', {
          receiver: app.receiverSelected.username,
          text: Buffer.from(encryptedText).toString('base64'),
          textCopy: Buffer.from(encryptedTextCopy).toString('base64')
        })

        if(res.data.error == undefined && res.data.error != true) {
          //IN LCOAL ONLY!!
          let mex = res.data.copy
          mex.text = app.messageToSend
          app.messages.push(mex)
          app.messageToSend = ''
        }
        else {
          console.log("Errore in sendMessage")
          console.log(res.data.message)
        }
      }
    },
    str2ab(str) {
      //Convert a string into an ArrayBuffer
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    },
    importPrivateKey(pem) {
      /*
      Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      Takes a string containing the PEM encoded key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      const app = this
      // fetch the part of the PEM string between header and footer
      const pemHeader = "-----BEGIN PRIVATE KEY-----";
      const pemFooter = "-----END PRIVATE KEY-----";
      let pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).split(/\s+/).join('').replace(/\s/g, '');
      // base64 decode the string to get the binary data
      let pemlength = pemContents.length
      const binaryDerString = window.atob(pemContents.substr(0,pemlength-1));
      // convert from a binary string to an ArrayBuffer
      const binaryDer = app.str2ab(binaryDerString);

      window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["decrypt"]
      ).then(res => {
        //Saving formatted imported private key
        app.privateKeyFormatted = res

        app.messages.forEach(async el => {
          const dcrptdTxt = await crypto.subtle.decrypt({name: 'RSA-OAEP'}, app.privateKeyFormatted, Buffer.from(el.text, 'base64'));
          el.text = Buffer.from(dcrptdTxt).toString()
        })
      });
    },
    importPersonalPublicKey(pem) {
      /*
      Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      Takes a string containing the PEM encoded key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      const app = this
      // fetch the part of the PEM string between header and footer
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      let pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).split(/\s+/).join('').replace(/\s/g, '');
      // base64 decode the string to get the binary data
      //let pemlength = pemContents.length
      //const binaryDerString = window.atob(pemContents.substr(0,pemlength-1));
      // console.log(binaryDerString)
      // // convert from a binary string to an ArrayBuffer
      // const binaryDer = app.str2ab(binaryDerString);
      // console.log(binaryDer)
      // console.log(Buffer.from(pemContents, 'base64').buffer)

      window.crypto.subtle.importKey(
        "spki",
        Buffer.from(pemContents, 'base64').buffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"]
      ).then(res => {
        //Saving formatted imported personal public key
        app.publicKeyFormatted = res
      });
    },
    importReceiverPublicKey(pem) {
      /*
      Import a PEM encoded RSA private key, to use for RSA-PSS signing.
      Takes a string containing the PEM encoded key, and returns a Promise
      that will resolve to a CryptoKey representing the private key.
      */
      const app = this
      // fetch the part of the PEM string between header and footer
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      let pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).split(/\s+/).join('').replace(/\s/g, '');
      // base64 decode the string to get the binary data
      //let pemlength = pemContents.length
      //const binaryDerString = window.atob(pemContents.substr(0,pemlength-1));
      // console.log(binaryDerString)
      // // convert from a binary string to an ArrayBuffer
      // const binaryDer = app.str2ab(binaryDerString);
      // console.log(binaryDer)
      // console.log(Buffer.from(pemContents, 'base64').buffer)

      window.crypto.subtle.importKey(
        "spki",
        Buffer.from(pemContents, 'base64').buffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"]
      ).then(res => {
        //Saving formatted imported receiver public key
        app.receiverPublicKeyFormatted = res
      });
    },
    changeReceiver() {
      
    }
  },
  mounted() {
    const app = this
    setTimeout(() => {
      app.axios('/profile').then(async res => {
        app.user = res.data
        localStorage.setItem('user', JSON.stringify(res.data))

        //Check if username prop exists
        if(app.username != undefined) {
          app.receiverSelected = app.user.friends.find(el => el.username == app.username)
          app.importReceiverPublicKey(app.receiverSelected.public_key)
          app.getMessages()
        }
        else {
          //TO REMOVE
          app.$router.push({name: 'PageNotFound'})
        }
        //Import private key
        setTimeout(() => {
          app.importPrivateKey(app.user.private_key)
          app.importPersonalPublicKey(app.user.public_key)
          app.pageLoading = false
        }, 1000)

      }).catch(() => {
        app.$router.push({name: 'Login'})
      })
    }, 100)

  }
}
</script>