
<script>
	import {
		init
	} from "@/shopro";
	export default {
		onLaunch(options) {
			init(options);
			// 判断本地是否有token
			// 没有token，自动登录
			const token = uni.getStorageSync('token');
			let that = this;
			if(!token){
		}
		}
	};
</script>

<style lang="scss">
	@import 'static/style/index.scss';
</style>
