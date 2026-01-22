const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();
app.use(cors());
app.use(express.json());

// Cashfree কনফিগারেশন (Vercel Settings থেকে আসবে)
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

app.get('/', (req, res) => {
    res.send("Payment Server is Live & Running!");
});

app.post('/create-order', async (req, res) => {
    try {
        // ফ্রন্টএন্ড থেকে এমাউন্ট গ্রহণ করা (5 or 40)
        const { amount } = req.body;

        const orderId = "SUB_" + Date.now();
        
        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: "USER_" + Date.now(),
                customer_phone: "9999999999",
                customer_name: "Subscriber",
                customer_email: "user@example.com"
            },
            order_meta: {
                // পেমেন্ট সফল হলে আপনার এই লিঙ্কে ফিরে যাবে
                return_url: `https://nitaistudio.github.io/DutyTrackerPro/?order_id={order_id}`
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