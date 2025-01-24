<!-- 添加修改地址 -->
<template>
	<view class="address-wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
			<!-- 地址定位 -->
			<view class="location-item u-flex u-row-between u-p-20 u-m-b-20" @tap="getLocation">
				<view class="u-flex">
					<text class="u-iconfont uicon-map-fill" style="#a76f0d;"></text>
					<text>{{ chooseAddress }}</text>
				</view>
				<text class="u-iconfont uicon-arrow-right" style="color: #666"></text>
			</view>

			<view class="address-box">
				<!-- 地址表单 -->
				<u-form-item :labelStyle="labelStyle" 　 label-width="150" label-position="left" label="收货人:" prop="name">
					<u-input placeholder="请填写收货人姓名" v-model="model.name" type="text"></u-input>
				</u-form-item>
				<u-form-item :labelStyle="labelStyle" 　 label-width="150" label-position="left" label="性别:" prop="sex">
					<u-radio-group v-model="model.sex">
						<u-radio name="1" style="margin-right: 30rpx;">先生</u-radio>
						<u-radio name="2">女士</u-radio>
					</u-radio-group>
				</u-form-item>
				<u-form-item :labelStyle="labelStyle" 　 label-width="150" label-position="left" label="手机号:" prop="phone">
					<u-input placeholder="请输入收货人手机号" v-model="model.phone" type="number"></u-input>
				</u-form-item>
				<u-form-item :labelStyle="labelStyle" label-position="left" label-width="150" label="详细地址:" prop="address">
					<u-input border type="textarea" v-model="model.address" placeholder="请输入详细的省市区及街道地址，如：广东省深圳市南山区xx街道xx路xx号" />
				</u-form-item>
			</view>

			<!-- 设置默认 -->
			<view class="default-box u-flex u-row-between">
				<text class="title">设为默认地址</text>
				<u-switch v-model="model.status" activeColor="#e9b461" size="40"></u-switch>
			</view>

			<!-- 功能按钮 -->
			<view class="foot_box u-p-30 u-m-t-50 u-flex u-row-around">
				<button v-show="addressId" class=" u-m-20 u-reset-button delete-btn u-flex-1" @tap="deleteAddress">删除收货地址</button>
				<button class=" u-m-20 u-reset-button save-btn u-flex-1" @tap="submit">保存收货地址</button>
			</view>
		</u-form>

		<!-- 省市区选择器 -->
		<u-select mode="mutil-column-auto" safe-area-inset-bottom :list="addressAreaList" v-model="showSelect" @confirm="regionConfirm"></u-select>
	</view>
</template>

<script>
import { MAP_KEY } from '@/env.js';
import Auth from '@/shopro/permission/index.js';
export default {
	components: {},
	data() {
		return {
			showSelect: false, //省市区
			addressAreaList: [],
			addressId: 0, //收货地址ID
			labelStyle: {
				'font-size': '28rpx',
				'font-weight': '600',
				color: '#595959'
			},
			model: {
				address: '', // 详细地址
				ing: '', // 经度
				lat: '', // 纬度
				name: '', // 收货人姓名
				phone: '', // 手机号
				sex: '1', // 性别：1先生 2女士
				status: 0 // 是否默认地址：1默认，0非默认
			},
			rules: {
				phone: [
					{
						required: true,
						message: '请输入收货人手机号',
						trigger: ['change', 'blur']
					},
					{
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						trigger: ['change', 'blur']
					}
				],
				name: [
					{
						required: true,
						message: '请填写收货人姓名',
						trigger: ['change', 'blur']
					}
				],
				address: [
					{
						required: true,
						message: '请输入详细地址',
						trigger: ['change', 'blur']
					}
				]
			},
			errorType: ['message'],
			chooseAddress: '点击选择地理位置' //定位地址
		};
	},
	computed: {},
	onReady() {
		this.$refs.uForm.setRules(this.rules);
	},
	onLoad() {
		this.addressId = this.$Route.query.id ? this.$Route.query.id : null;
		uni.setNavigationBarTitle({
			title: this.addressId ? '编辑收货地址' : '添加收货地址'
		});
		this.addressId && this.getAddressInfo();
		// 微信导入
		this.$Route.query.addressData && this.wxAddressInit();
	},
	methods: {
		// 获取省市区
		getArea() {
			this.$http('address.area').then(res => {
				if (res.code === 1) {
					let { provinceData, cityData, areaData } = res.data;
					provinceData.forEach((item, index) => {
						this.addressAreaList.push({ ...item, children: [] });
						this.addressAreaList[index].children.push(...cityData[index]);
						this.addressAreaList[index].children.forEach((item1, index1) => {
							item1['children'] = [];
							item1.children.push(...areaData[index][index1]);
						});
					});
				}
			});
		},
		// 微信导入数据格式
		wxAddressInit() {
			let wxAddress = this.$Route.query.addressData; //微信导入
			this.model.name = wxAddress.userName;
			this.model.phone = wxAddress.telNumber;
			this.model.address = wxAddress.detailInfo.replace(/%20/g, '');
			this.model.status = 0;
			this.model.sex = '1'; // 默认选择先生
		},

		// 确认省市区
		regionConfirm(e) {
			this.model.area_text = `${e[0].label}-${e[1].label}-${e[2].label}`;
		},

		// 获取定位
		async getLocation() {
			let authState = await new Auth('userLocation').check();
			authState &&
				uni.chooseLocation({
					success: res => {
						this.model.lat = res.latitude;
						this.model.ing = res.longitude;
						this.getLocationInfo();
					},
					fail: err => {
						console.log(err);
					}
				});
		},

		//逆坐标解析
		async getLocationInfo() {
			this.chooseAddress = '定位中...';
			const [error, res] = await uni.request({
				url: `https://restapi.amap.com/v3/geocode/regeo?location=${this.model.ing},${this.model.lat}&key=${MAP_KEY}`
			});
			if (res.data.status === '1') {
				const addressComponent = res.data.regeocode.addressComponent;
				this.chooseAddress = res.data.regeocode.formatted_address;
				this.model.address = res.data.regeocode.formatted_address;
			} else {
				console.log('%c逆地址解析失败，请检查是否在env中配置地图key', 'color:green;background:yellow');
			}
		},

		// 提交
		submit() {
			this.$refs.uForm.validate(valid => {
				valid ? this.editAddress() : console.log('验证失败');
			});
		},

		// 编辑添加地址
		editAddress() {
			let that = this;
			if (!this.addressId) {
				that.$http(
					'address.addAddress',
					{
						...that.model,
						status: that.model.status ? 1 : 0  // 转换为数字类型
					},
					'保存中...'
				).then(res => {
					if (res.code === 1) {
						that.$Router.back();
					}
				});
			} else {
				that.$http(
					'address.amendAddress',
					{
						...that.model,
						id: this.addressId,
						status: that.model.status ? 1 : 0  // 转换为数字类型
					},
					'保存中...'
				).then(res => {
					if (res.code === 1) {
						that.$Router.back();
					}
				});
			}
		},

		// 地址信息
		getAddressInfo() {
			const that = this;
			this.$http('address.info', {
				id: that.$Route.query.id
			}).then(res => {
				if (res.code === 1) {
					let addressData = res.data;
					that.addressId = addressData.id;
					that.model.address = addressData.address;
					that.model.phone = addressData.phone;
					that.model.name = addressData.name;
					that.model.sex = addressData.sex;
					that.model.lat = addressData.lat;
					that.model.ing = addressData.ing;
					that.model.status = addressData.status;
				}
			});
		},

		// 删除收货地址
		deleteAddress() {
			const that = this;
			that.$http(
				'address.del',
				{
					id: that.addressId
				},
				'删除中...'
			).then(res => {
				if (res.code === 1) {
					that.$Router.back();
				}
			});
		}
	}
};
</script>

<style lang="scss">
// 点击定位
.location-item {
	font-size: 28rpx;
	font-weight: 500;
	background-color: #fff;
	color: rgba(167, 111, 13, 1);
}

// 表单
.address-box {
	background-color: #fff;
	padding: 0 30rpx;
}
.address-item {
	height: 96rpx;
	background: #fff;
	border-bottom: 1rpx solid rgba(#dfdfdf, 0.5);
	padding: 0 25rpx;

	.item-title {
		color: #333;
		font-size: 28rpx;
		white-space: nowrap;
	}
	.inp {
		color: #333;
		font-size: 28rpx;
	}
}
.area-box {
	min-height: 120rpx;
	padding-bottom: 60rpx;
	background: #fff;
	padding: 30rpx 25rpx;
	.item-title {
		font-size: 28rpx;
		line-height: 28rpx;
		vertical-align: middle;
		white-space: nowrap;
	}
	.area-inp {
		color: #333;
		font-size: 28rpx;
		vertical-align: middle;
		margin-top: 8rpx;
		width: 550rpx;
	}
}
.default-box {
	height: 100rpx;
	padding: 0 25rpx;
	background: #fff;
	margin-top: 20rpx;
	.title {
		font-size: 28rpx;
	}
	.switch {
		transform: scale(0.8);
	}
}
// 底部按钮
.foot_box {
	.delete-btn {
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
	.save-btn {
		line-height: 70rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>
