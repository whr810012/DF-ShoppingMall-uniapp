<template>
	<!-- 产品分类导航 -->
	<view class="wrap">
		<view class="menu-category-box u-m-b-10">
			<view class="menu-tab-box u-flex u-flex-wrap">
				<view
					class="tab-list u-flex-col u-col-center u-row-center"
					:style="{ width: 100 / oneRowNum + '%' }"
					v-for="(item, index) in normalItems"
					:key="index"
					@tap="$tools.routerTo(item.path)"
				>
					<view class="tab-icon">
						<image :src="item.avatar" mode="aspectFill" class="category-image"></image>
					</view>
					<text class="">{{ item.name }}</text>
				</view>
			</view>
			<!-- 秒杀单独一行 -->
			<view class="menu-tab-box u-flex u-flex-wrap" v-if="seckillItem">
				<view
					class="tab-list u-flex-col u-col-center u-row-center seckill-item"
					:style="{ width: '100%' }"
					@tap="$tools.routerTo(seckillItem.path)"
				>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * shGridSwiper-滑动宫格列表
 * @property {Array} list - 列表数据
 * @property {Number|String} oneRowNum - 单行数量
 */
export default {
	components: {},
	data() {
		return {
			sortList: []
		};
	},
	props: {
		oneRowNum: {
			type: [Number, String],
			default: 5
		}
	},
	computed: {
		seckillItem() {
			return this.sortList.find(item => item.id === 10000);
		},
		normalItems() {
			return this.sortList.filter(item => item.id !== 10000);
		}
	},
	methods: {
		jump(path, query) {
			this.$Router.push({
				path: path,
				query: query
			});
		},
		// 处理分类数据
		processCategoryData(list) {
			return list.map(item => {
				return {
					...item,
					path: `/pages/goods/list?category_id=${item.id}`
				};
			});
		}
	},
	created() {
		this.$http('category.sort').then(res => {
			console.log('分类数据:', res.data)
			this.sortList = res.data || []
			// 截取前4个
			this.sortList = this.sortList.slice(0, 4)
			// 处理数据，添加路径
			this.sortList = this.processCategoryData(this.sortList)
			// 增加秒杀
			this.sortList.push({
				id: 10000,
				name: '限时秒杀',
				path: '/pages/activity/seckill/list'
			})
		}).catch(err => {
			console.error('获取分类失败:', err)
			this.sortList = []
		})
	}
};
</script>

<style lang="scss">
// 产品分类
.menu-category-box {
	position: relative;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	margin: 20rpx;
	padding: 10rpx 0;

	.menu-tab-box {
		.tab-list {
			font-size: 24rpx;
			font-weight: 500;
			color: #333;
			margin: 20rpx 0;
			transition: all 0.3s ease;
			
			&:active {
				transform: scale(0.95);
			}

			.tab-icon {
				width: 120rpx;
				height: 120rpx;
				margin-bottom: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				overflow: hidden;
				border-radius: 16rpx;

				.category-image {
					width: 120rpx;
					height: 120rpx;
					object-fit: cover;
					border-radius: 16rpx;
				}
			}
		}
		
		.seckill-item {
			background-image: url('https://img.51miz.com/Element/00/95/92/30/53e73670_E959230_53e9bc5b.jpg');
			background-size: 100% 100%;
			background-position: center;
			border-radius: 12rpx;
			margin: 20rpx;
			transition: all 0.3s ease;
			height: 160rpx;
			padding: 0;
			
			&:active {
				transform: scale(0.98);
			}
		}
	}

	.menu-category-dots {
		display: flex;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 16rpx;
		gap: 8rpx;

		.category-dot {
			width: 12rpx;
			height: 12rpx;
			background: #eee;
			border-radius: 50%;
			transition: all 0.3s ease;
		}

		.category-dot-active {
			width: 24rpx;
			height: 12rpx;
			background: #5677fc;
			border-radius: 6rpx;
		}
	}
}
</style>
