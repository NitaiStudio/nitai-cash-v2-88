const express = require('express');
const cors = require('cors');
// লাইব্রেরি উপরে লোড না করে ভেতরে লোড করব যাতে ক্র্যাশ না করে

const app = express();
app.use(cors());
app.use(express.json());

// ✅ সার্ভার স্ট্যাটাস চেক (এটি ক্র্যাশ করবে না)
app.get('/', (req, res) => {
    // চেক করি Environment Variables আছে কি না
    const appId = process.env.APP_ID ? "Found ✅" : "Missing ❌";
    const secretKey = process.env.SECRET_KEY ? "Found ✅" : "Missing ❌";
    
    res.send(`
        <h1>Server Status: ONLINE 🟢</h1>
        <p>Your Vercel Server is running correctly.</p>
        <hr>
        <h3>Diagnostics:</h3>
        <p><b>APP_ID:</b> ${appId}</p>
        <p><b>SECRET_KEY:</b> ${secretKey}</p>
        <hr>
        <p><i>If keys are 'Missing', go to Vercel Settings > Environment Variables.</i></p>
    `);
});

// 💳 পেমেন্ট তৈরি করার ফাংশন
app.post('/create-order', async (req, res) => {
    try {
        // এখানে লাইব্রেরি লোড করছি
        const { Cashfree } = require('cashfree-pg');

        // কনফিগারেশন সেটআপ
        Cashfree.XClientId = process.env.APP_ID;
        Cashfree.XClientSecret = process.env.SECRET_KEY;
        Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

        const { amount } = req.body;

        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: "ORD_" + Date.now(),
            customer_details: {
                customer_id: "USER_" + Date.now(),
                customer_phone: "9999999999",
                customer_name: "Subscriber",
                customer_email: "test@example.com"
            },
            order_meta: {
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?status=success"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.json(response.data);

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ 
            error: "Internal Server Error", 
            message: error.message,
            details: error.response?.data 
        });
    }
});

module.exports = app;
