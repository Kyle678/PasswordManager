const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/api', (req, res) => {
    res.json({ message: 'Hello there' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});