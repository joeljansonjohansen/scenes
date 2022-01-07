const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./index.html",
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				use: ["html-loader"],
			},
			{
				test: /\.(mp3|wav|m4a|otf|ttf)$/i,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "src/assets/",
					},
				},
			},
		],
	},
};
