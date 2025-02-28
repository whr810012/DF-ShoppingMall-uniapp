<template>

	<view class="page_box">

		<view class="head_box">

			<!-- tab -->

			<view class="order-nav u-flex">

				<view class="nav-item u-flex-col u-flex-1 u-col-center" v-for="nav in orderState" :key="nav.id"
					@tap="onNav(nav.type)">

					<view class="item-title">{{ nav.title }}</view>

					<text class="nav-line" :class="{ 'line-active': orderType === nav.type }"></text>

				</view>

			</view>

		</view>



		<view class="content_box">

			<scroll-view scroll-y="true" enable-back-to-top @scrolltolower="loadMore" class="scroll-box">

				<!-- 订单列表 -->

				<view v-if="orderList && orderList.length">

					<view class="order-list" v-for="order in orderList" :key="order.id"
						@tap.stop="jump('/pages/order/detail', { id: order.id })">

						<view class="order-head u-flex u-row-between">

							<text class="no">订单编号：{{ order.id }}</text>

							<text class="state">状态：

								{{ order.status === 0 ? '已取消' :

									order.status === 1 ? '已下单' :

										order.status === 2 ? '配送中' :

											order.status === 3 ? '已完成' :

												order.status === 4 ? '已申请退款' : '未知状态' }}

							</text>

						</view>

						<view class="order-info">

							<view>创建时间：{{ order.createTime }}</view>

							<vie>收货地址：{{ order.address.name }}，{{ order.address.address }}</vie>

						</view>

						<view class="rider-info" v-if="order.rider">

							<text>骑手：{{ order.rider.name }}，电话：{{ order.rider.phone }}</text>

						</view>

						<view class="goods-order" v-for="goods in order.orderDityList" :key="goods.id">

							<view class="order-content">

								<shopro-mini-card :title="goods.name" :image="order.dityUrls.length ? getAvatar(goods.shopId, order.dityUrls) : order.seckills[0].phone">

									<template #describe>

										<view class="order-sku u-ellipsis-1">

											<text class="order-num">数量:{{ goods.number }};</text>

										</view>

									</template>

									<template #cardBottom>

										<view class="order-price-box u-flex ">

											<text class="order-price font-OPPOSANS">￥{{ goods.price }}</text>

										</view>

									</template>

								</shopro-mini-card>

							</view>

						</view>

						<view class="order-bottom">

							<view class="all-msg u-flex font-OPPOSANS">

								{{ order.status <= 0 ? '需付款' : '实付款' }}： <view class="all-money font-OPPOSANS">{{ order.price }}</view>

						</view>



						<!-- 按钮 -->

						<view class="btn-box u-flex">

							<button v-if="order.status === 1" @tap.stop="onRequestRefund(order.id)"
								class="u-reset-button obtn1">申请退款</button>

							<button v-if="order.status === 3" @tap.stop="onReview(order.id)" class="u-reset-button obtn2">评价</button>

						</view>

					</view>

				</view>

		</view>



		<!-- 空白页 -->

		<shopro-empty v-if="isEmpty" :image="$IMG_URL + '/imgs/empty/empty_groupon.png'"
			tipText="暂无商品，还有更多好货等着你噢~"></shopro-empty>

		<!-- 更多 -->

		<u-loadmore v-show="orderList.length" height="80rpx" :status="loadStatus" icon-type="flower" color="#ccc" />

		</scroll-view>

	</view>

	</view>

</template>



<script>

export default {

	components: {},

	data() {

		return {

			isEmpty: false,

			loadStatus: 'loadmore', //loadmore-加载前的状态，loading-加载中的状态，nomore-没有更多的状态

			currentPage: 1,

			lastPage: 1,

			orderType: 'all',

			orderList: [],

			orderState: [{

				id: 0,

				title: '全部',

				type: 'all'

			}, {

				id: 1,

				title: '已下单',

				type: 'pay'

			},

			{

				id: 3,

				title: '待收货',

				type: 'noget'

			},

			{

				id: 4,

				title: '待评价',

				type: 'nocomment'

			},

			{

				id: 5,

				title: '退换货',

				type: 'aftersale'

			}

			]

		};

	},

	onShow() {

		if (this.$Route.query.type) {

			this.orderType = this.$Route.query.type;

		}

		this.orderList = [];

		this.currentPage = 1;

		this.lastPage = 1;

		this.getOrderList();

	},

	methods: {

		jump(path, parmas) {

			this.$Router.push({

				path: path,

				query: parmas

			});

		},



		// tab切换

		onNav(id) {

			if (this.orderType !== id) {

				this.orderType = id;

				this.orderList = [];

				this.currentPage = 1;

				this.lastPage = 1;

				this.getOrderList();

			}

		},



		// 订单列表

		getOrderList() {

			console.log('this.orderType::', this.orderType);



			let that = this;

			that.loadStatus = 'loading';

			that.$http('order.index', {



			}, '加载中...').then(res => {

				console.log('res::', res)

				if (res.code === 1) {

					that.orderList = res.data

					if (this.orderType === 'all') {

						that.orderList = that.orderList

					} else if (this.orderType === 'pay') {

						that.orderList = that.orderList.filter(item => item.status === 1)

					} else if (this.orderType === 'noget') {

						that.orderList = that.orderList.filter(item => item.status === 2)

					} else if (this.orderType === 'nocomment') {

						that.orderList = that.orderList.filter(item => item.status === 3)

					} else if (this.orderType === 'aftersale') {

						that.orderList = that.orderList.filter(item => item.status === 4 || item.status === 0)

					}

					that.isEmpty = !that.orderList.length;

					that.lastPage = res.data.last_page;

					that.loadStatus = that.currentPage < res.data.last_page ? 'loadmore' : 'nomore';

				}

			});

		},



		// 加载更多

		loadMore() {

			if (this.currentPage < this.lastPage) {

				this.currentPage += 1;

				this.getOrderList();

			}

		},



		// 删除订单

		onDelete(orderId, orderIndex) {

			let that = this;

			uni.showModal({

				title: '删除订单',

				content: '确定要删除这个订单么？',

				cancelText: '取消',

				confirmText: '删除',

				success: res => {

					if (res.confirm) {

						that.$http('order.deleteOrder', {

							id: orderId

						},

							'删除中...'

						).then(res => {

							if (res.code === 1) {

								that.$u.toast(res.msg);

								that.orderList.splice(orderIndex, 1);

							}

						});

					}

				}

			});

		},



		// 取消订单

		onCancel(id, orderIndex) {

			let that = this;

			that.$http('order.cancel', {

				id: id

			},

				'取消中...'

			).then(res => {

				if (res.code === 1) {

					that.$u.toast(res.msg);

					this.orderList.splice(orderIndex, 1);

				}

			});

		},



		// 立即购买

		onPay(id) {

			uni.navigateTo({

				url: `/pages/order/payment/method?orderId=${id}&orderType=goods`

			});

		},



		// 查看物流

		onExpress(orderId) {

			let that = this;

			that.$http('order.expressList', {

				order_id: orderId

			}).then(res => {

				if (res.code === 1) {

					if (res.data.length == 1) {

						this.jump('/pages/order/express/express-detail', {
							orderId: orderId, expressId: res

								.data[0].id
						});

					} else if (res.data.length > 1) {

						this.jump('/pages/order/express/express-list', { orderId: orderId });

					} else {

						that.$u.toast('暂无包裹~');

					}

				}

			});

		},



		onRequestRefund(orderId) {

			console.log('申请退款', orderId);

			this.$http('order.cancel',

				{},

				'',

				true,

				{

					id: orderId

				}

			).then(res => {

				console.log('res::', res);

				if (res.code === 1) {

					this.$u.toast('已申请退款');

					this.getOrderList();

				}

			})

		},



		onReview(orderId) {
			// 弹窗有一个输入框
			uni.showModal({
				title: '评价',
				editable: true, // 允许输入
				placeholderText: '请输入您的评价', // 输入框的占位符
				success: res => {
					if (res.confirm) {
						console.log('用户点击了确定，输入的内容为：', res.content);
						this.$http('order.evaluate',{
							evaluate:res.content,
							orderId:orderId
						},'评价中...').then(res=>{
							if(res.code===1){
								this.$u.toast('评价成功');
								this.getOrderList();
							}
						})
					} else if (res.cancel) {
						console.log('用户点击了取消');
					}
				}
			});
			console.log('评价', orderId);

		},



		getAvatar(shopId, dityUrls) {

			const dity = dityUrls.find(d => d.dityId === shopId);

			return dity ? dity.avatar : '';

		}

	}

};

</script>



<style lang="scss">
.order-nav {

	background: #f9f9f9;

	height: 80rpx;



	.nav-item {

		flex: 1;



		.item-title {

			font-size: 30rpx;

			font-weight: 400;


			line-height: 76rpx;

			font-family: 'Comic Sans MS', cursive, sans-serif;

		}



		.nav-line {

			width: 100rpx;

			height: 4rpx;

			background: #fff;

		}



		.line-active {
			background: #007aff;
		}

	}

}



.order-list {

	background: #fff;

	margin: 40rpx 0;

	padding: 25rpx;

	border-radius: 15rpx;

	box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);

	transition: transform 0.2s ease-in-out;



	&:hover {

		transform: translateY(-5rpx);

	}



	.order-head {

		padding: 15rpx 30rpx;

		height: auto;

		border-bottom: 1rpx solid #f0f0f0;

		margin-bottom: 15rpx;



		.no {

			font-size: 30rpx;


			font-family: 'Comic Sans MS', cursive, sans-serif;

		}



		.state {

			font-size: 30rpx;


			font-family: 'Comic Sans MS', cursive, sans-serif;

		}

	}



	.order-info,
	.rider-info {

		padding: 15rpx 30rpx;

		height: auto;

		border-bottom: 1rpx solid #f0f0f0;

		margin-bottom: 15rpx;



		text {

			font-size: 28rpx;


			font-family: 'Comic Sans MS', cursive, sans-serif;

		}

	}



	.goods-order {

		border-bottom: 1px solid rgba(223, 223, 223, 0.5);

		padding: 25rpx 25rpx 0;

		margin-bottom: 25rpx;



		.order-content {

			padding-bottom: 25rpx;



			.order-sku {

				font-size: 28rpx;


				width: 450rpx;

				margin-bottom: 25rpx;

				font-family: 'Comic Sans MS', cursive, sans-serif;



				.order-num {

					margin-right: 12rpx;

				}

			}



			.order-price-box {

				.order-price {

					font-size: 30rpx;

					font-weight: 600;


					font-family: 'Comic Sans MS', cursive, sans-serif;

				}

			}

		}

	}



	.order-bottom {

		padding: 25rpx 30rpx;



		.btn-box {

			justify-content: flex-end;

			margin-top: 15rpx;

		}



		.all-msg {

			font-size: 28rpx;


			justify-content: flex-end;

			margin-bottom: 15rpx;

			padding: 0 35rpx;

			font-family: 'Comic Sans MS', cursive, sans-serif;



			.all-unit {

				font-size: 24rpx;

			}



			.all-money {

				font-size: 30rpx;


				font-weight: 500;



				&::before {

					content: '￥';

					font-size: 24rpx;

				}

			}

		}



		.obtn1,
		.obtn2,
		.obtn3 {

			width: 190rpx;

			line-height: 65rpx;

			border-radius: 35rpx;

			font-size: 30rpx;

			font-weight: 400;

			margin-right: 25rpx;

			padding: 0;

			transition: background-color 0.3s ease;



			&:hover {}

		}



		.obtn1 {

			background: #ffe4e1;

			color: #333;

		}



		.obtn2 {


			box-shadow: 0px 8rpx 7rpx 0px rgba(229, 138, 0, 0.22);

			color: #007aff;

		}



		.obtn3 {

			background: #ffcccb;

			color: #e50808;

		}

	}

}
</style>
