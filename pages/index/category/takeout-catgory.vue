<template>
	<view class="catgory-wrap">
		<view class="u-flex wrapper-box">
			<!-- 左侧分类列表 -->
			<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view" :scroll-top="scrollLeftTop">
				<view v-for="(item, index) in tabbarList" :key="index" class="u-tab-item u-ellipsis-1"
					:class="[currentTab == index ? 'u-tab-item-active' : '']" :data-current="index" @tap.stop="swichMenu(index)">
					<text class="menu-name">{{ item.name }}</text>
				</view>
				<view class="hack-tabbar"></view>
			</scroll-view>

			<!-- 右侧商品列表 -->
			<view class="right-wrap ">
				<scroll-view scroll-y class="right-box menu-scroll-view" @scrolltolower="loadMore" v-if="tabbarList.length">
					<view class="u-flex u-row-center" v-if="tabbarList[currentTab].image">
						<image class="category-img" :src="tabbarList[currentTab].image" mode="aspectFill"></image>
					</view>
					<view class="category-title">{{ tabbarList[currentTab].name }}</view>

					<view class="sh-big-card-wrap u-m-20 " v-for="(item, index) in goodsList" :key="item.id">
						<view class="big-goods-card" @tap="jump('/pages/goods/detail', { id: item.id })">
							<view class="img-wrap u-m-b-20">
								<image class="goods-img" :src="item.image" mode="aspectFill"></image>
								<image class="goods-tag" v-if="item.is_hot && !item.activity"
									:src="$IMG_URL + '/goods/goods_hot_tag.png'" mode=""></image>
							</view>
							<view class="goods-title u-p-x-20 u-m-b-10 u-ellipsis-2">
								{{ item.title }}
							</view>
							<view class="goods-subtitle u-p-x-20 u-m-b-10 u-ellipsis-2">{{ item.present }}</view>
							<view class="goods-progress u-p-x-20 u-flex u-m-b-10">
								<view class="googs-send-num">库存{{ item.stock }}件</view>
							</view>
							<view class="u-flex u-row-between u-p-x-20">
								<view class="price-box u-flex font-OPPOSANS">
									<view class="price">{{ item.price }}</view>
									<view class="origin-price u-m-l-10">￥{{ item.original_price }}</view>
								</view>
								<view class="cart-box">
									<!-- 单规格 -->
									<view class="" v-if="!item.activity">
										<view v-if="!item.is_sku">
											<button v-if="!isCart(item.id)"
												:style="item.activity_type ? typeMap[item.activity_type].btnBg : ''"
												@tap.stop="addCart(item)" class="u-reset-button cart-btn">
												加入购物车
											</button>
											<view class="num-step" @tap.stop v-else>
												<u-number-box :value="checkCart[item.id].num" :long-press="false" :min="0" :max="maxStep"
													:step="1" :index="index" @min="onMin(item.id)" @plus="plus($event, item.sku_price[0])"
													@change="onChangeNum($event, item.sku_price[0])"></u-number-box>
											</view>
										</view>
										<!-- 多规格 -->
										<button class="u-reset-button item-btn sel-sku "
											:style="item.activity_type ? typeMap[item.activity_type].btnBg : ''" @tap.stop="selSku(item)"
											v-else>
											选规格
										</button>
									</view>
									<button class="u-reset-button item-btn sel-sku"
										:style="item.activity_type ? typeMap[item.activity_type].btnBg : ''" v-else>立即抢购</button>
								</view>
							</view>
						</view>
					</view>

					<!-- 缺省页 -->
					<shopro-empty v-if="isEmpty" marginTop="200rpx" :image="$IMG_URL + '/imgs/empty/empty_goods.png'"
						tipText="暂无该商品，还有更多好货等着你噢~"></shopro-empty>

					<!-- 加载更多 -->
					<u-loadmore v-if="goodsList.length" height="80rpx" :status="loadStatus" icon-type="flower" color="#ccc" />
					<view class="hack-tabbar"></view>
				</scroll-view>
			</view>
		</view>

		<!-- 规格弹窗 -->
		<shopro-sku v-if="showSku && goodsInfo.id" v-model="showSku" :goodsInfo="goodsInfo" :buyType="'cart'">
		</shopro-sku>
	</view>
</template>

<script>
import { mapMutations, mapActions, mapState, mapGetters } from 'vuex';
export default {
	components: {},
	data() {
		return {
			showSku: false, //是否显示规格弹窗
			isEmpty: false,
			currentTab: 0,
			categoryID: 0, //分类id
			scrollLeftTop: 0, //左边滚动距离
			menuHeight: 0, // 左边菜单的高度
			menuItemHeight: 0, // 左边菜单item的高度
			tabbarList: [], //左侧分类列表
			goodsList: [], //商品列表
			goodsInfo: {}, //点击商品详情
			numberDisabled: false, //购物车计数器
			loadStatus: 'loadmore', //loadmore-加载前的状态，loading-加载中的状态，nomore-没有更多的状态
			currentPage: 1,
			lastPage: 1,
			maxStep: 999,
			typeMap: {
				seckill: {
					text: '秒杀',
					tagBg: '#FF5854',
					goodsBg: '/imgs/tag/seckill_x_bg.png',
					btnText: '去抢购',
					btnBg: 'background: linear-gradient(90deg, #D01325, #ED3C30);'
				},
				groupon: {
					text: '拼团',
					tagBg: '#FE832A',
					goodsBg: '/imgs/tag/groupon_x_bg.png',
					btnText: '马上拼',
					btnBg: 'background: linear-gradient(90deg, #FF6600 0%, #FE832A 100%);'
				}
			}
		};
	},
	props: {
		categoryStyleId: {
			type: Number,
			default: 0
		}
	},
	computed: {
		...mapGetters(['totalCount', 'isSel', 'cartNum', 'cartList', 'isLogin']),
		// 购物车检测
		checkCart() {
			let obj = {};
			this.cartList.forEach(item => {
				obj[item.goods_id] = {
					num: item.goods_num,
					cartOrderId: item.id
				};
			});
			return obj;
		}
	},
	async created() {
		console.log('%c当前分类：快速购买', 'color:green;background:yellow');
		await this.getCategory();
		let res = await this.getGoodsList();
	},

	methods: {
		...mapActions(['getCartList', 'changeCartList', 'addCartGoods']),
		// 跳转详情
		toGoodDetail(id) {
			this.$Router.push({ path: '/pages/goods/detail', query: { id: id } });
		},

		// 百分比
		getProgress(sales, stock) {
			let unit = '';
			if (stock + sales > 0) {
				let num = (sales / (sales + stock)) * 100;
				unit = num.toFixed(2) + '%';
			} else {
				unit = '0%';
			}
			return unit;
		},

		// 加载更多
		loadMore() {
			if (this.currentPage < this.lastPage) {
				this.currentPage += 1;
				this.getGoodsList();
			}
		},

		// 获取分类
		async getCategory() {
			await this.$http('category.sort').then(res => {
				this.tabbarList = res.data
				this.categoryID = this.tabbarList[0]?.id;
			})
		},

		// 获取分类商品
		getGoodsList() {
			let that = this;
			that.loadStatus = 'loading';
			return this.$http('goods.goods',
				{
					sortId: that.categoryID,
				},
				'加载中...',
				true,
				{
					page: that.currentPage,
				}
			).then(res => {
				if (res.code === 1) {
					that.goodsList = [...that.goodsList, ...res.data.records];
					that.isEmpty = !that.goodsList.length;
					that.lastPage = Math.ceil(res.data.total / 10); // 假设每页10条数据
					that.loadStatus = that.currentPage < that.lastPage ? 'loadmore' : 'nomore';
					
					// 处理商品数据
					that.goodsList.forEach(item => {
						item.title = item.name;
						item.image = item.dityUrl?.[0]?.avatar || '';
						item.stock = item.number || 0; // number 是库存
						item.original_price = (item.price / (item.discount / 10)).toFixed(2);
					});
				}
				return res;
			})
			.then(() => {
				that.isLogin && that.getCartList();
			});
		},

		// 点击左边的栏目切换
		async swichMenu(index) {
			if (index == this.currentTab) return;
			this.currentTab = index;
			this.categoryID = this.tabbarList[index].id;
			this.currentPage = 1;
			this.lastPage = 1;
			this.goodsList = [];
			await this.getGoodsList();
			// 如果为0，意味着尚未初始化
			if (this.menuHeight == 0 || this.menuItemHeight == 0) {
				await this.getElRect('menu-scroll-view', 'menuHeight');
				await this.getElRect('u-tab-item', 'menuItemHeight');
			}
			// 将菜单菜单活动item垂直居中
			this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2;
		},

		// 获取一个目标元素的高度
		getElRect(elClass, dataVal) {
			new Promise((resolve, reject) => {
				const query = uni.createSelectorQuery().in(this);
				query
					.select('.' + elClass)
					.fields({ size: true }, res => {
						// 如果节点尚未生成，res值为null，循环调用执行
						if (!res) {
							setTimeout(() => {
								this.getElRect(elClass);
							}, 10);
							return;
						}
						this[dataVal] = res.height;
					})
					.exec();
			});
		},

		// 加入购物车
		addCart(goods) {
			let confirmGoodsList = {
					goods_id: goods.id,
				}

			this.addCartGoods(confirmGoodsList).then(res => {
				if (res.code === 1) {
					this.$u.toast('加入购物车成功');
				}
			});
		},
		// 检测商品在购物车中的下标
		checkGoodsIndex(id) {
			let cIndex = 0;
			this.cartList.forEach((item, index) => {
				if (id == item.goods_id) {
					cIndex = index;
				}
			});
			return cIndex;
		},

		// 到达最小值
		onMin(goodsId) {
			const that = this;
			let cartGoodId = 0;
			cartGoodId = this.cartList.filter(item => item.goods_id === goodsId)[0].id;
			uni.showModal({
				title: '删除提示',
				confirmColor: '#f0c785',
				content: `是否确认从购物车中删除此商品?`,
				success: res => {
					res.confirm && this.changeCartList({ ids: [cartGoodId], art: 'delete' });
				}
			});
		},

		// 增加
		plus(e, sku) {
			if (e.value >= sku.stock) {
				this.maxStep = sku.stock > 999 ? 999 : sku.stock;
				this.$u.toast('库存不足');
				return;
			}
			if (this.detail.activity_type === 'seckill' || this.detail.activity_type === 'groupon') {
				let rules = this.detail.activity.rules;
				if (rules.limit_buy != 0 && e.value >= rules.limit_buy) {
					this.maxStep = rules.limit_buy;
					this.$u.toast('本次活动最多购买' + rules.limit_buy + '件');
					return;
				}
			}
		},

		// 更改商品数
		// 更改商品数
		async onChangeNum(e, sku) {
			let gIndex = this.checkGoodsIndex(sku.goods_id);
			if (e.value != this.checkCart[sku.goods_id].num) {
				uni.showLoading({
					mask: true
				});
				this.$set(this.cartList[gIndex], 'goods_num', +e.value);
				await this.changeCartList({
					ids: [this.checkCart[sku.goods_id].cartOrderId],
					goodsNum: +e.value,
					art: 'change'
				});
				await uni.hideLoading();
			}
		},
		// 检测是否为购物车商品
		isCart(id) {
			let goodsId = id + '';
			return Object.keys(this.checkCart).includes(goodsId);
		},

		// 添加购物车
		async selSku(info) {
			this.goodsInfo = {};
			this.getGoodsDetail(info.id);
			this.showSku = true;
		},
		// 商品详情
		getGoodsDetail(id) {
			let that = this;
			that.$http('goods.detail', {
				id: id
			}).then(res => {
				if (res.code === 1) {
					that.goodsInfo = res.data;
				}
			});
		},

		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.hack-tabbar {
	height: calc(100rpx + env(safe-area-inset-bottom) / 2);
	width: 100%;
}

// 最外层结构包裹
.catgory-wrap {
	height: calc(100vh);
	/* #ifdef H5 */
	height: calc(100vh - var(--window-top));
	/* #endif */
	display: flex;
	flex-direction: column;
}

.wrapper-box {
	flex: 1;
	display: flex;
	overflow: hidden;

	// 左侧menu
	.u-tab-view {
		width: 200rpx;
		height: 100%;

		.u-tab-item {
			height: 90rpx;
			background: #f8f8f8;
			width: 200rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
			color: #666;
			font-weight: 400;
			line-height: 90rpx;
			position: relative;
			transition: all 0.3s ease-in-out;

			&:active {
				background: #f0f0f0;
			}
		}

		.u-tab-item-active {
			position: relative;
			color: #e6b873;
			font-size: 30rpx;
			font-weight: 600;
			background: #fff;

			&::before {
				content: '';
				position: absolute;
				border-left: 6rpx solid #e6b873;
				height: 36rpx;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				border-radius: 6rpx;
			}
		}
	}
}

// 右侧商品滚动
.right-wrap {
	background-color: #fff;
	height: 100%;
	width: 100%;

	.category-img {
		width: 505rpx;
		height: 150rpx;
		background: #ccc;
		margin: 20rpx auto;
		border-radius: 10rpx;
	}

	.category-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #000;
		margin: 20rpx;
	}

	.right-box {
		height: 100%;
	}
}

.big-goods-card {
	background-color: #fff;
	border-radius: 20rpx;
	width: 100%;
	box-shadow: 0 0 8rpx 2rpx rgba(199, 199, 199, 0.3);
	padding-bottom: 20rpx;

	.img-wrap {
		position: relative;
		overflow: hidden;
		height: 256rpx;
		width: 100%;

		.goods-img {
			width: 100%;
			height: 256rpx;
			border-radius: 20rpx 20rpx 0 0;
			background: #f5f5f5;
		}

		.goods-tag {
			position: absolute;
			top: 16rpx;
			left: 16rpx;
			width: 88rpx;
			height: 88rpx;
		}
	}

	.goods-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		line-height: 36rpx;
		padding-top: 6rpx;

		.title-tag {
			transform: scale(0.9);
			position: relative;
			top: -6rpx;
		}
	}

	.goods-subtitle {
		font-size: 26rpx;
		font-weight: 400;
		color: #666666;
		line-height: 38rpx;
		width: 100%;
		padding: 0 20rpx;
	}

	.goods-progress {
		.googs-send-num {
			font-size: 24rpx;
			font-weight: 400;
			color: #999999;
		}
	}

	.price-box {
		vertical-align: text-bottom;

		.price {
			font-size: 36rpx;
			color: #ff0000;
			font-weight: 600;

			&::before {
				content: '￥';
				font-size: 28rpx;
			}

			vertical-align: text-bottom;
		}

		.origin-price {
			vertical-align: text-bottom;
			font-size: 26rpx;
			font-weight: 400;
			text-decoration: line-through;
			color: #c4c4c4;
		}
	}

	.cart-box {

		.cart-btn,
		.sel-sku {
			width: 172rpx;
			line-height: 58rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			border-radius: 30rpx;
			padding: 0;
			font-size: 26rpx;
			font-weight: 500;
			color: #ffffff;
		}
	}
}
</style>
