<template>
	<div class="flex-col">
		<div class="flex- justify-center">
			<bounce-loader :loading="isLoading" :size="100" :color="'#68d391'" />
		</div>
		<template v-if="!isLoading">
			<div class="flex flex-col sm:flex-row justify-around items-center">
				<div class="flex flex-col items-center">
					<img
						:src="`https://static.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`"
						:alt="asset.name"
						class="w-20 h-20 mr-5"
					/>
					<h1 class="text-5xl">
						{{ asset.name }}
						<small class="sm:mr-2 text-gray-500">{{ asset.symbol }}</small>
					</h1>
				</div>

				<div class="my-10 flex flex-col">
					<ul>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Ranking</b>
							<span>#{{ asset.rank }}</span>
						</li>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Precio actual</b>
							<span>{{ asset.priceUsd | dollar }}</span>
						</li>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Precio más bajo</b>
							<span>{{ min | dollar }}</span>
						</li>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Precio más alto</b>
							<span>{{ max | dollar }}</span>
						</li>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Precio Promedio</b>
							<span>{{ avg | dollar }}</span>
						</li>
						<li class="flex justify-between">
							<b class="text-gray-600 mr-10 uppercase">Variación 24hs</b>
							<span>{{ asset.changePercent24Hr | percent }}</span>
						</li>
					</ul>
				</div>

				<div class="my-10 sm:mt-0 flex flex-col justify-center text-center">
					<button @click="toggleConvert" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
						{{ fromUsd ? `USD a ${asset.symbol}` : `${asset.symbol} a USD` }}
					</button>

					<div class="flex flex-row my-5">
						<label class="w-full" for="convertValue">
							<input
								v-model="convertValue"
								id="convertValue"
								type="number"
								:placeholder="`Valor en ${fromUsd ? 'USD' : asset.symbol}`"
								class="text-center bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
							/>
						</label>
					</div>

					<span class="text-xl">{{ convertResult }} {{ fromUsd ? asset.symbol : 'USD' }}</span>
				</div>
			</div>
			<line-chart
				class="my-10"
				:colors="['orange']"
				:min="min"
				:max="max"
				:data="history.map((h) => [h.date, parseFloat(h.priceUsd).toFixed(2)])"
			>
			</line-chart>

			<h3 class="text-xl my-10">Mejores ofertas de cambio</h3>
			<table>
				<tr v-for="m in markets" :key="`{m.exchangeId}-${m.priceUsd}`" class="border-b">
					<td>
						<b>{{ m.exchangeId }} </b>
					</td>
					<td>{{ m.priceUsd | dollar }}</td>
					<td>{{ m.baseSymbol }} / {{ m.quoteSymbol }}</td>
					<td>
						<px-button :isLoading="m.isLoading" v-if="!m.url" @click="getWebSite(m)">
							<slot>Obtener Link</slot>
						</px-button>
						<a v-else class="hover:underline text-green-600" target="_blank">{{ m.url }}</a>
					</td>
				</tr>
			</table>
		</template>
	</div>
</template>

<script>
import api from '@/api';
import PxButton from '@/components/PxButton';
export default {
	name: 'CoinDetail',
	components: { PxButton },
	data() {
		return {
			isLoading: false,
			asset: {},
			history: [],
			markets: [],
			fromUsd: true,
			convertValue: null,
		};
	},
	watch: {
		$route() {
			this.getCoin();
		},
	},
	created() {
		this.getCoin();
	},
	computed: {
		min() {
			return Math.min(...this.history.map((h) => parseInt(h.priceUsd).toFixed(2)));
		},
		max() {
			return Math.max(...this.history.map((h) => parseInt(h.priceUsd).toFixed(2)));
		},
		avg() {
			return this.history.reduce((a, b) => a + parseFloat(b.priceUsd), 0) / this.history.length;
		},
		convertResult() {
			if (!this.convertValue) {
				return 0;
			}

			const result = this.fromUsd ? this.convertValue / this.asset.priceUsd : this.convertValue * this.asset.priceUsd;

			return result.toFixed();
		},
	},
	methods: {
		toggleConvert() {
			this.fromUsd = !this.fromUsd;
		},
		getWebSite(exchange) {
			this.$set(exchange, 'isLoading', true);
			return api
				.getExchange(exchange.exchangeId)
				.then((res) => {
					//exchange.url = res.exchangeUrl;

					// En este caso se tiene un problema de reactividad con VUe
					// Debido a que la propiedad url no fue montada desde el inicio
					// entonces para arreglar el problema de reactividad y la propiedad sea
					// detectada agregamos
					this.$set(exchange, 'url', res.exchangeUrl);
				})
				.finally(() => {
					this.$set(exchange, 'isLoading', false);
				});
		},
		getCoin() {
			this.isLoading = true;
			// obtenemos el id pasado a la ruta para ver que coin se consultara
			const id = this.$route.params.id;
			// Ejecutamos diferentes promises de manera simultanea
			Promise.all([api.getAsset(id), api.getAssetHistory(id), api.getMarkets(id)])
				.then(([asset, history, markets]) => {
					this.asset = asset;
					this.history = history;
					this.markets = markets;
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
	},
};
</script>

<style scoped>
td {
	padding: 10px;
	text-align: center;
}
</style>
