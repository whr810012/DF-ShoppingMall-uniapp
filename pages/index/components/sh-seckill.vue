<template>
	<!-- 活动商品 -->
	<view class="activity-wrap u-p-x-20 u-p-b-20  u-m-b-10 seckill-card" v-if="showActivity">
		<!-- 标题栏 -->
		<view class="title-box u-flex u-row-between u-p-y-20  seckill-title">
			<view class="u-flex u-col-center">
				<view class="title-text u-m-r-20 u-ellipsis-1">{{ detail.name }}</view>
			</view>
			<view class="more-box u-flex" @tap="$Router.push('/pages/activity/seckill/list')">
				<text class="more-text u-m-r-10">更多抢购</text>
				<text class="iconfont icon-youjiantou-tianchong more-icon"></text>
			</view>
		</view>
		<!--b-->
		<view class="big-goods  u-flex u-p-20 u-col-top u-m-b-16" v-for="item in goodsList"
			:key="item.id" @tap="jump('/pages/goods/detail', { id: item.id })">
			<image class="goods-img" :src="item.image" mode="aspectFill"></image>
				<view class=" card-right u-m-l-20 u-flex-col u-row-between">
					<view class="">
						<view class="goods-title u-ellipsis-1 u-m-t-10 u-m-b-10">
							<view class=" sm cu-tag bg-red radius title-tag u-m-r-10">秒杀</view>
							{{ item.title }}
						</view>
						<view class="u-flex u-col-center">
							<u-count-down :timestamp="item.countdown" separator-color="#ffbbbb" bg-color="#ffbbbb"
								:ref="'countdown_' + item.id" color="#fff" @end="() => seckillEnd(item.id)" autoplay></u-count-down>
						</view>
					</view>

					<view class="u-flex u-m-y-20">
						<u-line-progress style="width:210rpx;" height="18" :show-percent="false" :percent="Number(item.percent)"
							inactive-color=" #e7e7e7" active-color="#ffbbbb "></u-line-progress>

						<view class="progress-text">剩余{{ item.number }}件</view>
					</view>

					<view class=" u-flex u-row-between u-col-center">
						<view class="u-flex u-col-bottom">
							<view class="price u-m-r-10">{{ item.price }}</view>
						</view>
						<button class="u-reset-button buy-btn">去抢购</button>
					</view>
				</view>
		</view>
	</view>
</template>

<script>
/**
 * 自定义之秒杀样式组件
 * @property {Object} detail - 秒杀商品信息
 */
export default {
	components: {},
	data() {
		return {
			timestamp: 0, //倒计时
			goodsList: [],
			showActivity: true, //是否显示活动。
		};
	},
	props: {
		detail: {
			type: Object,
			default: () => {
				return {}
			}
		},
		seckillList: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	watch: {},
	computed: {},
	mounted() {
		this.getActivityGoodsList();
	},
	methods: {
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},

		// 秒杀计时结束
		seckillEnd(itemId) {
			// 找到对应的商品并从列表中移除
			const index = this.goodsList.findIndex(item => item.id === itemId);
			if (index !== -1) {
				this.goodsList.splice(index, 1);
			}
			// 如果没有商品了，隐藏整个活动
			if (this.goodsList.length === 0) {
				this.showActivity = false;
			}
		},

		// 获取秒杀商品
		getActivityGoodsList() {
			let that = this;
			// 只显示十个最多
			that.goodsList = this.seckillList.slice(0, 10);
			let nowTime = new Date().getTime();
			
			that.goodsList = that.goodsList.map(item => {
				// 计算销售百分比
				item.percent = item.number > 0 ? ((item.number) * 100).toFixed(2) : 0;
				// 格式化价格显示
				item.price = Number(item.price).toFixed(2);
				// 使用商品图片
				item.image = item.avatar;
				// 使用商品名称作为标题
				item.title = item.name;
				// 计算倒计时
				const endTime = new Date(item.endTime).getTime();
				item.countdown = Math.max(0, Math.floor((endTime - nowTime) / 1000));
				return item;
			}).filter(item => item.countdown > 0); // 只保留还未结束的商品
			
			// 如果没有有效商品，隐藏活动
			if (that.goodsList.length === 0) {
				that.showActivity = false;
				return;
			}

			// 在下一个 tick 启动所有倒计时
			that.$nextTick(() => {
				that.goodsList.forEach(item => {
					const countdownRef = that.$refs['countdown_' + item.id];
					if (countdownRef && countdownRef[0]) {
						countdownRef[0].start();
					}
				});
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.seckill-card {
	background: linear-gradient(#ffebec 20%, #fff 30%, #fff 100%);
}

.seckill-title {
	background: url($IMG_URL+'/imgs/tag/seckill_title_bg.png') no-repeat;
	background-position: center top;
	background-size: 100% auto;
}

.activity-wrap {
	background-color: #fff;
	min-height: 300rpx;

	.title-box {
		.title-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
		}

		.more-box {
			.more-text {
				font-size: 22rpx;
				font-weight: 500;
				color: #333333;
			}

			.more-icon {
				font-size: 24rpx;
				color: #333333;
			}
		}
	}

	.scroll-box,
	.goods-box {
		height: 380rpx;
		width: 100%;
	}
}

// 小商品卡片
.min-goods {
	width: 220rpx;
	height: 380rpx;
	background: #fff7f7;
	box-shadow: 0px 7rpx 7rpx 0px rgba(255, 80, 94, 0.32);
	border-radius: 10rpx;

	.img-box {
		width: 220rpx;
		height: 220rpx;
		overflow: hidden;
		position: relative;
		border-radius: 10rpx 10rpx 0 0;

		.img {
			width: 220rpx;
			height: 220rpx;
			background-color: #ccc;
		}
	}

	.mgoods-card-bottom {
		height: 160rpx;
		background: url($IMG_URL+'/imgs/tag/seckill_goods_bg.png') no-repeat;
		background-position: bottom center;
		background-size: 100% 100%;
	}

	.goods-title {
		font-size: 26rpx;
		font-weight: 500;
		color: #000000;
		line-height: 26rpx;
	}

	.price-box {
		.price {
			font-size: 30rpx;
			font-weight: 500;
			color: #ff0000;

			&::before {
				content: '￥';
				font-size: 24rpx;
			}
		}

		.original-price {
			font-size: 20rpx;
			font-weight: 500;
			text-decoration: line-through;
			color: #c4c4c4;
		}
	}
}

// 大商品卡片
.big-goods {
	width: 710rpx;
	min-height: 260rpx;
	background: #ffffff;
	box-shadow: 0px 7rpx 8rpx 1rpx rgba(254, 76, 29, 0.05);
	border-radius: 20rpx;

	.goods-img {
		width: 220rpx;
		height: 220rpx;
		border-radius: 6rpx;
	}

	.card-right {
		width: 430rpx;
		height: 100%;
	}

	.goods-title {
		font-size: 26rpx;
		font-weight: 600;
		width: 400rpx;
		color: #000000;
	}

	.subtitle-text {
		font-size: 22rpx;
		width: 400rpx;
		font-weight: 500;
		color: #666666;
	}

	.buy-btn {
		width: 120rpx;
		line-height: 50rpx;
		background: linear-gradient(90deg, #d01325, #ed3c30);
		border-radius: 25rpx;
		font-size: 24rpx;
		font-weight: 500;
		color: #ffffff;
	}

	.progress-text {
		color: #c4c4c4;
		font-size: 20rpx;
		margin-left: 25rpx;
	}

	// 价格
	.price {
		color: #ff0000;
		font-weight: 600;

		&::before {
			content: '￥';
			font-size: 20rpx;
		}
	}

	.origin-price {
		color: #c4c4c4;
		font-size: 24rpx;
		text-decoration: line-through;

		&::before {
			content: '￥';
			font-size: 20rpx;
		}
	}
}
</style>
