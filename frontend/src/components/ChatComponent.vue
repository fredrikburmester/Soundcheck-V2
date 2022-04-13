<template>
    <transition name="fade">
        <Teleport to="#chat-target">
            <div class="chat-open-button cursor-pointer" @click="openChat">
                <vue-feather type="message-square" class="w-5 h-5"></vue-feather>
            </div>
            <div v-show="chatOpen" class="chat">
                <div class="background backdrop-blur-sm"></div>

                <div class="chat-close-button fixed top-8 right-8" @click="chatOpen = false">
                    <button class="btn btn-circle bg-red-600 border-0 hover:bg-red-400 shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex flex-col justify-end chat-window">
                    <div id="messages-container" class="messages-container p-8">
                        <ChatMessageComponent v-for="m in messages" :key="m.datetime" :message="m" />
                    </div>
                </div>
                <div class="chat-input flex flex-row">
                    <input v-model="message" type="text" placeholder="Type here" class="input w-full max-w-xs" @keyup.enter="sendMessage" />
                    <button class="btn btn-success" @click="sendMessage">Send</button>
                </div>
            </div>
        </Teleport>
    </transition>
</template>

<script>
import ChatMessageComponent from './ChatMessageComponent.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
    name: 'ChatComponent',
    components: { ChatMessageComponent },
    props: {
        messages: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            message: '',
            chatOpen: false,
        }
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    watch: {
        messages: {
            handler() {
                this.scrollToBottom()
            },
            deep: true,
        },
    },
    methods: {
        scrollToBottom() {
            this.$nextTick(() => {
                document.getElementById('messages-container').scrollTop = document.getElementById('messages-container').scrollHeight
            })
        },
        openChat() {
            this.chatOpen = !this.chatOpen
            this.scrollToBottom()
        },
        sendMessage() {
            if (this.message.length > 0) {
                this.$socket.client.emit('newMessage', this.message)
                this.message = ''
            }
        },
    },
}
</script>

<style scoped>
.chat-open-button {
    position: fixed;
    left: 80px;
    top: 22px;
    z-index: 100;
}
.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1;
}
.chat {
    z-index: 100;
    width: 100vw;
    display: flex;
}
.chat-window {
    position: fixed;
    width: 100vw;
    max-height: calc(100vh - 120px);
    top: 0;
    z-index: 3;
    height: calc(100vh - 120px);
}
.chat-input {
    background-color: white;
    padding: 2em 2em 2em 2em;
    position: fixed;
    width: 100vw;
    height: 120px;
    bottom: 0;
    z-index: 4;
    border-radius: 10px 10px 0 0;
}
.messages-container {
    max-height: calc(100vh - 120px);
    overflow: auto;
}
.chat-input input {
    max-width: 70vw;
    width: 70vw !important;
    background-color: rgb(202 202 202);
    color: black;
}
.chat-input button {
    margin-left: 20px;
    width: 20vw !important;
}
.chat-close-button {
    z-index: 1000;
}
.fade-enter-active,
.fade-leave-active {
    transition: all 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>