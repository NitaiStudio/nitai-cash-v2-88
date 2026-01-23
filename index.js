const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();

// 🚀 সলিউশন: সব ওয়েবসাইটকে পারমিশন দেওয়া হলো (CORS Fix)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Cashfree কনফিগারেশন
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// ✅ সার্ভার চেক করার রুট
app.get('/', (req, res) => {
    const keyCheck = process.env.APP_ID ? "Active" : "Missing";
    res.status(200).send(`Server is RUNNING! Keys: ${keyCheck}`);
});

// 💳 পেমেন্ট তৈরি করার রুট
app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;

        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: "SUB_" + Date.now(),
            customer_details: {
                customer_id: "USER_" + Date.now(),
                customer_phone: "9999999999",
                customer_name: "Subscriber",
                customer_email: "user@example.com"
            },
            order_meta: {
                // পেমেন্ট শেষে যেখানে ফিরে আসবে
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?status=success"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Cashfree Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Payment Creation Failed", 
            details: error.message 
        });
    }
});

module.exports = app;