<template>
    <div class="chat-open-button cursor-pointer" @click="openChat">
        <div class="indicator">
            <span v-if="unread" class="indicator-item badge badge-secondary animate-bounce">new message</span>
            <vue-feather type="message-square" class="w-5 h-5"></vue-feather>
        </div>
    </div>
    <div class="chat">
        <Transition appear name="fadeSlow">
            <div v-show="chatOpen" class="background backdrop-blur-sm"></div>
        </Transition>
        <div v-show="chatOpen" class="chat-close-button fixed top-8 right-8" @click="chatOpen = false">
            <button class="btn btn-circle bg-red-600 border-0 shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <Transition appear name="fade">
            <div v-show="chatOpen" class="flex flex-col justify-end chat-window">
                <div id="messages-container" class="messages-container p-8">
                    <transition-group name="list">
                        <ChatMessageComponent v-for="m in messages" :key="m" :message="m" />
                    </transition-group>
                </div>
            </div>
        </Transition>
        <Transition appear name="slide">
            <div v-show="chatOpen" class="chat-input flex flex-row">
                <input ref="input" v-model="message" type="text" placeholder="Type here" class="input w-full max-w-xs" @keyup.enter="sendMessage" />
                <button class="btn btn-success w-full flex-grow text-white" @click="sendMessage">Send</button>
            </div>
        </Transition>
    </div>
</template>

<script>
import ChatMessageComponent from './ChatMessageComponent.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { onStartTyping } from '@vueuse/core'
import { ref, watch, getCurrentInstance } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { watchThrottled } from '@vueuse/core'

export default {
    name: 'ChatComponent',
    components: { ChatMessageComponent },
    props: {
        initialMessages: {
            type: Array,
            default: () => [],
        },
    },
    setup() {
        const input = ref(null)
        const message = ref('')
        const { escape } = useMagicKeys()
        const userStore = useUserStore()
        const useSocket = () => getCurrentInstance().proxy.$socket
        const useRoute = () => getCurrentInstance().proxy.$route
        const socket = useSocket()
        const route = useRoute()

        let chatOpen = ref(false)

        watch(escape, (v) => {
            if (v) chatOpen.value = false
        })

        onStartTyping(() => {
            if (!input.value.active) input.value.focus()
        })

        watchThrottled(
            message,
            () => {
                socket.client.emit('typing', {
                    userId: userStore.id,
                    roomCode: route.params.id,
                })
            },
            { throttle: 1500 }
        )

        return {
            input,
            chatOpen,
            message,
        }
    },
    data() {
        return {
            messages: this.initialMessages,
            unread: false,
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
        chatOpen(newVal, oldVal) {
            let roomContainer = document.getElementById('room')
            this.unread = false
            if (newVal) {
                if (roomContainer) {
                    roomContainer.classList.add('fixed')
                }
            } else if (oldVal) {
                if (roomContainer) {
                    roomContainer.classList.remove('fixed')
                }
            }
        },
    },
    mounted() {
        console.log(this)
    },
    sockets: {
        newMessage(message) {
            this.messages.push(message)
            if (message.from.id != this.id) {
                this.unread = true
            }
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
                this.$socket.client.emit('newMessage', this.message, this.$route.params.id)
                this.message = ''
            }
        },
        typing() {
            console.log('typing')
            this.$socket.client.emit('typing', this.id, this.$route.params.id)
        },
    },
}
</script>

<style scoped>
button {
    color: white;
}
.indicator-item {
    position: fixed;
    top: 15px;
    left: 90px;
    transform: scale(0.5);
}
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
    max-height: calc(100vh - 170px);
    top: 0;
    z-index: 3;
    height: calc(100vh - 170px);
}
.chat-input {
    background-color: white;
    padding: 2em 2em 2em 2em;
    position: fixed;
    width: 100vw;
    height: 110px;
    bottom: 0;
    z-index: 4;
    border-radius: 10px 10px 0 0;
}
.messages-container {
    max-height: calc(100vh - 110px);
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
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fadeSlow-enter-active,
.fadeSlow-leave-active {
    transition: all 0.7s ease;
}

.fadeSlow-enter-from,
.fadeSlow-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from {
    transform: translateY(120px);
}
.slide-leave-to {
    transform: translateY(120px);
}

.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.list-leave-active {
    position: absolute;
}
</style>
