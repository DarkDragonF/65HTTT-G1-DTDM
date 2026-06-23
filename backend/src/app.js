const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
