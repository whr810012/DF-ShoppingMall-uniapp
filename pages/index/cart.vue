<!-- 购物车 -->
<template>
	<view class="page_box">
		<!-- 总数 -->
		<view class="head_box" v-show="!isEmpty">
			<view class="tool-box u-flex u-row-between">
				<view class="count-box">
					共
					<text class="all-num">{{ cartList.length }}</text>
					件商品
				</view>
				<button class="u-reset-button set-btn" @tap="isTool = !isTool">{{ isTool ? '完成' : '编辑' }}</button>
			</view>
		</view>

		<view class="content_box">
			<!-- 列表 -->
			<u-checkbox-group @change="checkboxGroupChange" activeColor="#e9b461" v-if="!isEmpty">
				<view class="collect-list u-flex u-row-left u-col-center" v-for="(g, index) in cartList" :key="index">
					<u-checkbox class="u-p-l-10" :name="g.goods_id" shape="circle" v-model="g.checked">
						<view style="height: 160rpx"></view>
					</u-checkbox>
					<view class="goods-wrap">
						<view class="lose-box"
							v-if="g.cart_type === 'invalid' || (g.cart_type === 'activity' && !isActivityPay)">
							<text v-if="g.cart_type === 'invalid'" class="iconfont icon-yishixiao"></text>
							<view v-if="g.cart_type === 'activity' && !isActivityPay"
								class="invalid-tips u-flex u-row-center u-col-center">活动商品,仅支持单独购买</view>
						</view>
						<shopro-mini-card :image="g.goods.image" :title="g.goods.title"
							@click="$Router.push({ path: '/pages/goods/detail', query: { id: g.goods.id } })">
							<template #describe>
								<view class="order-sku u-ellipsis-1">
									<text
										class="order-num">{{ g.sku_price && g.sku_price.goods_sku_text ? g.sku_price.goods_sku_text : '' }}</text>
								</view>
							</template>
							<template #cardBottom>
								<view class="order-price-box u-flex u-row-between" @tap.stop>
									<text
										class="order-price font-OPPOSANS">￥{{ g.sku_price ? g.sku_price.price : 0 }}</text>
									<u-number-box :value="g.number" :long-press="false" :min="1" :step="1"
										:index="index" :max="999999999999" @min="onMin(g)"
										@minus="changeNum($event, g)" @plus="changeNum($event, g)"
										@change="changeNum($event, g)">
									</u-number-box>
								</view>
							</template>
						</shopro-mini-card>
					</view>
				</view>
			</u-checkbox-group>

			<!-- 数据为空 -->
			<shopro-empty v-if="isEmpty" :image="$IMG_URL + '/imgs/empty/empty_cart.png'" tipText="购物车空空如也,快去逛逛吧~">
			</shopro-empty>
		</view>

		<!-- 底部按钮 -->
		<view class="foot_box " v-show="!isEmpty">
			<view class="tools-box u-flex u-row-between">
				<u-checkbox @change="onAllSel" activeColor="#e9b461" shape="circle" :value="allSelected">
					全选（{{ totalCount.totalNum }}）</u-checkbox>
				<view class="u-flex">
					<view class="price font-OPPOSANS" v-show="!isTool">￥{{ totalCount.totalPrice.toFixed(2) }}</view>
					<button class="u-reset-button pay-btn" :disabled="!isSel" v-show="!isTool" @tap="onPay">结算</button>
					<button class="u-reset-button del-btn" v-show="isTool" @tap="goodsDelete">删除</button>
				</view>
			</view>
		</view>
		<!-- <shopro-tabbar></shopro-tabbar> -->
	</view>
</template>

<script>
	import { mapMutations, mapActions, mapState, mapGetters } from 'vuex';
	let timer = null;
	export default {
		components: {},
		data() {
			return {
				maxStep: 999,
				isTool: false,
				cartList: [],
				isInitializing: true,
				allSelected: false  // 添加本地全选状态
			};
		},
		computed: {
			...mapGetters(['authType', 'isLogin', 'isActivityPay']),
			isEmpty() {
				return !this.cartList.length;
			},
			// 计算总价和选中数量
			totalCount() {
				let totalNum = 0;
				let totalPrice = 0;
				this.cartList.forEach(item => {
					if (item.checked) {
						totalNum += 1;
						totalPrice += item.number * item.price;
					}
				});
				return {
					totalNum,
					totalPrice
				};
			},
			// 是否有选中的商品
			isSel() {
				return this.cartList.some(item => item.checked);
			}
		},
		onShow() {
			this.isInitializing = true;  // 设置初始化标志
			this.$http('cart.index').then(res => {
				if (res.code === 1) {
					let cartData = res.data.records;
					cartData = cartData.map(item => ({
						...item,
						goods: {
							image: item.dityUrl?.[0]?.avatar || '',
							title: item.present,
							id: item.id
						},
						goods_num: item.number,
						sku_price: {
							price: item.price,
							stock: item.number
						}
					}));
					this.cartList = cartData;
					this.$nextTick(() => {
						this.cartList.forEach(item => {
							this.$set(item, 'checked', false);
						});
						setTimeout(() => {
							this.isInitializing = false;  // 初始化完成
						}, 100);
					});
				}
			}).catch(e => {
				console.error(e);
				this.isInitializing = false;
			});
		},
		onHide() {
			this.isTool = false;
		},
		methods: {
			...mapActions(['getCartList', 'changeCartList']),

			// 到达最小值
			onMin(g) {
				uni.showModal({
					title: '删除提示',
					confirmColor: '#f0c785',
					content: `是否确认从购物车中删除此商品?`,
					success: res => {
						if (res.confirm) {
							this.$http('cart.del',
								[g.id]
							).then(res => {
								if (res.code === 1) {
									this.$u.toast('删除成功');
									this.getCartList();
								}
							});
						}
					}
				});
			},
			
			// 更改商品数
			async changeNum(e, g) {
				// 如果是初始化阶段，不执行更新
				if (this.isInitializing) return;
				
				// 检查数量限制
				if (e.value <= 0) {
					this.onMin(g);
					return;
				}
				
				
				// 限制最大购买数量为999
				if (e.value > 999) {
					this.$u.toast('超出最大购买数量限制');
					return;
				}
				
				uni.showLoading({
					mask: true
				});
				
				await this.$http('cart.edit', {
					id: g.id,
					number: e.value
				}).then(res => {
					if (res.code === 1) {
						// 更新本地数据
						const index = this.cartList.findIndex(item => item.id === g.id);
						if (index !== -1) {
							this.cartList[index].number = e.value;
							this.cartList[index].goods_num = e.value;
						}
						this.$u.toast('修改成功');
					}
				}).catch(() => {
					this.$u.toast('修改失败');
				});
				
				uni.hideLoading();
			},

			// 单选
			checkboxGroupChange(e) {
				// 检查是否全部选中
				this.allSelected = this.cartList.every(item => item.checked);
			},

			// 路由跳转
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			},

			// 全选
			onAllSel() {
				this.allSelected = !this.allSelected;
				// 更新所有商品的选中状态
				this.cartList.forEach(item => {
					item.checked = this.allSelected;
				});
			},

			// 删除
			goodsDelete() {
				let selectedIdsArray = [];
				this.cartList.forEach(item => {
					if (item.checked) {
						selectedIdsArray.push(item.id);
					}
				});
				
				this.$http('cart.del', 
					selectedIdsArray
				).then(res => {
					if (res.code === 1) {
						this.$u.toast('删除成功');
						this.getCartList();
					}
				});
			},

			// 结算
			onPay() {
				let that = this;
				let { cartList } = this;
				if (this.isSel) {
					let confirmcartList = [];
					for (let item of this.cartList) {
						if (item.checked) {
							confirmcartList.push({
								goods_id: item.id,
								sku_price_id: item.id,
								goods_price: item.price,
								goods_num: item.number
							});
						}
					}
					that.jump('/pages/order/confirm', { goodsList: confirmcartList, from: 'cart' });
				}
			}
		}
	};
</script>

<style lang="scss">
	// 总计商品
	.head_box {
		.tool-box {
			height: 90rpx;
			padding: 0 30rpx;
			background: #f7f5f6;

			.count-box {
				font-size: 26rpx;
				color: #999;

				.all-num {
					color: #a8700d;
				}
			}

			.set-btn {
				background: none;
				font-size: 26rpx;
				color: #a8700d;
			}
		}
	}

	// 空白页
	.empty-box {
		flex: 1;
		width: 100%;
		height: 100%;
	}

	// 购物车项
	.collect-list {
		background: #fff;
		width: 750rpx;
		margin-bottom: 20rpx;
		padding: 20rpx 10rpx;

		// 商品卡片包裹
		.goods-wrap {
			position: relative;

			.order-sku {
				font-size: 24rpx;
				font-weight: 400;
				color: rgba(153, 153, 153, 1);
				width: 440rpx;
				margin-bottom: 20rpx;

				.order-num {
					margin-right: 10rpx;
				}
			}

			.order-price-box {
				.status-btn {
					height: 32rpx;
					border: 1rpx solid rgba(207, 169, 114, 1);
					border-radius: 15rpx;
					font-size: 20rpx;
					font-weight: 400;
					color: rgba(168, 112, 13, 1);
					padding: 0 10rpx;
					margin-left: 20rpx;
					background: rgba(233, 183, 102, 0.16);
				}

				.order-price {
					font-size: 26rpx;
					font-weight: 600;
					color: #ff0000;
				}
			}

			.lose-box {
				position: absolute;
				z-index: 10;
				width: 100%;
				height: 100%;
				background-color: rgba(#fff, 0.8);

				.icon-yishixiao {
					position: absolute;
					bottom: 0rpx;
					right: 80rpx;
					font-size: 140rpx;
					line-height: 140rpx;
					color: #dbdbdb;
					transform: rotate(-30deg);
				}

				.invalid-tips {
					position: absolute;
					top: 0;
					right: 0;
					left: 0;
					bottom: 0;
					margin: auto;
					width: 400rpx;
					height: 60rpx;
					border-radius: 30rpx;
					color: #fff;
					background-color: rgba(#000, 0.35);
				}
			}
		}

		.tag-box {
			.tag1 {
				line-height: 36rpx;
				padding: 0 8rpx;
				font-size: 18rpx;
				color: rgba(#fff, 0.9);
				background: #f39800;
				display: inline-block;
				box-sizing: border-box;
			}

			.tag2 {
				line-height: 34rpx;
				padding: 0 8rpx;
				font-size: 18rpx;
				color: rgba(#f39800, 0.9);
				background: #fff;
				border-top: 1rpx solid #f39800;
				border-right: 1rpx solid #f39800;
				border-bottom: 1rpx solid #f39800;
				display: inline-block;
				box-sizing: border-box;
			}
		}

		.price-box {
			width: 420rpx;

			.price {
				color: #e1212b;
			}
		}
	}

	.tools-box {
		height: 100rpx;
		width: 750rpx;
		padding: 0 20rpx;
		background: #fff;

		.check-all {
			font-size: 26rpx;

			.check-all-radio {
				transform: scale(0.7);
				color: #e9b564;
			}
		}

		.price {
			color: #ff0000;
			font-size: 500;
			margin-right: 30rpx;
		}

		.pay-btn {
			width: 200rpx;
			line-height: 70rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			border-radius: 35rpx;
			padding: 0;
			color: rgba(#fff, 0.9);
		}

		.del-btn {
			width: 200rpx;
			line-height: 70rpx;
			background: linear-gradient(90deg, rgba(244, 71, 57, 1) 0%, rgba(255, 102, 0, 1) 100%);
			border-radius: 35rpx;
			padding: 0;
			color: rgba(#fff, 0.9);
		}
	}
</style>
