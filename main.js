import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import {apiUrl, apiPath} from './config.js'
import productModal from './components/productModal.js'

// 載入驗證
Object.keys(VeeValidateRules).forEach(rule => {
	if (rule !== 'default') {
		VeeValidate.defineRule(rule, VeeValidateRules[rule]);
	}
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
	generateMessage: VeeValidateI18n.localize('zh_TW'),
	validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
	data() {
		return {
			isLoading: '',
			productList: [],
			product: [],
			cart: {},
			form: {
				user: {
					email: '',
					name: '',
					tel: '',
					address: '',
				},
				message: ''
			}
		};
	},
	methods: {
		/**
		 * 取得產品列表
		 */
		getProducts() {
			const url = `${apiUrl}/api/${apiPath}/products`;
			axios
				.get(url)
				.then((res) => {
					// console.log(res.data.products)
					this.productList = res.data.products;
				})
				.catch((err) => {
					alert(err.data.message);
				});
		},
		/**
		 * 取得單一產品
		 */
		getProduct(id){
			const url = `${apiUrl}/api/${apiPath}/product/${id}`;
			this.isLoading = id;
			axios
				.get(url)
				.then((res) => {
					// console.log(res.data.product)
					this.product = res.data.product;
					this.isLoading = '';
					this.$refs.productModal.showModal();
				})
				.catch((err) => {
					alert(err.data.message);
				});
		},
		/**
		 * 新增商品至購物車
		 */
		addToCart(id, qty=1){
			const url = `${apiUrl}/api/${apiPath}/cart`;
			const cart = {
				product_id: id,
				qty,
			};
			this.isLoading = id;
			this.$refs.productModal.hideModal();
			this.$refs.productModal.qty = 1;

			axios
				.post(url, {data: cart})
				.then((res) => {
					alert(res.data.message);
					this.isLoading = '';
					this.getCart();
				})
				.catch((err) => {
					alert(err.data.message);
				});
		},
		/**
		 * 刪除商品
		 */
		delCartItem(id){
			const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
			this.isLoading = id;
			axios
				.delete(url)
				.then((res) => {
					alert(res.data.message);
					this.isLoading = '';
					this.getCart();
				})
				.catch((err) => {
					alert(err.data.message);
				})
		},
		/**
		 * 清空購物車
		 */
		clearCart(){
			const url = `${apiUrl}/api/${apiPath}/carts`;
			axios
				.delete(url)
				.then((res) => {
					alert(res.data.message);
					this.getCart();
				})
				.catch((err) => {
					alert(err.data.message);
				});
		},
		/**
		 * 取得購物車
		 */
		getCart(){
			const url = `${apiUrl}/api/${apiPath}/cart`;
			axios
				.get(url)
				.then((res) => {
					// console.log(res.data.data)
					this.cart = res.data.data;

				})
				.catch((err) => {
					alert(err.data.message);
				});
		},
		/**
		 * 修改購物車
		 */
		updateCartItem(data){
			const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`;
			const cart = {
				product_id: data.product_id,
				qty: data.qty,
			}
			this.isLoading = data.id;

			axios
				.put(url, {data: cart})
				.then((res) => {
					alert(res.data.message);
					this.isLoading = '';
					this.getCart();
				})
				.catch((err) => {
					alert(err.data.message);
					this.isLoading = '';
				});
		},
		/**
		 * 電話驗證
		 */
		isPhone(value) {
			const phoneNumber = /^(09)[0-9]{8}$/
			return phoneNumber.test(value) ? true : '需要正確的電話號碼'
		},
		/**
		 * 送出表單
		 */
		createOrder() {
			const url = `${apiUrl}/api/${apiPath}/order`;
			const order = this.form;

			axios
				.post(url, {data: order})
				.then((res) => {
					alert(res.data.message)
					this.$refs.form.resetForm();
					this.form.message = '';
					this.getCart();
				})
				.catch((err) => {
					alert(err.data.message);
				})
		},
	},
	components: {
		productModal
	},
	mounted() {
		this.getProducts();
		this.getCart();
	},
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
app.mount("#app");
