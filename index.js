const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    // চেক করা হচ্ছে Key গুলো সার্ভার পাচ্ছে কিনা
    const appIdStatus = process.env.APP_ID ? "✅ Found" : "❌ Missing";
    const secretKeyStatus = process.env.SECRET_KEY ? "✅ Found" : "❌ Missing";

    res.send(`
        <h1>Server Status Check</h1>
        <p><b>Server:</b> Running</p>
        <p><b>APP_ID:</b> ${appIdStatus}</p>
        <p><b>SECRET_KEY:</b> ${secretKeyStatus}</p>
        <hr>
        <p>If keys are missing, go to Vercel Settings > Environment Variables to add them.</p>
    `);
});

app.post('/create-order', async (req, res) => {
    try {
        // এখানে লাইব্রেরি ইম্পোর্ট করা হচ্ছে যাতে ক্র্যাশ না করে
        const { Cashfree } = require('cashfree-pg');

        // লাইব্রেরি কনফিগারেশন
        Cashfree.XClientId = process.env.APP_ID;
        Cashfree.XClientSecret = process.env.SECRET_KEY;
        Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

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

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ 
            error: "Payment Failed", 
            details: error.message,
            tip: "Check Vercel Logs for more info" 
        });
    }
});

module.exports = app;