import axios from "axios";

/**
 * transactionのPOST
 * `PORT=(ポート) FROM=(送信者名) TO=(受信者名) AMOUNT=(送信量) npx ts-node bot/sendTransaction.ts`
 * でPOST
 */
const {
    PORT = "3210",
    FROM = "testFrom",
    TO = "testTo",
    AMOUNT = 1
} = process.env;
axios.post(`http://localhost:${PORT}/transaction/new`, {
    sender: FROM,
    recipient: TO,
    amount: AMOUNT,
    timestamp: new Date()
}).then((res) => {
    console.log(res.status)
})