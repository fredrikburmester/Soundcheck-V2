<template>
	<div class="hero min-h-screen min-h-9/10">
		<div class="hero-content flex-col lg:flex-row-reverse w-full">
			<div class="text-center lg:text-left lg:ml-8">
				<h1 class="text-5xl font-bold">Login now!</h1>
				<p class="py-6">Welcome to Soundcheck v2!</p>
			</div>
			<div
				class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100"
			>
				<div class="card-body">
					<div class="form-control">
						<button
							class="btn btn-primary text-base-100"
							@click="login"
						>
							Login
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	methods: {
		login() {
			this.$socket.client.emit('login-step-1')
		},
	},
	sockets: {
		login(url) {
			window.location.href = url
		},
	},
}
</script>
