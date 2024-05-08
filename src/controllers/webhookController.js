import fs from 'fs';
import path from 'path';

const writeToFile = (payload) => {
  const folderPath = './src/data';
  const filePath = path.join(folderPath, 'customer-data.json');

  const jsonData = JSON.stringify(payload, null, 2);

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.log('create-folder -> error', err);
      return;
    }

    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.log('create-file -> error', err);
        return;
      }
    });
  });
};

export const receive = async (req, res) => {
  const topic = req.headers['x-shopify-topic'];
  const payload = req.body;

  switch (topic) {
    case 'SHOP-REDACT':
      break;
    case 'CUSTOMER-REDACT':
      break;
    case 'orders/create':
      break;
    case 'orders/updated':
      break;
    case 'customers/create':
      writeToFile(payload);
      break;
    default:
      break;
  }

  return res.send('Hello World!');
};
