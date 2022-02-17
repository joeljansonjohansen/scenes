const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/index.js",
		test: "./src/test.js",
	},
	output: {
		filename: "[name].[fullhash].js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./index.html",
		}),
		new HtmlWebpackPlugin({
			// Also generate a test.html
			filename: "test.html",
			template: "./test.html",
			excludeChunks: ["app"],
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				use: ["html-loader"],
			},
			{
				test: /\.(mp3|wav|m4a)$/i,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "./src/assets/",
					},
				},
			},
			{
				test: /\.json$/i,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "./",
					},
				},
			},
			{
				test: /\.(otf|ttf|eot|woff|woff2|svg)$/i,
				type: "asset/resource",
				generator: {
					filename: "./src/assets/fonts/[name][ext]",
				},
				/* use: {
					loader: "file-loader",
					options: {
						filename: "[name].[ext]",
						outputPath: "./src/assets/fonts",
					},
				}, */
			},
		],
	},
};
