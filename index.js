const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');

const app = express();
app.use(cors()); // CORS এখন Express হ্যান্ডেল করছে, Vercel নয়।
app.use(express.json());

// Cashfree কনফিগারেশন
Cashfree.XClientId = process.env.APP_ID;
Cashfree.XClientSecret = process.env.SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// CORS Pre-flight Request হ্যান্ডেল করা (খুব জরুরি)
app.options('*', cors());

// সার্ভার চালু আছে কি না চেক করার জন্য হোমপেজ
app.get('/', (req, res) => {
    res.status(200).send("Cashfree API is READY! (Universal CORS)");
});

// পেমেন্ট অর্ডার তৈরি করার এপিআই
app.post('/create-order', async (req, res) => {
    try {
        // ... (বাকি কোড আগের মতই থাকবে)

        // যদি আপনার Blogspot এ কাজ না করে, তবে এই লাইনটি কমেন্ট করুন।
        // Cashfree.PGCreateOrder("2023-08-01", request);

        // Debug করার জন্য শুধু সেশন আইডি পাঠান।
        // res.json({ payment_session_id: "Debug_ID_123" });

        // ... (বাকি কোড)
        const { amount } = req.body;
        const request = {
            order_amount: parseFloat(amount),
            order_currency: "INR",
            order_id: "ORD_" + Date.now(),
            customer_details: {
                customer_id: "CUST_" + Date.now(),
                customer_phone: "9999999999"
            },
            order_meta: {
                return_url: "https://nitaistudio.github.io/DutyTrackerPro/?order_id={order_id}"
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Server Error! " + err.message });
    }
});

module.exports = app;
