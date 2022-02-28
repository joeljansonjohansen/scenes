const path = require("path");
const common = require("./webpack.common");
const fs = require("fs");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
	/* devServer: {
		host: "localhost",
		port: 8080,
		https: {
			key: fs.readFileSync("./server.key"),
			cert: fs.readFileSync("./server.crt"),
		},
	}, */
	mode: "development",
	module: {
		rules: [
			{
				test: /\.scss$/i,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
		],
	},
});
