<template>
	<view class="filter-box">
		<view class="cu-modal" style="z-index: -1;" :class="{ show: showSel }" @tap="hideModal"></view>
		<view class="navbar">
			<view class="nav-item u-flex-col" :class="{ current: filterIndex === 3 }" @tap="tabClick(3)">
				<view class="title-box  u-flex u-col-center">
					<text class="filter-title">{{ currentCategory ? currentCategory.name : '分类' }}</text>
					<view class="u-iconfont uicon-arrow-down u-m-l-10" style="font-size: 24rpx;"></view>
				</view>
				<view class="line" :class="{ 'line-active': filterIndex === 0 }"></view>
			</view>

			<view class="nav-item u-flex-col" :class="{ current: filterIndex === 1 }" @tap="tabClick(1)">
				<view class="title-box  u-flex u-col-center">
					<text class="filter-title">{{ '综合推荐' }}</text>
				</view>
				<view class="line" :class="{ 'line-active': filterIndex === 1 }"></view>
			</view>

			<view class="nav-item u-flex-col" :class="{ current: filterIndex === 2 }" @tap="tabClick(2)">
				<view class="title-box u-flex">
					<text class="filter-title">价格</text>
					<view class="p-box u-flex-col u-m-l-6">
						<view
							class="u-iconfont uicon-arrow-up"
							:style="{ fontSize: '20rpx', lineHeight: '18rpx', color: priceOrder === 1 && filterIndex === 2 ? '#d5a65a' : '#333' }"
						></view>
						<view
							class="u-iconfont uicon-arrow-down"
							:style="{ fontSize: '20rpx', lineHeight: '18rpx', color: priceOrder === 2 && filterIndex === 2 ? '#d5a65a' : '#333' }"
						></view>
					</view>
				</view>
				<view class="line" :class="{ 'line-active': filterIndex === 2 }"></view>
			</view>

		</view>

		<!-- 分类选择弹窗 -->
		<view class="category-popup" v-if="filterIndex === 3">
			<scroll-view scroll-y class="category-list">
				<view 
					class="category-item" 
					:class="{'category-active': currentCategory && currentCategory.id === item.id}"
					v-for="item in categoryList" 
					:key="item.id"
					@tap="selectCategory(item)"
				>
					<text>{{item.name}}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 价格输入区域 -->
		<view class="price-range" v-if="filterIndex === 2">
			<view class="price-input-box u-flex u-row-center u-col-center">
				<input 
					type="digit" 
					v-model="minPrice" 
					placeholder="最低价" 
					class="price-input"
					@input="onPriceChange"
				/>
				<text class="price-separator">-</text>
				<input 
					type="digit" 
					v-model="maxPrice" 
					placeholder="最高价" 
					class="price-input"
					@input="onPriceChange"
				/>
				<button class="price-confirm" @tap="onPriceConfirm">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 商品筛选组件
 *
 */
import { mapState, mapActions, mapMutations } from 'vuex';
export default {
	components: {},
	props: {},
	data() {
		return {
			filterIndex: 1,
			showSel: false, //综合选择
			defaultOrder: 0, //综合
			priceOrder: 0, //价格
			salesOrder: 0, //销量
			newProdcutOrder: 0, //新品优先
			minPrice: '', // 最低价
			maxPrice: '', // 最高价
			categoryList: [], // 分类列表
			currentCategory: null, // 当前选中的分类
		};
	},
	computed: {
		filterData() {
			const data = {
				defaultOrder: this.defaultOrder,
				priceOrder: this.priceOrder,
				salesOrder: this.salesOrder,
				newProdcutOrder: this.newProdcutOrder,
				minPrice: this.minPrice ? Number(this.minPrice) : 0,
				maxPrice: this.maxPrice ? Number(this.maxPrice) : 0,
				sortId: this.currentCategory ? this.currentCategory.id : 0
			};
			return data;
		}
	},
	created() {
		this.getCategoryList();
	},
	methods: {
		// 获取分类列表
		async getCategoryList() {
				this.$http('category.sort').then(res => {
					this.categoryList = [{ id: 0, name: '全部'},...res.data]
				})
		},
		
		// 选择分类
		selectCategory(category) {
			this.currentCategory = category;
			console.log(this.currentCategory);
			
			this.filterIndex = -1; // 关闭分类弹窗
			this.$emit('change', this.filterData);
		},
		
		//筛选
		tabClick(index) {
			if (index===this.filterIndex&&index === 3) {
				this.filterIndex = -1; // 如果再次点击分类，关闭弹窗
				return;
			}
			this.filterIndex = index;
			if (index === 1) {
				this.defaultOrder = 1;
				this.priceOrder = 0;
			} else if (index === 2) {
				this.priceOrder = this.priceOrder === 1 ? 2 : 1;
				this.defaultOrder = 0;
			}
			this.$emit('change', this.filterData);
		},
		onSel(dot) {
			this.defaultOrder = dot;
			this.$emit('change', this.filterData);
			this.showSel = false;
		},
		hideModal() {
			this.showSel = false;
		},
		// 价格排序点击
		priceOrderTap() {
			this.priceOrder = this.priceOrder >= 2 ? 0 : this.priceOrder + 1;
			this.emitChange();
		},
		
		// 价格输入变化
		onPriceChange() {
			// 限制只能输入数字和小数点
			this.minPrice = this.minPrice.replace(/[^\d.]/g, '');
			this.maxPrice = this.maxPrice.replace(/[^\d.]/g, '');
		},
		
		// 价格确认
		onPriceConfirm() {
			let min = parseFloat(this.minPrice) || 0;
			let max = parseFloat(this.maxPrice) || 0;
			
			// 如果最小价格大于最大价格，交换它们
			if (min > max && max !== 0) {
				[min, max] = [max, min];
				this.minPrice = min.toString();
				this.maxPrice = max.toString();
			}
			
			// 发送筛选事件
			this.$emit('change', {
				...this.filterData,
				minPrice: min,
				maxPrice: max
			});
		}
	}
};
</script>

<style lang="scss">
.sel-box {
	position: absolute;
	width: 750rpx;
	height: 140rpx;
	background: rgba(246, 246, 246, 1);
	border-radius: 0px 0px 20rpx 20rpx;
	z-index: 999;
	left: 50%;
	transform: translateX(-50%);
	bottom: -138rpx;
	transition: all ease-out 0.2s;
	.sel-item {
		color: #333;
		padding: 20rpx 40rpx 0;
		font-size: 24rpx;
		font-weight: 500;
	}
	.sel-active {
		color: #d5a65a;
		font-size: 26rpx;
		font-weight: 600;
	}
}
.filter-box {
	width: 750rpx;
}
.navbar {
	display: flex;
	width: 750rpx;
	height: 95rpx;
	background: #fff;
	border-bottom: 1upx solid #e6e6e6;
	position: relative;
	z-index: 999;
	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 30rpx;
		position: relative;
		.filter-title {
			font-size: 28rpx;
			color: #333;
			font-weight: 600;
		}
		.line {
			width: 110rpx;
			height: 4rpx;
			background: transparent;
			position: absolute;
			bottom: 0;
			z-index: 2;
		}

		.line-active {
			background: rgba(213, 166, 90, 1);
		}

		.p-box {
			display: flex;
			flex-direction: column;
		}
	}
}

.current {
	color: #d5a65a;
}

.price-range {
	background-color: #fff;
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #e6e6e6;
	
	.price-input-box {
		display: flex;
		align-items: center;
		justify-content: center;
		
		.price-input {
			width: 180rpx;
			height: 60rpx;
			background: #f8f8f8;
			border-radius: 30rpx;
			text-align: center;
			font-size: 24rpx;
			color: #333;
		}
		
		.price-separator {
			margin: 0 20rpx;
			color: #999;
		}
		
		.price-confirm {
			margin-left: 20rpx;
			width: 120rpx;
			height: 60rpx;
			line-height: 60rpx;
			background: #d5a65a;
			color: #fff;
			font-size: 24rpx;
			border-radius: 30rpx;
		}
	}
}

.category-popup {
	position: absolute;
	top: 245rpx;
	left: 0;
	width: 100%;
	background-color: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	z-index: 999;
	
	.category-list {
		max-height: 600rpx;
		padding: 20rpx 0;
	}
	
	.category-item {
		padding: 20rpx 30rpx;
		font-size: 28rpx;
		color: #333;
		
		&.category-active {
			color: #d5a65a;
			background-color: #f8f8f8;
		}
	}
}
</style>
