<template>
    <div id="message" :class="message.from.id == id ? 'flex flex-row-reverse items-center mt-4' : 'flex flex-row items-center mt-4'">
        <div id="avatar" :class="message.from.id == id ? 'avatar ml-4' : 'avatar mr-4'">
            <div class="w-12 rounded-full">
                <img :src="message.from.img" />
            </div>
        </div>
        <div :class="message.from.id == id ? 'text-right chat-body flex flex-col' : 'chat-body flex flex-col'">
            <span class="text-2xs italic mb-1 ml-1 flex-none">{{ formatDateTime(message.sentAt) }}</span>
            <span class="flex flex-1 message-bubble mb-1">
                {{ message.message }}
            </span>
            <span class="text-2xs ml-1 flex-none">
                {{ message.from.name }}
            </span>
        </div>
    </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import moment from 'moment'
export default {
    name: 'ChatMessageComponent',
    props: {
        message: {
            type: Object,
            required: false,
        },
    },
    computed: {
        ...mapWritableState(useUserStore, ['id']),
    },
    methods: {
        formatDateTime(datetime) {
            return moment(datetime).format('HH:mm:ss')
        },
    },
}
</script>

<style>
.message-bubble {
    background: #ededed;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
    color: black;
}
</style>
