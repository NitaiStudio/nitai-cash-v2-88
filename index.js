const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();
app.use(cors());
app.use(express.json());

// কনফিগারেশন
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// হোম পেজ চেক করার জন্য
app.get('/', (req, res) => {
    res.send("Server is running perfectly!");
});

// পেমেন্ট অর্ডার তৈরি করার জন্য
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
                customer_name: "Subscriber",
                customer_email: "test@example.com"
            },
            order_meta: {
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?order_id={order_id}"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ভার্সেলের জন্য জরুরি লাইন
module.exports = app;
