<template>
	<view class="cu-modal bottom-modal" :class="{ show: showAuth }" @tap="closeAuthModal" style="z-index: 10080;">
		<view class="login-wrap cu-dialog" @tap.stop>
			<!-- 微信登录 -->
			<view class="head-box">
				<view class="head-title">微信登录</view>
				<view class="head-subtitle">请使用微信账号登录</view>
			</view>

			<view class="wx-login-box">
				<button v-if="['App', 'wxOfficialAccount', 'wxMiniProgram'].includes(platform)" 
					class="wx-login-btn"
					open-type="getPhoneNumber" 
					@getphonenumber="thirdLogin('wechat', $event)"
					@tap="thirdLogin('wechat')">
					<image class="wx-icon" :src="$IMG_URL + '/imgs/auto_login_wx.png'"></image>
					<text>微信一键登录</text>
				</button>
			</view>

			<!-- 协议 -->
			<view class="agreement-box">
				<u-checkbox v-model="protocol" shape="circle" active-color="#07c160">
					<view class="agreement-text">
						我已阅读并遵守
						<text class="link" @tap.stop="$Router.push({path: '/pages/public/richtext',query: { id: initShop.user_protocol || 0 }})">
							《用户协议》
						</text>
						与
						<text class="link" @tap.stop="$Router.push({path: '/pages/public/richtext',query: { id: initShop.privacy_protocol || 0 }})">
							《隐私协议》
						</text>
					</view>
				</u-checkbox>
			</view>

		</view>
	</view>
</template>

<script>
/**
 * 登录提示页
 */
import FormValidate from "@/shopro/validate/form";
import schema from "@/uview-ui/libs/util/async-validator";
import wechat from "@/shopro/wechat/wechat";
import { mapMutations, mapActions, mapState, mapGetters } from "vuex";
// #ifdef APP-PLUS
import apple from "@/shopro/apple";
// #endif

export default {
	name: "shoproAuthModal",
	data() {
		return {
			platform: this.$platform.get(),
			device: this.$platform.device(),
			form: {
				// 1.账号密码登录
				accountLogin: {
					data: {
						account: "", // 账号
						password: "" // 密码
					},
					rules: {
						account: FormValidate.account,
						password: FormValidate.password
					},
					error: {
						account: "",
						password: ""
					}
				},

				// 2.短信登录
				smsLogin: {
					data: {
						mobile: "", // 手机号
						code: "", // 验证码
						isMobileEnd: false // 手机号输入完毕
					},
					rules: {
						code: FormValidate.code,
						mobile: FormValidate.mobile
					},
					error: {
						mobile: "", // 手机号
						code: "" // 验证码
					}
				},
				// 3.注册
				register: {
					data: {
						mobile: "", // 手机号
						code: "", // 验证码
						password: "", // 密码
						isMobileEnd: false // 手机号输入完毕
					},
					rules: {
						code: FormValidate.code,
						mobile: FormValidate.mobile,
						password: FormValidate.password
					},
					error: {
						mobile: "", // 手机号
						code: "", // 验证码
						password: "" // 密码
					}
				},

				// 4.忘记密码
				forgotPwd: {
					data: {
						mobile: "", //手机号
						code: "", //验证码
						password: "", //密码
						isMobileEnd: false // 手机号输入完毕
					},
					rules: {
						mobile: FormValidate.mobile,
						code: FormValidate.code,
						password: FormValidate.password
					},
					error: {
						mobile: "", //手机号
						code: "", //验证码
						password: "" //密码
					}
				},
				// 5.绑定手机号
				bindMobile: {
					data: {
						mobile: "", //手机号
						code: "", //验证码
						isMobileEnd: false // 手机号输入完毕
					},
					rules: {
						code: FormValidate.code,
						mobile: FormValidate.mobile
					},
					error: {
						mobile: "", //手机号
						code: "" //验证码
					}
				},
				// 6.修改密码
				changePwd: {
					data: {
						oldPassword: "", //旧密码
						newPassword: "", //新密码
						reNewPassword: "" //确认密码
					},
					rules: {
						oldPassword: FormValidate.password,
						newPassword: FormValidate.password,
						reNewPassword: [
							{
								required: true,
								message: "请重新输入密码",
								trigger: ["change", "blur"]
							},
							{
								validator: (rule, value, callback) => {
									return value === this.form.changePwd.data.newPassword;
								},
								message: "两次输入的密码不一致",
								trigger: ["change", "blur"]
							}
						]
					},
					error: {
						oldPassword: "", //旧密码
						newPassword: "", //新密码
						reNewPassword: "" //确认密码
					}
				}
			},
			codeText: "获取验证码",
			disabledCode: false,
			protocol: false, //是否同意隐私协议
			placeholderStyle: "font-size: 30rpx; font-weight: 500;color:#C2C7CF;"
		};
	},

	computed: {
		...mapGetters(["initShop", "isLogin", "authType"]),
		showAuth: {
			get() {
				return !!this.authType;
			},
			set(value) {
				value ? uni.hideTabBar() : uni.showTabBar();
			}
		}
	},
	mounted() { },
	methods: {
		...mapActions(["getUserInfo", "showAuthModal"]),

		// 检测
		checkValue(e, key) {
			this.validation(key);
		},

		// 校验数据
		validation(key, callback = () => { }) {
			let that = this;
			//拿到需要校验的数据
			let fieldValue = this.form[this.authType].data[key];
			//拿到需要检验的规则
			let rules = this.form[this.authType].rules[key];
			// 判空
			if (!rules || rules.length === 0) {
				return callback("");
			}
			// 设置当前的装填，标识为校验中
			let validateState = "validating";
			// 调用async-validator的方法
			let validator = new schema({
				[key]: rules
			});
			// 校验
			validator.validate(
				{
					[key]: fieldValue
				},
				{
					firstFields: true
				},
				(errors, fields) => {
					// 记录状态和报错信息
					validateState = !errors ? "success" : "error";
					let validateMessage = errors ? errors[0].message : "";
					that.form[that.authType].error[key] = validateMessage;
					callback(validateMessage);
				}
			);
		},

		// 校验全部数据
		validateAll(callback) {
			let that = this;
			return new Promise(resolve => {
				// 对当前所有表单检验
				let valid = true; // 默认通过
				let count = 0; // 用于标记是否检查完毕
				let errorArr = []; // 存放错误信息
				let curFormData = that.form[that.authType].data;
				Object.keys(curFormData).map(field => {
					that.validation(field, error => {
						// 如果回调有error
						if (error) {
							valid = false;
							errorArr.push(error);
						}
						if (++count === Object.keys(curFormData).length) {
							resolve(valid);
							if (errorArr.length) {
								this.$u.toast(errorArr[0]);
							}
							if (typeof callback == "function") callback(valid);
						}
					});
				});
			});
		},

		// 手机号是否输入完毕
		mobileInput(e, key) {
			this.form[this.authType].data.isMobileEnd = this.$u.test.mobile(
				this.form[this.authType].data.mobile
			);
			this.validation(key);
		},

		closeAuthModal() {
			this.$store.dispatch("showAuthModal", "");
		},

		// 获取短信验证码
		getSmsCode(type) {
			const that = this;
			if (that.form[this.authType].data.isMobileEnd && !that.disabledCode) {
				that.$(
					"common.smsSend",
					{
						mobile: that.form[this.authType].data.mobile,
						event: type
					},
					"获取验证码中..."
				).then(res => {
					if (res.code === 1) {
						that.codeChange();
						that.$u.toast("验证码已发送，请注意查收短信");
					} else {
						that.$u.toast(res.msg);
					}
				});
			} else {
				that.$u.toast("请稍后再试");
			}
		},

		// 倒计时
		codeChange() {
			if (this.disabledCode) return;
			this.disabledCode = true;
			let n = 60;
			this.codeText = n + "s";
			const run = setInterval(() => {
				n -= 1;
				if (n < 0) {
					clearInterval(run);
				}
				this.codeText = n + "s";
				if (this.codeText < 0 + "s") {
					this.disabledCode = false;
					this.codeText = "重新获取";
				}
			}, 1000);
		},

		// 规则校验
		validateSubmit() {
			if (
				["accountLogin", "smsLogin", "register"].includes(this.authType) &&
				!this.protocol
			) {
				this.$u.toast("请同意用户协议");
				return false;
			}
			return this.validateAll();
		},

		// 第三方登录
		async thirdLogin(provider, payload = null) {
			if (this.platform === 'wxMiniProgram' && payload === null) return;
			if (!this.protocol) {
				this.$u.toast("请同意用户协议");
				return false;
			}
			
			uni.login({
				provider: 'weixin',
				success: async(res) => {
					console.log(res);
					const code = res.code;
					this.$http("user.login", {
						code
					}).then(res => {
						console.log(res);
						if (res.code === 1) {
							this.closeAuthModal();
							uni.setStorageSync('token', res.data.token);
							uni.setStorageSync('userInfo', res.data);
							// 刷新当前页面
							const pages = getCurrentPages();
							const currentPage = pages[pages.length - 1];
							if (currentPage && currentPage.onLoad) {
								currentPage.onLoad(currentPage.options || {});
							}
						}
					});
				}
			});
		},

		// 1.账号登录
		async accountLoginSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.accountLogin",
						{
							account: that.form["accountLogin"].data.account,
							password: that.form["accountLogin"].data.password
						},
						"登录中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.closeAuthModal();
							that.getUserInfo(res.data.token);
							that.$u.toast(res.msg);
						}
					});
		},

		// 2.短信登录
		async smsLoginSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.smsLogin",
						{
							mobile: that.form["smsLogin"].data.mobile,
							code: that.form["smsLogin"].data.code
						},
						"登录中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.closeAuthModal();
							that.getUserInfo(res.data.token);
							that.$u.toast(res.msg);
						}
					});
		},

		// 3.注册
		async registerSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.register",
						{
							mobile: that.form["register"].data.mobile,
							code: that.form["register"].data.code,
							password: that.form["register"].data.password
						},
						"注册中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.$u.toast(res.msg);
							that.closeAuthModal();
							that.getUserInfo(res.data.token);
						}
					});
		},

		// 4.忘记密码
		async forgotPwdSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.forgotPwd",
						{
							mobile: that.form["forgotPwd"].data.mobile,
							code: that.form["forgotPwd"].data.code,
							password: that.form["forgotPwd"].data.password
						},
						"修改中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.$u.toast(res.msg);
							if (that.isLogin) {
								that.closeAuthModal();
							} else {
								that.showAuthModal("accountLogin");
							}
						}
					});
		},

		// 5.绑定手机
		async bindMobileSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.bindMobile",
						{
							mobile: that.form["bindMobile"].data.mobile,
							code: that.form["bindMobile"].data.code,
							password: that.form["bindMobile"].data.password
						},
						"绑定中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.$u.toast(res.msg);
							that.closeAuthModal();
							that.getUserInfo();
						}
					});
		},

		// 6.修改密码
		async changePwdSubmit() {
			let that = this;
			(await that.validateSubmit()) &&
				that
					.$http(
						"user.changePwd",
						{
							oldpassword: that.form["changePwd"].data.oldPassword,
							newpassword: that.form["changePwd"].data.newPassword
						},
						"修改中..."
					)
					.then(res => {
						if (res.code === 1) {
							that.closeAuthModal();
							that.$u.toast(res.msg);
							that.getUserInfo(res.data.userinfo.token);
						}
					});
		}
	}
};
</script>

<style lang="scss" scoped>
@keyframes title-animation {
	0% {
		font-size: 32rpx;
	}

	100% {
		font-size: 36rpx;
	}
}

.form-wrap {
	.form-item {
		display: flex;
		flex-direction: column;
		font-size: 28rpx;
		padding: 20rpx 0;
		color: $u-main-color;
		box-sizing: border-box;
		line-height: $u-form-item-height;
		width: 100%;

		.item-title {
			width: 140rpx;
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
			text-align: left;
		}

		.message-error {
			text-align: left;
			font-size: 24rpx;
			line-height: 24rpx;
			color: $u-type-error;
			margin-top: 12rpx;
			margin-left: 120rpx;
		}
	}
}

.bottom-modal {
	.login-wrap {
		background-color: #fff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 30rpx;
		min-height: 600rpx;
	}

	.head-box {
		margin-bottom: 60rpx;
		text-align: center;

		.head-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}

		.head-subtitle {
			font-size: 26rpx;
			color: #999;
		}
	}

	.wx-login-box {
		margin: 60rpx 0;
		display: flex;
		justify-content: center;

		.wx-login-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 300rpx;
			height: 80rpx;
			background: #07c160;
			border-radius: 40rpx;
			color: #fff;
			font-size: 28rpx;
			border: none;
			padding: 0;

			&:active {
				opacity: 0.8;
			}

			.wx-icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 10rpx;
			}
		}
	}

	.agreement-box {
		text-align: center;
		margin-top: 60rpx;

		.agreement-text {
			font-size: 26rpx;
			color: #666;
		}

		.link {
			color: #07c160;
			display: inline;
		}
	}
}

// 修改密码
.editPwd-btn-box {
	.save-btn {
		width: 690rpx;
		line-height: 70rpx;
		background: linear-gradient(90deg, #e9b461, #eecc89);
		border-radius: 35rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #ffffff;
	}

	.forgot-btn {
		width: 690rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #999999;
	}
}
</style>
