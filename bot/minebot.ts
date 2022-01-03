import axios from "axios";

/**
 * 定時でマイニングするbot
 * `PORT=(サーバーのポート) npx ts-node bot/minebot.ts`
 * で指定したサーバーでの定時マイニングを実行
 */
const port = process.env.PORT || "3210";
const url = `http://localhost:${port}/mine`
console.log(`start mining on ${url}`)

setInterval(async () => {
    const mine = await axios.get(url)
    console.log(mine.data)
}, 5000)
