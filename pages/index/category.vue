<!-- 分类 -->
<template>
	<view class="category-box">
		<!--直接购买，点餐 -->
		<takeout-catgory :categoryStyleId="categoryStyleId"></takeout-catgory>
		<!-- 登录提示 -->
		<shopro-auth-modal v-if="authType"></shopro-auth-modal>
		<!-- <shopro-tabbar></shopro-tabbar> -->
	</view>
</template>

<script>
import takeoutCatgory from './category/takeout-catgory.vue';
import threeCatgory from './category/three-catgory.vue';
import twoCatgory from './category/two-catgory.vue';
import oneCatgory from './category/one-catgory.vue';
import { mapMutations, mapActions, mapState, mapGetters } from 'vuex';
export default {
	components: {
		takeoutCatgory
	},
	data() {
		return {
			categoryType: 0, //1:快速购买,2:一级分类，3:二级分类，4:三级分类
			categoryStyleId: 0 //分类Id
		};
	},
	computed: {
		...mapGetters(['authType'])
	}
};
</script>

<style lang="scss">
.category-box {
	height: 100%;
	flex: 1;
	overflow: hidden;
}
</style>
