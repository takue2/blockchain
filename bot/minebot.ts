import axios from "axios";

const port = process.env.PORT || "3210";
const url = `http://localhost:${port}/mine`
console.log(`start mining on ${url}`)

setInterval(async () => {
    const mine = await axios.get(url)
    console.log(mine.data)
}, 5000)
