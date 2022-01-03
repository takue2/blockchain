import axios from "axios";

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