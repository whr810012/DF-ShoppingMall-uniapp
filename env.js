/**
 *  Shopro全局配置文件 v1.4.0
 */

// 接口根域名 https://demo.shopro.top
export const BASE_URL = 'http://localhost:8080'

// 接口路径
export const API_URL = `${BASE_URL}/user/`

// 全局网络图片地址变量，css背景图片地址变量在uni.scss中定义
export const IMG_URL = 'https://file.shopro.top'

//高德地图开发者Web服务key,逆坐标解析必须
export const MAP_KEY = 'ffdbb001fd0b4cc024456334e9aa6567'

//后台是否开通直播权限,根据情况在manifest.json中引入直播插件，并在pages.json中打开直播页面
export const HAS_LIVE = false 
