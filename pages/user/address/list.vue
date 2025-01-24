<!-- 地址列表 -->
<template>
	<view class="address-wrap">
		<view class="address-list" v-for="address in addressList" :key="address.id" @tap="useAddress(address)">
			<view class="top u-flex">
				<text class="name">{{ address.name }}</text>
				<text class="phone">{{ address.phone }}</text>
				<text class="tag" v-show="address.is_default === '1'">默认</text>
			</view>
			<view class="detail">{{ address.address }}</view>
			<view class="btn-group">
				<button class="u-reset-button set-btn" @tap.stop="jump('/pages/user/address/edit', { id: address.id })">编辑</button>
				<button class="u-reset-button del-btn" @tap.stop="deleteAddress(address.id)">删除</button>
			</view>
		</view>

		<view class="foot_box-wrap safe-area-inset-bottom">
			<view class="foot_box u-flex u-row-between safe-area-inset-bottom">
				<!-- 微信小程序和微信H5 -->
				<button class="u-reset-button add-btn u-m-20" @tap="jump('/pages/user/address/edit')">添加新的收货地址</button>
			</view>
		</view>
	</view>
</template>

<script>
import Auth from '@/shopro/permission/index.js';
export default {
	components: {},
	data() {
		return {
			addressList: [],
			platform: this.$platform.get()
		};
	},
	computed: {},
	onLoad() {},
	onShow() {
		this.getAddressList();
	},
	methods: {
		// 选中
		useAddress(addressData) {
			uni.$emit('SELECT_ADDRESS', { addressData: JSON.stringify(addressData) });
			uni.navigateBack()
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		// 微信导入
		getWXaddress() {
			let authState = new Auth('address').check();
			// #ifdef MP
			authState &&
				uni.chooseAddress({
					success: res => {
						this.jump('/pages/user/address/edit', { addressData: res });
					},
					fail: err => {
						console.log('%cuni.chooseAddress,调用失败', 'color:green;background:yellow');
					}
				});
			// #endif
			// #ifdef H5
			this.$wxsdk.openAddress(res => {
				this.jump('/pages/user/address/edit', { addressData: res });
			});
			// #endif
		},
		getAddressList() {
			// 传一个userid
			const userId = uni.getStorageSync('userInfo').id;
			this.$http('address.list', { user_id: userId }).then(res => {	
				if (res.code === 1) {
					this.addressList = res.data || [];		
					!this.addressList.length && uni.$emit('SELECT_ADDRESS', { addressData: null });
				}
			});
		},
		// 删除地址
		deleteAddress(id) {
			uni.showModal({
				title: '提示',
				content: '确定要删除该地址吗？',
				success: (res) => {
					if (res.confirm) {
						this.$http('address.del', { ids: [id] }).then(res => {
							if (res.code === 1) {
								uni.showToast({
									title: '删除成功',
									icon: 'none'
								});
								this.getAddressList();
							}
						});
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.address-list {
	padding: 40rpx;
	position: relative;
	background: #fff;
	margin-bottom: 20rpx;

	.name {
		font-size: 30rpx;
		font-weight: 600;
	}

	.phone {
		font-size: 30rpx;
		margin: 0 20rpx;
	}

	.tag {
		background: rgba(233, 191, 113, 0.2);
		border-radius: 6rpx;
		padding: 0 16rpx;
		line-height: 38rpx;
		color: #a8700d;
		font-size: 22rpx;
	}

	.detail {
		margin-top: 25rpx;
		width: 543rpx;
		font-size: 26rpx;

		font-weight: 400;
		color: rgba(153, 153, 153, 1);
		line-height: 40rpx;
	}

	.btn-group {
		position: absolute;
		top: 40rpx;
		right: 40rpx;
		display: flex;
		align-items: center;
	}

	.set-btn {
		background: none;
		font-size: 26rpx;
		color: #a8700d;
		margin-right: 20rpx;
	}

	.del-btn {
		background: none;
		font-size: 26rpx;
		color: #ff5555;
	}
}

// 底部按钮
.foot_box-wrap {
	height: 140rpx;
	width: 100%;
}
.foot_box {
	padding: 10rpx 20rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: #fff;
	border-top: 1rpx solid rgba(#ccc, 0.2);
	.sync-wxaddress {
		flex: 1;
		line-height: 80rpx;
		background: rgba(255, 255, 255, 1);
		border-radius: 40rpx;
		box-shadow: 0 0 1rpx 6rpx rgba(#ccc, 0.2);
	}
	.add-btn {
		line-height: 80rpx;
		flex: 1;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>
