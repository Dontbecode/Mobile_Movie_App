module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			"babel-preset-expo",
			"nativewind/babel",
		],
		plugins: [
			// Pastikan Reanimated plugin selalu terakhir
			"react-native-reanimated/plugin",
		],
	};
};