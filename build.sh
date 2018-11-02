cat ./lib/eventemitter3.js ./src/adForGame.js > ./dist/adForGame-all.js & cp ./src/adForGame.js ./dist/adForGame.js
uglifyjs -c -m -o ./dist/adForGame.min.js -- ./dist/adForGame.js
uglifyjs -c -m -o ./dist/adForGame-all.min.js -- ./dist/adForGame-all.js
