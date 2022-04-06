<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ title }}</h1>
        <p class="italic">{{ subtitle }}</p>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String,
            default: '',
        },
    },
}
</script>
