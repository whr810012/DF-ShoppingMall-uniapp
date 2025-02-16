import http from "@/shopro/request/index";
import share from "@/shopro/share";

const state = {
  shop: {}, // 商城信息
  wechat: {}, // 微信配置
  share: {}, // 分享配置
  payment: {}, // 支付配置
  addons: [], // 插件配置
  chat: uni.getStorageSync("chat") || {}, // 客服配置
  store: {}, // 商城信息
  tabbarData: [], //自定义底部导航数据
  recharge: uni.getStorageSync("recharge") || {}, //充值配置

  homeTemplate: [], // 首页模板数据
  userTemplate: [], // 个人中心模板数据
  floatData: {}, // 悬浮按钮数据
  popupData: {}, // 弹窗数据
  hasTemplate: true, //是否有模板数据
  shareInfo: {}, // 默认分享数据
};
const getters = {
  initShop: (state) => state.shop,
  initStore: (state) => state.store,
  initShare: (state) => state.share,
  initPayment: (state) => state.payment,
  initAddons: (state) => state.addons,
  initChat: (state) => state.chat,
  initWechat: (state) => state.wechat,
  initRecharge: (state) => state.recharge,

  hasTemplate: (state) => state.hasTemplate,
  homeTemplate: (state) => state.homeTemplate,
  userTemplate: (state) => state.userTemplate,
  floatData: (state) => state.floatData,
  popupData: (state) => state.popupData,
  tabbarData: (state) => state.tabbarData,

  shareInfo: (state) => state.shareInfo,
};

const actions = {
  // 初始化数据
  async appInit({ commit, dispatch }, options) {
    const result = await http("common.init");
    if (result.code === 1) {
      commit("CONFIG", result.data);
      if (!options?.query?.token) {
        dispatch("autoLogin");
      }
      return result.data;
    }
    return false;
  },

  // 获取模板数据
  async getTemplate({ commit }, options) {
    let shop_id = 0;
    // #ifdef H5
    if (options?.query.shop_id) {
      shop_id = options.query.shop_id;
    }
    // #endif

    // #ifdef MP
    if (options?.query.scene) {
      let scene = decodeURIComponent(options?.query.scene);
      let sceneObj = scene.split("=");
      if (sceneObj[0] === "shop_id") {
        shop_id = sceneObj[1];
      }
    }
    // #endif
    // const result = await http('common.template', shop_id ? {
    // 	shop_id
    // } : {});
    const result = {
      code: 1,
      msg: "模板数据",
      time: "1737280316",
      data: {
        home: [
          {
            id: 58353,
            type: "banner",
            category: "home",
            name: "轮播图",
            content: {
              name: "",
              style: 1,
              height: 530,
              radius: 0,
              x: 0,
              y: 0,
              list: [
                {
                  image:
                    "https://img.tuguaishou.com/ips_templ_preview/92/51/9a/lg_3230950_1612605512_601e68485b0ec.jpg!w1024_w?auth_key=1897344000-0-0-269dd1cbf93479f0dbd02bc3b3869b7c",
                  path: "",
                  path_type: 1,
                  name: "",
                  bgcolor: "#a71f23",
                  path_name: "",
                },
                {
                  image:
                    "https://photo.16pic.com/00/49/96/16pic_4996371_b.jpg",
                  path: "",
                  path_type: 1,
                  name: "",
                  bgcolor: "#e2d1c0",
                  path_name: "",
                },
              ],
            },
            decorate_id: 5791,
          },
          {
            id: 58354,
            type: "menu",
            category: "home",
            name: "菜单组",
            content: {
              name: "",
              style: 4,
              list: [
                {
                  name: "签到有礼",
                  image:
                    "http://file.shopro.top/uploads/20210518/884360099a48d435e23e24091fb7084f.png",
                  path: "/pages/activity/sign/index",
                  path_name: "签到中心",
                  path_type: 1,
                },
                {
                  name: "品质拼团",
                  image:
                    "http://file.shopro.top/uploads/20210518/ce173c7d81d9521350620e51b0166808.png",
                  path: "/pages/activity/groupon/list",
                  path_name: "今日必拼",
                  path_type: 1,
                },
                {
                  name: "限时秒杀",
                  image:
                    "http://file.shopro.top/uploads/20210518/cdc081320a7676753af09dbfad64b0f5.png",
                  path: "/pages/activity/seckill/list",
                  path_name: "限时秒杀",
                  path_type: 1,
                },
                {
                  name: "领福利",
                  image:
                    "http://file.shopro.top/uploads/20210518/c7b17849d22f345b4886d9a7dc6ef72a.png",
                  path: "",
                  path_name: "",
                  path_type: 1,
                },
                {
                  image:
                    "http://file.shopro.top/uploads/20210518/f94b398fe5d6be343b4c2200f7fc3b0a.png",
                  path: "",
                  name: "美食酒水",
                  path_name: "",
                  path_type: 1,
                },
                {
                  image:
                    "http://file.shopro.top/uploads/20210518/6dde00b61b242f8c9ed79c65d3fb0b1d.png",
                  path: "",
                  name: "居家生活",
                  path_name: "",
                  path_type: 1,
                },
                {
                  image:
                    "http://file.shopro.top/uploads/20210518/755895207ed20ab11c141f5f2cf4946e.png",
                  path: "",
                  name: "数码电器",
                  path_name: "",
                  path_type: 1,
                },
                {
                  image:
                    "http://file.shopro.top/uploads/20210518/9cf90a9392c7765bdfc2a5854e1295ff.png",
                  path: "",
                  name: "服装鞋包",
                  path_name: "",
                  path_type: 1,
                },
              ],
            },
            decorate_id: 5791,
          },
          {
            id: 58356,
            type: "title-block",
            category: "home",
            name: "标题栏",
            content: {
              name: "为你推荐",
              color: "#000000",
              image: "https://file.shopro.top/imgs/title1.png",
            },
            decorate_id: 5791,
          },
          {
            id: 583516,
            type: "goods-list",
            decorate_id: 57911,
          },
          {
            id: 583561,
            type: "title-block",
            category: "home",
            name: "标题栏",
            content: {
              name: "限时秒杀",
              color: "red",
              image: "https://file.shopro.top/imgs/title2.png",
            },
            decorate_id: 57911,
          },
          {
            id: 5835161,
            type: "seckill",
            decorate_id: 579111,
          },
        ],
        user: [
          {
            id: 58359,
            type: "user",
            category: "user",
            name: "用户卡片",
            content: {
              name: "用户卡片",
              image:
                "http://file.shopro.top/uploads/20210518/c4e353836a5d04e92697d22f95d0c5a5.png",
              style: 2,
              color: "#eeeeee",
            },
            decorate_id: 5791,
          },
          {
            id: 58360,
            type: "order-card",
            category: "user",
            name: "订单卡片",
            content: [],
            decorate_id: 5791,
          },
          {
            id: 58361,
            type: "banner",
            category: "user",
            name: "轮播图",
            content: {
              name: "",
              style: 1,
              height: 520,
              radius: 20,
              x: 0,
              y: 0,
              list: [
                {
                  name: "",
                  bgcolor: "#9c100f",
                  image:
                    "https://tse3-mm.cn.bing.net/th/id/OIP-C.WYfvDjokA0D8Bkd0igcdNAHaDt?rs=1&pid=ImgDetMain",
                  path: "",
                  path_name: "",
                  path_type: 1,
                },
                {
                  image:
                    "https://img.51miz.com/preview/muban/00/00/38/19/M-381914-EE52D97C.jpg",
                  path: "",
                  path_type: 1,
                  name: "",
                  bgcolor: "#baacbf",
                  path_name: "",
                },
              ],
            },
            decorate_id: 5791,
          },
          {
            id: 58362,
            type: "wallet-card",
            category: "user",
            name: "资产卡片",
            content: [],
            decorate_id: 5791,
          },
          {
            id: 58363,
            type: "grid-list",
            category: "user",
            name: "宫格列表",
            content: {
              name: "",
              list: [
                // {
                //   name: "商品收藏",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/b726f027bd679f0f5a36c6e301430790.png",
                //   path: "/pages/user/favorite",
                //   path_name: "我的收藏",
                //   path_type: 1,
                // },
                // {
                //   name: "浏览足迹",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/d4e05c1560722ec63fde08e3217d3296.png",
                //   path: "/pages/user/view-log",
                //   path_name: "浏览足迹",
                //   path_type: 1,
                // },
                // {
                //   name: "积分商城",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/234139fd11f6f8451e4c517f256c6b45.png",
                //   path: "/pages/app/score/list",
                //   path_name: "积分商品",
                //   path_type: 1,
                // },
                // {
                //   name: "我的拼团",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/5d53a6e7f940c5ef925f63c1810c8429.png",
                //   path: "/pages/activity/groupon/my-groupon",
                //   path_name: "我的拼团",
                //   path_type: 1,
                // },
                // {
                //   name: "常见问题",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/555ef0a1151e83014610b288e53827c2.png",
                //   path: "/pages/public/faq",
                //   path_name: "常见问题",
                //   path_type: 1,
                // },
                {
                  name: "系统设置",
                  image:
                    "http://file.shopro.top/uploads/20210518/9ac9ef6f9df49f89ace437c53a76adca.png",
                  path: "/pages/user/set",
                  path_name: "系统设置",
                  path_type: 1,
                },
                // {
                //   name: "分销中心",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/a470b691a09eec29d56e0a55b02f70e0.png",
                //   path: "/pages/app/commission/index",
                //   path_name: "分销中心",
                //   path_type: 1,
                // },
                // {
                //   name: "门店入驻",
                //   image:
                //     "http://file.shopro.top/uploads/20210518/ccb0390403a473d6b019d330bbf6bca4.png",
                //   path: "/pages/app/merchant/apply",
                //   path_name: "门店入驻",
                //   path_type: 1,
                // },
              ],
            },
            decorate_id: 5791,
          },
        ],
        tabbar: [
          {
            id: 58358,
            type: "tabbar",
            category: "tabbar",
            name: "底部导航",
            content: {
              style: 3,
              color: "#000",
              activeColor: "#999",
              bgcolor: "#fff",
              list: [
                {
                  name: "首页",
                  image: "",
                  activeImage: "",
                  path: "/pages/index/index",
                  path_name: "首页",
                  path_type: 1,
                },
                {
                  name: "分类",
                  image: "",
                  activeImage: "",
                  path: "/pages/index/category?id=214",
                  path_name: "分类-工业品",
                  path_type: 1,
                },
                {
                  name: "购物车",
                  image: "",
                  activeImage: "",
                  path: "/pages/index/cart",
                  path_name: "购物车",
                  path_type: 1,
                },
                {
                  name: "我的",
                  image: "",
                  activeImage: "",
                  path: "/pages/index/user",
                  path_name: "我的",
                  path_type: 1,
                },
              ],
            },
            decorate_id: 5791,
          },
        ],
        popup: [
          {
            id: 58357,
            type: "popup",
            category: "popup",
            name: "弹窗提醒",
            content: {
              list: [
                {
                  name: "",
                  style: 1,
                  image:
                    "http://file.shopro.top/uploads/20210518/9136ecddcddf6607184fab689207e7e3.png",
                  btnimage: "",
                  path: "",
                  path_name: "",
                  path_type: 1,
                },
              ],
            },
            decorate_id: 5791,
          },
        ],
        "float-button": [
          {
            id: 58364,
            type: "float-button",
            category: "float-button",
            name: "悬浮按钮",
            content: {
              image:
                "http://file.shopro.top/uploads/20210518/f6b9c9d20d21df541ac52e9548486e1a.png",
              list: [
                {
                  name: "关注",
                  style: 1,
                  image:
                    "http://file.shopro.top/uploads/20210522/ff3fba3ef6a402aa770bde5a60e7f49f.png",
                  btnimage:
                    "http://file.shopro.top/uploads/20210522/1f4ee09203ca1ae620137925d77275d7.png",
                  path: "",
                  path_name: "",
                  path_type: 1,
                },
                {
                  name: "活动",
                  style: 2,
                  image: "",
                  btnimage:
                    "http://file.shopro.top/uploads/20210522/5c50e0b17d64f448d271cfaac5039e00.png",
                  path: "/pages/activity/groupon/list",
                  path_name: "今日必拼",
                  path_type: 1,
                },
                {
                  name: "客服",
                  style: 2,
                  image: "",
                  btnimage:
                    "http://file.shopro.top/uploads/20210522/73234ab79bd6164b11f09a1b11df3f55.png",
                  path: "/pages/public/chat/index",
                  path_name: "客服",
                  path_type: 1,
                },
              ],
            },
            decorate_id: 5791,
          },
        ],
      },
    };
    if (result.code === 1) {
    	commit("hasTemplate", true);
    	commit('TEMPLATE', result.data);
    	return result.data;
    } else
    {
    commit("hasTemplate", false);
    return false;
    }
  },
  // 重新登录

  // 同步路由到后端
  syncPages({ commit }) {
    http("common.syncPages", {
      data: ROUTES,
    });
  },
};

const mutations = {
  CONFIG(state, payload) {
    Object.keys(payload).forEach((k) => {
      state[k] = payload[k];
      if (k === "chat") {
        uni.setStorageSync("chat", payload[k]);
      }
      if (k === "recharge") {
        uni.setStorageSync("recharge", payload[k]);
      }
    });
  },

  TEMPLATE(state, data) {
    state.template = data;
    state.homeTemplate = data.home;
    state.userTemplate = data.user;
    state.floatData = data["float-button"]?.[0]?.content;
    state.popupData = data?.popup?.[0]?.content;
    state.tabbarData = data?.tabbar?.[0]?.content;
  },

  hasTemplate(state, data) {
    state.hasTemplate = data;
  },
  // 弹窗一次的话，关闭的时候删除数据。
  delPopup(state, index) {
    let popupData = state.popupData;
    popupData.list.splice(index, 1);
    state.template = popupData;
  },
  shareInfo(state, shareInfo) {
    state.shareInfo = shareInfo;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
