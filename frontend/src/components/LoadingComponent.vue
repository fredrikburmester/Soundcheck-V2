<template>
    <div class="flex flex-col items-center place-content-center my-12">
        <div class="hollow-dots-spinner">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoadingComponent',
    props: {
        color: {
            type: String,
            required: false,
            default: '#1eb854',
        },
    },
}
</script>
<style scoped>
.hollow-dots-spinner,
.hollow-dots-spinner * {
    box-sizing: border-box;
}

.hollow-dots-spinner {
    height: 15px;
    width: calc(30px * 3);
}

.hollow-dots-spinner .dot {
    width: 15px;
    height: 15px;
    margin: 0 calc(15px / 2);
    border: 4px solid v-bind(color);
    border-radius: 50%;
    float: left;
    transform: scale(0);
    animation: hollow-dots-spinner-animation 1000ms ease infinite 0ms;
}

.hollow-dots-spinner .dot:nth-child(1) {
    animation-delay: calc(150ms * 1);
}

.hollow-dots-spinner .dot:nth-child(2) {
    animation-delay: calc(150ms * 2);
}

.hollow-dots-spinner .dot:nth-child(3) {
    animation-delay: calc(150ms * 3);
}
@keyframes hollow-dots-spinner-animation {
    50% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
</style>
