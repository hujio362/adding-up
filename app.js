'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
rl.on('line', lineString => {
    //ファイルを行単位で処理するコード
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = null;
        if(prefectureDataMap.has(prefecture)) {
            // 2週目以降で既に都道府県のキーがある場合
            value = prefectureDataMap.get(prefecture);
        } else {
            // 1週目でデータが無いときはデータの入れ物を作る
            value = {
                popu10: 0, // 2010年の人口データ
                popu15: 0,
                change: null // 変化率　
            }
        }
        // 年度ごとにvalueのpopu10とpopu15を更新する
        if (year === 2010) {
            value.popu10 = popu;
        } else if (year === 2015) {
            value.popu15 = popu;
        }

        // 都道府県をキーにしてデータを登録
        prefectureDataMap.set(prefecture, value);
    }
})

// データ読み込み後の処理はcloseのあとに記述する
rl.on('close', () => {
    for (const [key, value] of prefectureDataMap){
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap)
    .sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    }
    );
    // データを表示用に成形する
    const rankingStrings = rankingArray.map(([key, value]) => {
        // どのようなルールで成形するかを書く
        return `${key}: ${value.popu10} => ${value.popu15} 変化率: ${value.change}`; 
    })
    console.log(rankingStrings);
})