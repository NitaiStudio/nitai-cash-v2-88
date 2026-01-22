const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();
app.use(cors());
app.use(express.json());

// কনফিগারেশন - যা ভার্সেল সেটিংস থেকে আসবে
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

app.get('/', (req, res) => {
    res.send("Server is Running and Healthy!");
});

app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // টাকার পরিমাণ ৫ বা ৪০ ছাড়া অন্য কিছু হলে রিজেক্ট করবে
        if (amount != 5 && amount != 40) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const orderId = "SUB_" + Date.now();
        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: "ID_" + Date.now(),
                customer_phone: "9999999999",
                customer_name: "Subscriber",
                customer_email: "test@example.com"
            },
            order_meta: {
                // পেমেন্ট শেষে এই লিঙ্কে ফিরে যাবে
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?order_id={order_id}"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.json(response.data);

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
