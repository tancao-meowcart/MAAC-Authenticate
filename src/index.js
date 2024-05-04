import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  const { shop } = req.query;

  if (!shop || (shop && shop === '')) {
    return res.send('<h1>Please enter shop name</h1>');
  }

  let shopDomain = shop;

  if (!shop.includes('.myshopify.com')) {
    shopDomain = shop + '.myshopify.com';
  }

  let nonce = crypto.randomBytes(16).toString('base64');

  let authorize_uri = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.APP_ID}&scope=${process.env.SCOPE}&redirect_uri=${process.env.REDIRECT_URL}&state=${nonce}`;

  return res.send(authorize_uri);
});

const writeToFile = (access_token) => {
  const filePath = 'data.json';
  const jsonData = JSON.stringify(access_token, null, 2);

  fs.writeFileSync(filePath, jsonData);
};

app.get('/api/callback', async (req, res) => {
  const { shop, code } = req.query;

  let url = `https://${shop}/admin/oauth/access_token?client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&code=${code}`;
  const response = await axios.post(url);

  writeToFile(response.data);

  return res.send(req.query);
});

app.get('/api/test', async (req, res) => {
  const { token } = req.query;

  let url = `https://tancaodev.myshopify.com`;
  
  const response = await axios.get(url + '/admin/api/2024-04/shop.json', {
    headers: {
      'X-Shopify-Access-Token': token,
    },
  });

  return res.send(response.data);
});

app.listen(PORT, () => {
  console.log(`Server is up on http://localhost:${PORT}`);
});
