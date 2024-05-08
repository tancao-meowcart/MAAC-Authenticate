# MAAC-ACADEMY: 

This repo is used to complete training program (homework). This repo gets updated after working on a session.
- MAAC-1: Get shop's access token and shop data.
- MAAC-2: Research about webhooks. The requirements are pick a topic, and get the data of that topic then save it to somewhere (database, source code, etc).

## Installation

1. Clone the repository:

    ```
    git clone https://github.com/tancao-meowcart/MAAC-Authenticate.git
    ```
2. Navigate to the project directory:
    ```
    cd MAAC-Authenticate
    ```
3. Install the dependencies:
    ```
    npm install
    ```

## Usage
1. Start the server:
    ```
    npm run dev
    ```
2. Open the browser and navigate to `http://localhost:3000`.


## Project Walkthrough

### 1. Get Shop Token:

At first when you access the `http://localhost:3000`, you will see a paragraph "Please enter shop name.".

In the address bar, add **"?shop={shopname}"** after the `http://localhost:3000`.
```
    Example:
    http://localhost:3000?shop=yourshopname
```

It will respond you an url, then copy the url and paste it to the address bar, it will redirect you to install an app on Shopify App.

After that you will be redirect to the address `localhost:3000/api/callback/...v.v`, this will show you the data of the shop, and store the access token to your source code folder in `src/data/data.js`.

With the token that you have got before, you access `localhost:3000/api/test?token=your_access_token`

```
    Example:
    http://localhost:3000/api/test/?access_token
```

It will show the shop detail.

### 2. Get Webhooks 'customers/create' payload and store data:
Access `http://localhost:3000/api/createSubscription` to generate webhooks subscription.
In Shopify Admin, when you create a new customer, it will send a webhook and you will see `customer-data.json` in `src/data/customer-data.json`. This file store customer's data that you have just create.


