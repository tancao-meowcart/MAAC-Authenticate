import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
import ShopifyService from './services/ShopifyService.js';
import { verifyWebhook } from './middlewares/verifyWebhook.js';
import { receive } from './controllers/webhookController.js';
import path from 'path';
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.post(
  '/api/shopify/webhooks',
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.post('/api/shopify/webhooks', verifyWebhook, receive);

app.post('/api/shopify/webhooks', async (req, res) => {
  return res.send(req.body);
});

app.get('/api/callback', async (req, res) => {
  const { shop, code } = req.query;

  let url = `https://${shop}/admin/oauth/access_token?client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&code=${code}`;
  const response = await axios.post(url);

  writeToFile(response.data);

  return res.send(req.query);
});

app.use(express.json());

app.get('/', (req, res) => {
  const { shop } = req.query;

  if (!shop || (shop && shop === '')) {
    return res.send('<h1>Please enter shop name.</h1>');
  }

  let shopDomain = shop;

  if (!shop.includes('.myshopify.com')) {
    shopDomain = shop + '.myshopify.com';
  }

  let nonce = crypto.randomBytes(16).toString('base64');

  let authorize_uri = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.APP_ID}&scope=${process.env.SCOPE}&redirect_uri=${process.env.REDIRECT_URL}&state=${nonce}`;

  return res.send(authorize_uri);
});

const writeToFile = (data) => {
  const folderPath = './src/data';
  const filePath = path.join(folderPath, 'data.js');
  const fileContent = `export const data = {
    access_token: "${data.access_token}",
    scope: "${data.scope}",
  }`;

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.log('create-folder -> error', err);
      return;
    }

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.log('create-file -> error', err);
        return;
      }
    });
  });
};

app.get('/api/test', async (req, res) => {
  const { token } = req.query;

  const response = await axios.get(
    process.env.SHOP_DOMAIN + '/admin/api/2024-04/shop.json',
    {
      headers: {
        'X-Shopify-Access-Token': token,
      },
    }
  );

  return res.send(response.data);
});

app.get('/api/createSubscription', async (req, res) => {
  const access_token = process.env.ACCESS_TOKEN;

  const url = `${process.env.SHOP_DOMAIN}/admin/api/2024-04/graphql.json`;

  const callbackUrl =
    'https://9b60-58-186-196-139.ngrok-free.app/api/shopify/webhooks';

  const WEBHOOK_SUBCRIPTION_QUERY = `#graphql
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
          topic
          format
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
  }`;

  const topics = ['ORDERS_CREATE', 'ORDERS_UPDATED', 'CUSTOMERS_CREATE'];

  try {
    await ShopifyService.deleteWebhooks(
      process.env.SHOP_NAME,
      access_token,
      '2024-04'
    );

    for (let i = 0; i < topics.length; i++) {
      await axios
        .post(
          url,
          JSON.stringify({
            query: WEBHOOK_SUBCRIPTION_QUERY,
            variables: {
              topic: topics[i],
              webhookSubscription: {
                callbackUrl: callbackUrl,
                format: 'JSON',
              },
            },
          }),
          {
            headers: {
              'X-Shopify-Access-Token': access_token,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => res.data);
    }

    return res.send('Please check your console window.');
  } catch (error) {
    console.log('api.createSubscription -> error', error);
    return res.send(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server is up on http://localhost:${PORT}`);
});
