
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
			uni.login({
				provider: 'weixin',
				success: (res) => {
					console.log(res);
					const code = res.code
					that.$http("user.login", 
						{code},
					);
				}
			});
		}
	};
</script>

<style lang="scss">
	@import 'static/style/index.scss';
</style>
