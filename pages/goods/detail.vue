<!-- 商品详情 -->
<template>
	<view class="detail-wrap ">
		<!-- 标题栏 -->
		<view class="nav-box">
			<view class="state-hack"></view>
			<view :style="{ height: navbarHeight + 'px' }">
				<view hover-class="back-hover" class="back-box u-m-x-30 u-flex u-row-center u-col-center" @tap="goBack">
					<view class="u-iconfont uicon-arrow-left" style="color: #fff;font-size: 28rpx;"></view>
				</view>
			</view>
		</view>

		<!-- 缺省页 -->
		<shopro-empty v-if="showEmpty" :image="$IMG_URL + '/imgs/empty/empty_goods_null.png'" :tipText="showEmptyText" btnText="返回上一页" @click="$Router.back()"></shopro-empty>
		<view class="detail_box" v-else>
			<view class="detail-content">
				<!-- 轮播 -->
				<u-swiper :height="750" borderRadius="0" :list="goodsInfo.images" indicator-pos="bottomRight" mode="number" :interval="3000" @click="onGoodsSwiper"></u-swiper>

				<!-- 价格卡片组 -->
				<sh-price-card v-if="goodsInfo.id" :detail="goodsInfo" :type="detailType" @change="getActivityRules"></sh-price-card>

				<!-- 标题 -->
				<view class="u-m-b-10 title-box u-p-20 u-skeleton-fillet">
					<view class="goods-title u-m-b-10 u-ellipsis-2">{{ goodsInfo.title }}</view>
					<view class="sub-title u-ellipsis-2">{{ goodsInfo.subtitle }}</view>
					<view class="stock-info">库存: {{ goodsInfo.stock }}</view>
				</view>

				<!-- 参与的活动 -->
				<sh-activity v-if="goodsInfo.activity_discounts_tags && goodsInfo.activity_discounts_tags.length" :detail="goodsInfo.activity_discounts"></sh-activity>

				<!-- 规格选择 -->
				<view class="sku-box" @tap="showSku = true" v-if="activityRules.status !== 'waiting' && checkActivity(goodsInfo.activity_type, 'groupon') && goodsInfo.is_sku">
					<view class="u-flex u-row-between u-col-center">
						<view class="u-flex">
							<text class="title">规格</text>
							<text class="tip">{{ currentSkuText || '请选择规格' }}</text>
						</view>
						<text class="u-iconfont uicon-arrow-right" style="color: #bfbfbf;"></text>
					</view>
				</view>

				<!-- 服务 -->
				<sh-serve v-if="goodsInfo.service && goodsInfo.service.length" v-model="showServe" :serveList="goodsInfo.service"></sh-serve>

				<!-- 优惠券 -->
				<sh-coupon
					v-if="goodsInfo.coupons && goodsInfo.coupons.length && goodsInfo.activity_type !== 'seckill' && goodsInfo.activity_type !== 'groupon' && detailType !== 'score'"
					:couponList="goodsInfo.coupons"
				></sh-coupon>

				<!-- 拼团人-->
				<sh-groupon
					v-if="goodsInfo.activity && goodsInfo.activity.type === 'groupon' && goodsInfo.activity.rules.team_card === '1' && detailType !== 'score'"
					:grouponData="goodsInfo"
				></sh-groupon>

				<!-- 拼团玩法 -->
				<view
					v-if="goodsInfo.activity && Number(goodsInfo.activity.richtext_id) && goodsInfo.activity_type !== 'seckill'"
					class="groupon-play u-flex u-row-between u-p-l-20 u-p-r-20"
					@tap="jump('/pages/public/richtext', { id: goodsInfo.activity.richtext_id })"
				>
					<view class="u-flex">
						<text class="title">玩法</text>
						<view class="description u-ellipsis-1">{{ goodsInfo.activity.richtext_title || '开团/参团·邀请好友·人满发货（不满退款' }}</view>
					</view>
					<view class="u-iconfont uicon-arrow-right" style="color:#bfbfbf ;font-size: 28rpx;"></view>
				</view>

				<!-- 选项卡 -->
				<view class="tab-box u-flex" v-if="!isSeckill">
					<view class="tab-item u-flex-col u-row-center u-col-center" @tap="onTab(tab.id)" v-for="tab in filteredTabList" :key="tab.id">
						<view class="tab-title">
							{{ tab.title }}
							<text v-if="tab.id == 'tab2'" class="comment-num">({{ commentNum }})</text>
						</view>
						<text class="tab-line" :class="{ 'line-active': tabCurrent === tab.id }"></text>
					</view>
				</view>
				<view class="tab-detail u-p-20 u-m-b-10" v-if="goodsInfo.id && !isSeckill">
					<!-- 详情富文本 -->
					<view class="rich-box " v-if="tabCurrent === 'tab0'"><u-parse :html="goodsInfo.content"></u-parse></view>
					<!-- 参数 -->
					<view class="goods-size" v-if="tabCurrent === 'tab1'">
						<view class="table-box" v-if="goodsInfo.params && goodsInfo.params.length">
							<view class="t-tr u-flex" v-for="t in goodsInfo.params" :key="t.title">
								<view class="t-head u-flex">{{ t.title }}</view>
								<view class="t-detail">{{ t.content }}</view>
							</view>
						</view>
					</view>
					<!-- 评价 -->
					<view class="goods-comment" v-if="tabCurrent === 'tab2'">
						<block v-for="comment in commentList" :key="comment.id"><sh-comment :comment="comment"></sh-comment></block>
						<shopro-empty v-show="!commentList.length" marginTop="20rpx" :image="$IMG_URL + '/imgs/empty/comment_empty.png'" tipText="暂无评价~"></shopro-empty>
						<view class="more-box u-flex u-row-center u-col-center" v-show="commentNum > 3">
							<button class="u-reset-button more-btn u-flex u-row-center u-col-center" @tap="jump('/pages/goods/comment/comment-list', { goodsId: goodsInfo.id })">
								查看全部
								<view class="u-iconfont uicon-arrow-right" style="color:#d5a65a ;font-size: 28rpx;"></view>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 商品foot -->
			<view class="tabbar-foot safe-area-inset-bottom" v-if="goodsInfo.id">
				<view class="detail-foot_box safe-area-inset-bottom  u-flex u-col-ceter u-row-around">
					<!-- foot左侧 -->
					<view class="left u-flex">
						<view class="tools-item u-flex-col u-row-center u-col-center" @tap="goHome">
							<image class="tool-img shopro-selector-circular" src="/static/images/tabbar/tabbar_home1.png" mode=""></image>
							<text class="tool-title shopro-selector-rect">首页</text>
						</view>
					</view>
					<!-- foot右侧 -->
					<view class="detail-right">
						<!-- 积分按钮 -->
						<view class="detail-btn-box" v-if="detailType === 'score'"><button class="u-reset-button  score-btn" @tap="goPay">立即兑换</button></view>
						<view v-if="detailType !== 'score'">
							<!-- 正常按钮 -->
							<view class="detail-btn-box u-flex u-row-around" v-if="!goodsInfo.activity_type">
								<button class=" u-reset-button tool-btn add-btn" @tap="addCart">加入购物车</button>
								<button class=" u-reset-button tool-btn pay-btn" @tap="goPay">立即购买</button>
							</view>
							<!-- 活动按钮 -->
							<view class="detail-btn-box u-row-around" v-if="activityRules.status && goodsInfo.activity_type">
								<button class=" u-reset-button seckilled-btn" v-if="activityRules.status !== 'ing'">
									<text v-if="activityRules.status == 'waiting'">暂未开始</text>
									<text v-if="activityRules.status == 'end'">已结束</text>
								</button>
								<block v-else>
									<!-- 活动中，秒杀 -->
									<button class=" u-reset-button  seckill-btn" v-if="goodsInfo.activity && goodsInfo.activity.type === 'seckill'" @tap="goSeckill">
										立即秒杀
									</button>
									<!-- 活动中，拼团 -->
									<view class="u-flex groupon-btn-box" v-if="goodsInfo.activity && goodsInfo.activity.type === 'groupon'">
										<button
											class="tool-btn u-reset-button add-btn u-flex-col u-row-center u-col-center"
											@tap="payGroupon"
											v-if="goodsInfo.activity.rules.is_alone === '1'"
										>
											<text class="price font-OPPOSANS">￥{{ goodsInfo.price }}</text>
											<text class="price-title">单独购买</text>
										</button>
										<button
											class=" tool-btn u-reset-button groupon-btn u-flex-col u-row-center u-col-center"
											:style="goodsInfo.activity.rules.is_alone === '0' ? 'width:400rpx' : ''"
											@tap="payGroupon('groupon')"
										>
											<text class="price font-OPPOSANS">￥{{ goodsInfo.groupon_price }}</text>
											<text class="price-title">我要开团</text>
										</button>
									</view>
								</block>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 规格弹窗 -->
			<shopro-sku
				v-if="showSku && goodsInfo.id"
				v-model="showSku"
				:goodsInfo="goodsInfo"
				:activityRules="activityRules"
				:buyType="goodsInfo.activity_type == 'seckill' || detailType === 'score' ? 'buy' : buyType"
				:grouponBuyType="grouponBuyType"
				:goodsType="detailType === 'score' ? 'score' : 'goods'"
				@changeType="changeType"
				@getSkuText="getSkuText"
			></shopro-sku>

			<!-- 	分享组件 -->
			<shopro-share v-model="showShare" :posterInfo="goodsInfo" :posterType="'goods'"></shopro-share>
			<!-- 登录 -->
			<shopro-auth-modal v-if="authType"></shopro-auth-modal>

			<!-- 购买弹窗 -->
			<u-popup v-model="showBuyPopup" mode="bottom" border-radius="20" closeable>
				<view class="buy-popup">
					<view class="goods-info u-flex u-p-20">
						<image class="goods-img" :src="goodsInfo.image" mode="aspectFill"></image>
						<view class="info-right">
							<view class="goods-price u-font-bold">￥{{ goodsInfo.price }}</view>
							<view class="goods-stock">库存: {{ goodsInfo.stock }}件</view>
						</view>
					</view>

					<!-- 配送地址 -->
					<view class="address-box u-p-20" @tap="chooseAddress">
						<view class="box-title">配送地址</view>
						<view class="address-content u-flex u-row-between u-col-center u-m-t-20" v-if="addressData.length">
							<view class="address-info">
								<view class="user-info">{{ addressData[0].name }} {{ addressData[0].phone }}</view>
								<view class="address-text u-line-2">{{ addressData[0].address }}</view>
							</view>
							<text class="u-iconfont uicon-arrow-right" style="color: #bfbfbf;"></text>
						</view>
						<view class="no-address u-flex u-row-between u-col-center" v-else>
							<text>请选择收货地址</text>
							<text class="u-iconfont uicon-arrow-right" style="color: #bfbfbf;"></text>
						</view>
					</view>

					<view class="num-box u-p-20">
						<view class="box-title">购买数量</view>
						<view class="u-flex u-row-between u-col-center u-m-t-20">
							<u-number-box v-model="buyNum" :min="1" :max="goodsInfo.stock"></u-number-box>
						</view>
					</view>
					<view class="popup-btn-box safe-area-inset-bottom u-p-20">
						<button class="u-reset-button confirm-btn" @tap="confirmBuy">确定</button>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
let systemInfo = uni.getSystemInfoSync();
import shActivity from './components/sh-activity.vue';
import shPriceCard from './components/sh-price-card.vue';
import shServe from './components/sh-serve.vue';
import shGroupon from './components/sh-groupon.vue';
import shCoupon from './components/sh-coupon.vue';
import shComment from './components/sh-comment.vue';
import share from '@/shopro/share';

import { mapMutations, mapActions, mapState, mapGetters } from 'vuex';
export default {
	components: {
		shServe,
		shPriceCard,
		shGroupon,
		shCoupon,
		shComment,
		shActivity
	},
	data() {
		return {
			// navbar
			backIconName: 'arrow-left',

			showSku: false, //是否显示规格弹窗
			currentSkuText: '', //选中规格
			detailType: '',
			showShare: false,
			buyType: 'sku',
			grouponBuyType: 'alone', //拼团购买方式。
			showEmpty: false,
			showEmptyText: '',
			showServe: false,
			goodsInfo: {},
			commentList: [], //商品评价列表
			commentNum: 0, //商品评价总数
			favorite: false,
			activityRules: {},
			currentSkuList: [],
			confirmGoodsInfo: {},
			swiperCurrent: 0, //轮播下标
			tabCurrent: 'tab0',
			tabList: [
				{
					id: 'tab0',
					title: '商品详情'
				},
				{
					id: 'tab2',
					title: '用户评价'
				}
			],
			showBuyPopup: false, // 购买弹窗显示状态
			buyNum: 1, // 购买数量
			addressData: [], // 收货地址列表
		};
	},
	// 是否登录
	computed: {
		...mapGetters(['isLogin', 'authType']),
		navbarHeight() {
			// #ifdef APP-PLUS || H5
			return 48;
			// #endif
			// #ifdef MP
			let height = systemInfo.platform == 'ios' ? 44 : 48;
			return height;
			// #endif
		},
		filteredTabList() {
			return this.tabList.filter(tab => tab.id !== 'tab1');
		},
		isSeckill(){
			if (this.goodsInfo && this.goodsInfo.activity && this.goodsInfo.activity.type === 'seckill') {
				return true;
			} else {
				return false;
			}
		}
	},
	async onShow() {
		this.getDefaultAddress();
	},
	async onLoad() {
		let that = this;
		this.backIconName = getCurrentPages().length > 1 ? 'arrow-left' : 'home-fill';
		const type = this.$Route.query.type;
		this.detailType = type;
		switch (type) {
			case 'score':
				await this.getScoreDetail();
				break;
			default:
				await this.getGoodsDetail();
		}
	},

	onUnload() {
		share.setShareInfo();
	},

	methods: {
		...mapActions(['addCartGoods']),
		// goBack
		// 微信直播商品跳转详情，需要用小程序原生接口才能返回。
		goBack() {
			let pageList = getCurrentPages();
			if (pageList.length > 1) {
				// #ifdef MP-WEIXIN
				wx.navigateBack();
				// #endif
				// #ifndef MP-WEIXIN
				uni.navigateBack();
				// #endif
			} else {
				this.$Router.replaceAll('/pages/index/index');
			}
		},

		// 轮播图预览
		onGoodsSwiper(e) {
			this.$tools.previewImage(this.goodsInfo.images, e);
		},
		getActivityRules(e) {
			if (e) {
				this.activityRules = JSON.parse(e);
			}
		},
		// 检测
		checkActivity(data, type) {
			if (data) {
				return !data.includes(type);
			}
			return true;
		},
		// 路由跳转
		jump(path, parmas) {
			this.showShare = false;
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		// 回到首页
		goHome() {
			this.$Router.replaceAll('/pages/index/index');
		},

		// 选项卡
		onTab(id) {
			this.tabCurrent = id;
		},
		// 积分详情
		getScoreDetail() {
			let that = this;
			return new Promise((resolve, reject) => {
				that.$http('goods.scoreDetail', {
					id: that.$Route.query.id
				}).then(res => {
					if (res.code === 1) {
						that.goodsInfo = res.data;
						resolve(res.data);
					}
					if (res.code == 0) {
						resolve(false);
						that.$u.toast(res.msg);
					}
				});
			});
		},
		// 商品详情
		getGoodsDetail() {
			let that = this;
			return new Promise((resolve, reject) => {
				// 先判断是否是秒杀商品
				if(that.$Route.query.seckill) {
					that.$http('seckill.seckillQuery', {
						id: that.$Route.query.id
					}).then(res => {
						if (res.code === 1) {
							that.showEmpty = false;
							// 转换数据结构
							const rawData = res.data;
							that.goodsInfo = {
								id: rawData.id,
								title: rawData.name,
								subtitle: '',  // 秒杀商品没有副标题
								price: rawData.price,
								stock: rawData.number,
								image: rawData.avatar,
								images: [rawData.avatar], // 秒杀商品只有一张图片
								createTime: rawData.createTime,
								status: rawData.status,
								content: '', // 秒杀商品没有详细描述
								activity_type: 'seckill',
								activity: {
									type: 'seckill',
									starttime: new Date(rawData.createTime).getTime() / 1000,
									endtime: new Date(rawData.endTime).getTime() / 1000
								},
								is_sku: false,
								sales: rawData.sales || 0 // 销量
							};
							that.getCommentList();
							resolve(that.goodsInfo);
						} else {
							resolve(false);
							that.showEmpty = true;
							that.showEmptyText = res.msg;
						}
					});
				} else {
					that.$http(
						'goods.detail',
						{
							id: that.$Route.query.id
						},
						'',
						false
					).then(res => {
						if (res.code === 1) {
							that.showEmpty = false;
							// 转换数据结构
							const rawData = res.data;
							that.goodsInfo = {
								id: rawData.id,
								title: rawData.name,
								subtitle: rawData.present,
								price: rawData.price,
								stock: rawData.number,
								image: rawData.dityUrl?.[0]?.avatar || '',
								images: rawData.dityUrl?.map(item => item.avatar) || [],
								createTime: rawData.createTime,
								discount: rawData.discount,
								status: rawData.status,
								content: rawData.present,
								activity_type: null,
								is_sku: false
							};
							that.getCommentList();
							resolve(that.goodsInfo);
						} else {
							resolve(false);
							that.showEmpty = true;
							that.showEmptyText = res.msg;
						}
					});
				}
			});
		},
		// 商品评论
		getCommentList() {
			let that = this;
			that.$http('goods.commentList', {
				goods_id: that.goodsInfo.id,
				per_page: 3,
				type: 'all'
			}).then(res => {
				if (res.code === 1) {
					that.commentList = res.data.data;
					that.commentNum = res.data.total;
				}
			});
		},
		// 组件返回的type;
		changeType(e) {
			this.buyType = e;
		},
		// 组件返回的规格;
		getSkuText(e) {
			this.currentSkuText = e;
		},
		// 分享
		onShare() {
			this.showShare = true;
		},
		// 加入购物车
		addCart() {
			let confirmGoodsList = {
				goods_id: this.goodsInfo.id,
			};
			this.addCartGoods(confirmGoodsList).then(res => {
				if (res.code === 1) {
					this.$u.toast('加入购物车成功');
				}
			});
		},
		// 选择地址
		chooseAddress() {
			this.$Router.push({
				path: '/pages/user/address/list',
				query: {
					from: 'goods'
				}
			});
		},

		// 获取默认地址
		getDefaultAddress() {
			this.$http('address.list').then(res => {
				if (res.code === 1) {
					if(res.data && res.data.length) {
						// 查找默认地址
						const defaultAddress = res.data.find(item => item.status === 1);
						// 如果有默认地址,将其放在数组第一位
						if(defaultAddress) {
							this.addressData = [
								defaultAddress,
								...res.data.filter(item => item.status !== 1)
							];
						} else {
							this.addressData = res.data;
						}
					} else {
						this.addressData = [];
					}
				}
			});
		},

		// 立即购买
		goPay() {
			this.getDefaultAddress();
			this.showBuyPopup = true;
		},

		// 确认购买
		confirmBuy() {
			if (!this.addressData.length) {
				this.$u.toast('请选择收货地址');
				return;
			}

			uni.showLoading({
				title: '正在免密支付中',
				mask: true
			});

			const startTime = Date.now();
			const data = {
				addressId: this.addressData[0].id,
				goodsList: [{
					id: this.goodsInfo.id,
					number: this.buyNum
				}]
			}

			setTimeout(() => {
				this.$http('order.add', data).then(res => {
					if (res.code === 1) {
						const endTime = Date.now();
						const duration = endTime - startTime;
						const remainingTime = duration < 2000 ? 2000 - duration : 0;
						
						setTimeout(() => {
							uni.hideLoading();
							this.$u.toast('下单成功');
							this.showBuyPopup = false;
						}, remainingTime);
					} else {
						uni.hideLoading();
					}
				}).catch(() => {
					uni.hideLoading();
				});
			}, 2000);
		},
		// 拼团购买
		payGroupon(type) {
			if (this.isLogin) {
				if (type === 'groupon') {
					this.grouponBuyType = 'groupon';
				} else {
					this.grouponBuyType = 'alone';
				}
				this.buyType = 'buy';
				this.showSku = true;
			} else {
				this.$store.dispatch('showAuthModal');
			}
		},

		// 立即秒杀
		goSeckill() {
			!this.isLogin ? this.$store.dispatch('showAuthModal') : (this.showSku = true);
			this.buyType = 'buy';
		},

		// 收藏
		onFavorite(goodsId) {
			let that = this;
			that.$http('goods.favorite', {
				goods_id: goodsId
			}).then(res => {
				if (res.code === 1) {
					that.goodsInfo.favorite = res.data;
					that.$u.toast(res.msg);
				}
			});
		}
	}
};
</script>

<style lang="scss">
// 标题栏
.nav-box {
	position: fixed;
	width: 100%;
	min-height: 140rpx;
	z-index: 888;
	top: 0;
	.back-box {
		background-color: rgba(#000, 0.18);
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-top: 14rpx;
	}
	.back-hover {
		background-color: rgba(#fff, 0.18);
	}
	.state-hack {
		width: 100%;
		height: var(--status-bar-height);
		/* #ifdef H5 */
		height: 20rpx;
		/* #endif */
	}
}
// 拼团玩法
.groupon-play {
	background: #fff;
	line-height: 94rpx;
	.title {
		font-size: 28rpx;
		color: #999;
	}

	.description {
		font-size: 28rpx;
		width: 500rpx;
		margin-left: 30rpx;
	}
}

// 选项卡
.tab-box {
	height: 102rpx;
	background: #fff;
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.8);
	margin-top: 10rpx;

	.tab-item {
		flex: 1;
		height: 100%;
		position: relative;
		font-size: 30rpx;
		font-weight: bold;

		.tab-line {
			width: 123rpx;
			height: 4rpx;
			left: 50%;
			bottom: 0;
			transform: translateX(-50%);
			background: transparent;
			position: absolute;
			z-index: 2;
		}

		.line-active {
			background: rgba(168, 112, 13, 1);
		}
	}
}

// 选项卡内容
.tab-detail {
	min-height: 300rpx;
	background: #fff;
	// 规格参数
	.goods-size {
		.table-box {
			width: 710rpx;
			margin: auto;
			background: rgba(255, 255, 255, 1);
			border: 1rpx solid rgba(223, 223, 223, 1);

			.t-tr {
				border-bottom: 1rpx solid rgba(223, 223, 223, 1);
				&:last-child {
					border-bottom: none;
				}

				.t-head {
					font-size: 26rpx;
					color: #999;
					flex: 1;
					padding: 15rpx 20rpx;
					height: 100%;
				}

				.t-detail {
					font-size: 26rpx;
					border-left: 1rpx solid rgba(223, 223, 223, 1);
					flex: 4;
					padding: 15rpx 20rpx;
					height: 100%;
				}
			}
		}
	}
	// 富文本
	.rich-box {
		/deep/ img {
			display: block;
		}
	}
	// 评论
	.goods-comment {
		.more-box {
			height: 100rpx;
			background: #fff;

			.more-btn {
				width: 200rpx;
				line-height: 60rpx;
				border: 1rpx solid rgba(213, 166, 90, 1);
				border-radius: 30rpx;
				font-size: 26rpx;
				font-weight: 400;
				color: rgba(168, 112, 13, 1);
				padding: 0;
				background: #fff;
			}
		}
	}
}

// 规格卡片
.sku-box {
	line-height: 82rpx;
	background: #fff;
	padding: 0 20rpx;
	margin: 10rpx 0;
	font-size: 28rpx;

	.title {
		color: #999;
		margin-right: 20rpx;
	}
}

// 标题卡片
.title-box {
	background-color: #fff;
	.goods-title {
		font-size: 28rpx;
		font-weight: 600;
		line-height: 42rpx;
	}

	.sub-title {
		color: #a8700d;
		font-size: 24rpx;
		font-weight: 500;
		line-height: 42rpx;
	}

	.price-box {
		margin-top: 20rpx;
		.current-price {
			color: #ff0000;
			font-size: 36rpx;
			font-weight: bold;
			margin-right: 20rpx;
		}
		.original-price {
			color: #999;
			font-size: 24rpx;
			text-decoration: line-through;
		}
	}

	.stock-info {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #666;
	}
}

// 底部工具栏
.tabbar-foot {
	min-height: 100rpx;
	width: 100%;
}
.detail-foot_box {
	min-height: calc(100rpx + env(safe-area-inset-bottom)) ;
	border-top: 1rpx solid rgba(238, 238, 238, 1);
	background-color: #fff;
	width: 100%;
	position: fixed;
	bottom: 0;
	z-index: 999;

	.left,
	.detail-right {
		flex: 1;
	}

	.tools-item {
		flex: 1;
		height: 100%;

		.tool-img {
			width: 46rpx;
			height: 46rpx;
		}

		.tool-title {
			font-size: 22rpx;
			line-height: 22rpx;
			padding-top: 8rpx;
		}
	}

	.detail-btn-box {
		flex: 1;

		.tool-btn {
			font-size: 28rpx;
			font-weight: 500;
			color: rgba(#fff, 0.9);
			width: 210rpx;
			min-height: 70rpx;
			border-radius: 35rpx;
			padding: 0;
			margin-right: 20rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.price {
				font-size: 24rpx;
				line-height: 24rpx;
				font-weight: bold;
				color: rgba(#fff, 0.9);
			}

			.price-title {
				font-size: 20rpx;
				line-height: 20rpx;
				font-weight: 500;
				color: rgba(#fff, 0.9);
				padding-top: 8rpx;
			}
		}

		.add-btn {
			box-shadow: 0px 2rpx 5rpx 0px rgba(102, 103, 104, 0.46);
			background: linear-gradient(90deg, rgba(103, 104, 105, 1), rgba(82, 82, 82, 1));
		}

		.pay-btn {
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		}

		.score-btn {
			width: 600rpx;
			line-height: 80rpx;
			background: linear-gradient(90deg, rgba(49, 133, 243, 1), rgba(80, 205, 242, 1));
			box-shadow: 0px 7px 6px 0px rgba(80, 205, 242, 0.2);
			border-radius: 40rpx;
			font-size: 30rpx;

			font-weight: 500;
			color: rgba(255, 255, 255, 1);
			margin-right: 20rpx;
		}

		.seckill-btn {
			width: 432rpx;
			line-height: 70rpx;
			background: linear-gradient(93deg, rgba(208, 19, 37, 1), rgba(237, 60, 48, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(#ed3c30, 0.22);
			font-size: 28rpx;

			font-weight: 500;
			color: rgba(255, 255, 255, 1);
			border-radius: 35rpx;
			padding: 0;
			margin-right: 20rpx;
		}

		.seckilled-btn {
			width: 432rpx;
			line-height: 70rpx;
			background: rgba(221, 221, 221, 1);
			font-size: 28rpx;

			font-weight: 500;
			color: #999999;
			border-radius: 35rpx;
			padding: 0;
			margin-right: 20rpx;
		}

		.groupon-btn {
			width: 210rpx;
			height: 70rpx;
			background: linear-gradient(90deg, rgba(254, 131, 42, 1), rgba(255, 102, 0, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(255, 104, 4, 0.22);
			border-radius: 35rpx;
		}
	}
}

// 购买弹窗样式
.buy-popup {
	.goods-info {
		border-bottom: 1rpx solid #f5f5f5;
		
		.goods-img {
			width: 180rpx;
			height: 180rpx;
			border-radius: 12rpx;
		}
		
		.info-right {
			flex: 1;
			margin-left: 20rpx;
			
			.goods-price {
				font-size: 36rpx;
				color: #ff0000;
			}
			
			.goods-stock {
				font-size: 24rpx;
				color: #999;
				margin-top: 10rpx;
			}
		}
	}
	
	.address-box {
		border-bottom: 1rpx solid #f5f5f5;
		
		.box-title {
			font-size: 28rpx;
			color: #333;
		}
		
		.address-content {
			.address-info {
				flex: 1;
				margin-right: 20rpx;
				
				.user-info {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 10rpx;
				}
				
				.address-text {
					font-size: 24rpx;
					color: #666;
					line-height: 1.5;
				}
			}
		}
		
		.no-address {
			height: 80rpx;
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.num-box {
		.box-title {
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.popup-btn-box {
		.confirm-btn {
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
			border-radius: 40rpx;
			font-size: 28rpx;
			color: #fff;
		}
	}
}
</style>
