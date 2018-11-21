# cat ./src/Ad.js ./src/GoogleAd.js ./src/WechatAd.js > ./dist/adForGame.js
# cat ./lib/eventemitter3.js ./dist/adForGame.js > ./dist/adForGame-all.js
# uglifyjs -c -m -o ./dist/adForGame.min.js -- ./dist/adForGame.js
# uglifyjs -c -m -o ./dist/adForGame-all.min.js -- ./dist/adForGame-all.js
# webpack -o ./dist/lib.min.js --entry ./src/index.js --mode production --traget web
# rollup ./src/index.js --file ./dist/adForGame.js --format umd --name AFG
# rollup -c
# rollup -c rollup-all.config.js
# uglifyjs -c -m -o ./dist/adForGame.min.js -- ./dist/adForGame.js
# uglifyjs -c -m -o ./dist/adForGame-all.min.js -- ./dist/adForGame-all.js
browserify ./src/index.js > ./dist/adForGame.js -s AFG