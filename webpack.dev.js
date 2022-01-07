const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
	mode: "development",
	module: {
		rules: [
			{
				test: /\.scss$/i,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
});
