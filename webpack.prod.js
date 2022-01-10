const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
	mode: "production",
	plugins: [new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" })],
	module: {
		rules: [
			{
				test: /\.scss$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},
	optimization: {
		minimizer: [
			// For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
			`...`,
			new CssMinimizerPlugin(),
		],
	},
});
