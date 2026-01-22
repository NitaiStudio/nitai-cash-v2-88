const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();
app.use(cors());
app.use(express.json());

// Cashfree কনফিগারেশন (Vercel Environment Variables থেকে আসবে)
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// সার্ভার চালু আছে কি না চেক করার জন্য হোমপেজ
app.get('/', (req, res) => {
    res.status(200).send("Cashfree API Server is Running!");
});

// পেমেন্ট অর্ডার তৈরি করার এপিআই
app.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;

        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: "ORD_" + Date.now(),
            customer_details: {
                customer_id: "CUST_" + Date.now(),
                customer_phone: "9999999999",
                customer_name: "Subscriber"
            },
            order_meta: {
                // পেমেন্ট শেষে আপনার এই লিঙ্কে ফিরে যাবে
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?order_id={order_id}"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;