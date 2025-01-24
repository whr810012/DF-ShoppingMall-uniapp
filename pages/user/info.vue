<!-- 个人信息 -->
<template>
	<view class="container">
		<view class="u-flex u-row-between u-p-x-30 info-head u-p-y-20">
			<view class="info-title">基本信息</view>
			<button class="u-reset-button save-btn" :class="{ 'dis-btn': editInfoDisabled }" :disabled="editInfoDisabled"
				@tap="editUserInfo">
				保存
			</button>
		</view>
		<view class="user-list u-flex u-row-between">
			<text class="list-name">头像</text>
			<view class="u-flex" @tap="onChooseImg">
				<image class="avatar" :src="userData.avatar" mode=""></image>
				<text class="u-iconfont uicon-arrow-right u-m-l-20" style="color:#999;"></text>
			</view>
		</view>
		<view class="user-list u-flex u-row-between">
			<text class="list-name">昵称</text>
			<view class="u-flex">
				<input class="list-val" v-model="userData.name" @input="onChangeNickName" @blur="onChangeNickName"
					@confirm="onChangeNickName" placeholder="请输入昵称~" maxlength="50"
					placeholder-style="color:#c8c9cc;fontSize:28rpx" />
				<text class="u-iconfont uicon-arrow-right u-m-l-20" style="color:#999;"></text>
			</view>
		</view>
		<view class="user-list u-flex u-row-between" @tap="changeSex">
			<text class="list-name">性别</text>
			<view class="u-flex">
				<text class="list-val">{{ userData.sex === '1' ? '男' : userData.sex === '2' ? '女' : '未设置' }}</text>
				<text class="u-iconfont uicon-arrow-right u-m-l-20" style="color:#999;"></text>
			</view>
		</view>

		<view class="user-list u-flex u-row-between">
			<text class="list-name">手机号</text>
			<view class="u-flex">
				<input class="list-val" v-model="userData.phone" @input="onChangePhone" @blur="onChangePhone"
					@confirm="onChangePhone" placeholder="请输入手机号" maxlength="11"
					placeholder-style="color:#c8c9cc;fontSize:28rpx" />
				<text class="u-iconfont uicon-arrow-right u-m-l-20" style="color:#999;"></text>
			</view>
		</view>

		<view class="btn-box u-flex u-row-center u-col-center">
			<button hover-class="hover-logout-btn" class="u-reset-button logout-btn" @tap="showModal = true">
				退出登录
			</button>
		</view>

		<!-- 登录提示 -->
		<shopro-auth-modal v-if="authType"></shopro-auth-modal>
		<!-- 日历 -->
		<u-picker @confirm="changeCalendar" mode="time" confirm-color="#e9b461" v-model="showCalendar" :params="{
			year: true,
			month: true,
			day: true,
			hour: false,
			minute: false,
			second: false
		}"></u-picker>
		<!-- modal -->
		<u-modal ref="uModal" v-model="showModal" :show-cancel-button="true" confirm-color="#F54141" cancel-color="#666666"
			@confirm="confirmLogOut" content="确定退出登录？"></u-modal>
		<!-- 性别选择器 -->
		<u-picker @confirm="confirmSex" mode="selector" :range="sexList" range-key="name" v-model="showSexPicker"
			confirm-color="#e9b461"></u-picker>
	</view>
</template>

<script>
import { mapMutations, mapActions, mapState, mapGetters } from "vuex";
import Auth from "@/shopro/permission/index.js";
import wechat from "@/shopro/wechat/wechat";

export default {
	components: {},
	data() {
		return {
			platform: this.$platform.get(),
			userData: {
				avatar: "",
				name: "",
				phone: "",
				createTime: "",
				id: null,
				openid: "",
				sex: null
			},
			showCalendar: false,
			showModal: false,
			showSexPicker: false,
			sexList: [
				{ name: '男', value: 1 },
				{ name: '女', value: 2 }
			],
			editInfoDisabled: true,
		};
	},
	computed: {
		...mapGetters(["userInfo", "authType"])
	},
	onLoad() {
		this.$http('user.getUserInfo').then(res => {
			console.log(res.data)
			this.userData = res.data
		})
	},
	methods: {
		...mapActions(["getUserInfo", "showAuthModal", "logout"]),
		// 选择日期
		changeCalendar(e) {
			this.userData.birthday = `${e.year}-${e.month}-${e.day}`;
			this.editInfoDisabled = this.userData.birthday == this.userInfo.birthday;
		},
		// 修改密码
		changePwd() {
			this.showAuthModal("changePwd");
		},
		// 修改昵称
		onChangeNickName() {
			this.editInfoDisabled = false;
		},
		// 修改手机号
		onChangePhone() {
			const phoneReg = /^1[3-9]\d{9}$/;
			if (this.userData.phone && !phoneReg.test(this.userData.phone)) {
				this.$u.toast('请输入正确的手机号');
				return;
			}
			this.editInfoDisabled = false;
		},
		// 修改信息
		editUserInfo() {
			let that = this;
			if (!that.userData.name) {
				this.$u.toast("昵称不能为空");
				return false;
			}

			// 校验手机号
			const phoneReg = /^1[3-9]\d{9}$/;
			if (that.userData.phone && !phoneReg.test(that.userData.phone)) {
				this.$u.toast('请输入正确的手机号');
				return false;
			}

			// 校验性别
			if (!that.userData.sex) {
				this.$u.toast('请选择性别');
				return false;
			}

			// 如果有新选择的图片，先上传图片
			if (that.userData.tempFilePath) {
				uni.uploadFile({
					url: that.$BASE_URL + "/user/amend",
					filePath: that.userData.tempFilePath,
					name: 'image',
					formData: {
						name: that.userData.name,
						phone: that.userData.phone,
						sex: that.userData.sex,
						id: that.userData.id
					},
					header: {
						'authentication': uni.getStorageSync("token")
					},
					success: (uploadRes) => {
						const res = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
						if (res.code === 1) {
							this.$http('user.getUserInfo').then(res => {
								console.log(res.data)
								this.userData = res.data
							})
							that.editInfoDisabled = true;
							that.$u.toast("保存成功");
							that.userData.tempFilePath = null;
						} else {
							that.$u.toast(res.msg || "保存失败");
						}
					},
					fail: (err) => {
						that.$u.toast("保存失败");
						console.error(err);
					}
				});
			} else {
				// 没有新图片，直接提交表单数据
				uni.request({
					url: that.$BASE_URL + "/user/amend",
					method: "POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded',
						'authentication': uni.getStorageSync("token")
					},
					data: {
						name: that.userData.name,
						phone: that.userData.phone,
						sex: that.userData.sex,
						id: that.userData.id
					},
					success: (res) => {
						if (res.data.code === 1) {
							this.$http('user.getUserInfo').then(res => {
								console.log(res.data)
								this.userData = res.data
							})
							that.editInfoDisabled = true;
							that.$u.toast("保存成功");
						} else {
							that.$u.toast(res.data.msg || "保存失败");
						}
					},
					fail: (err) => {
						that.$u.toast("保存失败");
						console.error(err);
					}
				});
			}
		},
		// 更换头像
		async onChooseImg() {
			let authState = 0;
			authState += await new Auth("writePhotosAlbum").check();
			if (authState < 1) return;
			authState += await new Auth("camera").check();
			if (authState < 2) return;
			const chooseImageRes = await this.chooseImage(1);
			this.userData.tempFilePath = chooseImageRes[0];  // 保存临时文件路径
			this.userData.avatar = chooseImageRes[0];  // 用于预览显示
			this.editInfoDisabled = false;
		},

		// 退出登录
		confirmLogOut() {
			// 将本地token清空刷新页面
			uni.removeStorageSync('token');
			// 刷新页面
			uni.reLaunch({
				url: '/pages/index/user'
			});
		},
		// 图片处理-选择图片
		async chooseImage(count = 1) {
			return new Promise((resolve, reject) => {
				uni.chooseImage({
					count: count, //默认9
					sizeType: ["compressed"], //只使用压缩图
					sourceType: ["album"], //从相册选择
					success: res => {
						// 检查图片大小
						const tempFilePath = res.tempFilePaths[0];
						uni.getFileInfo({
							filePath: tempFilePath,
							success: (fileInfo) => {
								const fileSize = fileInfo.size;
								// 如果大于1MB，提示错误
								if (fileSize > 1048576) {
									uni.showToast({
										title: '图片大小不能超过1MB',
										icon: 'none'
									});
									reject('图片太大');
									return;
								}
								resolve(res.tempFilePaths);
							},
							fail: (err) => {
								console.error('获取文件信息失败：', err);
								reject(err);
							}
						});
					},
					fail: (err) => {
						console.error('选择图片失败：', err);
						reject(err);
					}
				});
			}).catch(e => {
				console.log(e);
				return [];
			});
		},
		// 图片处理-上传图片
		async uploadImage(url) {
			const that = this;
			return new Promise((resolve, reject) => {
				that.$u.toast("上传中...");
				uni.uploadFile({
					url: that.$BASE_URL + "/api/common/upload",
					filePath: url,
					name: "file",
					header: { token: uni.getStorageSync("token") },
					success: res => {
						res = JSON.parse(res.data);
						if (res.code === 1) {
							that.$u.toast("上传成功");
							resolve(res.data);
						} else {
							that.$u.toast("上传失败");
						}
					},
					complete: e => {
						uni.hideLoading();
					}
				});
			}).catch(e => {
				console.log(e);
			});
		},
		// 打开性别选择器
		changeSex() {
			this.showSexPicker = true;
		},

		// 确认性别选择
		confirmSex(e) {
			console.log('性别选择返回数据：', e);
			if (typeof e === 'number') {
				// 直接返回索引的情况
				this.userData.sex = String(this.sexList[e].value);
				this.editInfoDisabled = false;
			} else if (e && e.value) {
				// 返回对象的情况
				this.userData.sex = String(e.value);
				this.editInfoDisabled = false;
			} else if (Array.isArray(e) && e.length > 0) {
				// 返回数组的情况
				this.userData.sex = String(this.sexList[e[0]].value);
				this.editInfoDisabled = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
// 基本信息
.info-head {
	.info-title {
		line-height: 60rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
	}

	.save-btn {
		color: #fff;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		width: 100rpx;
		border-radius: 30rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 28rpx;
	}

	.dis-btn {
		opacity: 0.5;
	}
}

// 三方
.other-account {
	.head-title {
		line-height: 82rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
	}

	.list-img {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.account-list {
		background-color: #fff;
		height: 100rpx;
		padding: 0 20rpx;

		.info {
			.avatar {
				width: 38rpx;
				height: 38rpx;
				border-radius: 50%;
				overflow: hidden;
			}

			.name {
				font-size: 28rpx;
				font-weight: 400;
				color: #999999;
			}
		}

		.bind-box {
			.bind-btn {
				padding: 0 20rpx;
				line-height: 60rpx;
				background: #f5f6f8;
				border-radius: 20rpx;
				color: #999;
			}

			.relieve-btn {
				border-radius: 20rpx;
				padding: 0 20rpx;
				line-height: 60rpx;
				background: rgba(#ff0000, 0.05);
				color: #ff0000;
			}
		}
	}
}

// 个人信息项
.user-list {
	background: #fff;
	height: 100rpx;
	border-bottom: 1rpx solid #f6f6f6;
	padding: 0 20rpx;

	.list-name {
		font-size: 28rpx;
	}

	.avatar {
		width: 67rpx;
		height: 67rpx;
		border-radius: 50%;
	}

	.list-val {
		color: #999;
		font-size: 28rpx;
		text-align: right;
	}
}

.btn-box {
	margin-top: 200rpx;

	.logout-btn {
		width: 710rpx;
		height: 80rpx;
		line-height: 80rpx;
		border: 1rpx solid #f54141;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 500;
		color: #f54141;
	}

	.hover-logout-btn {
		width: 710rpx;
		height: 80rpx;
		background: #f54141;
		border: 1rpx solid #f54141;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 500;
		color: #ffffff;
	}
}
</style>
