# MAAC-2: AUTHENTICATE (GET SHOP OBJECT)

This repo is used to complete data retrieval including access tokens and data when a shop accesses the app.

## Getting Started

First, run these line in the development server:

```bash
npm i
# Install node_modules

npm run dev
# Run the project in the local

```

In the browser, access [localhost:3000](http://localhost:3000/).

## Project Walkthrough

At first when you access the [localhost:3000](http://localhost:3000/), you will see a paragraph "Please enter shop name.".

In the address bar, add **"?shop={shopname}"** after the [localhost:3000](http://localhost:3000/).

```
Example:
http://localhost:3000?shop=yourshopname
```

It will respond you an url, then copy the url and paste it to the address bar, it will redirect you to install an app on Shopify App.

After that you will be redirect to the address [localhost:3000/api/callback/...v.v](), this will show you the data of the shop, and store the access token to your source code folder as data.json.

With the token that you have got before, you access [localhost:3000/api/test?token=your_access_token]()

```
Example:
http://localhost:3000/api/test/?access_token
```

It will show the shop detail.
