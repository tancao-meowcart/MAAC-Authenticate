import crypto from 'crypto';

export const verifyWebhook = async (req, res, next) => {
  try {
    const message = req.rawBody;

    const hmacHeader = req.headers['x-shopify-hmac-sha256'] || '';

    if (hmacHeader === '') {
      throw new Error('Unauthorization');
    }

    const hash = crypto
      .createHmac('sha256', process.env.APP_SECRET)
      .update(message)
      .digest('base64');

    const match = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hmacHeader)
    );

    if (match) {
      return next();
    }

    throw new Error('Unauthorization');
  } catch (error) {
    console.log('verifyWebHook -> error', error);
    return res
      .status(401)
      .send(error instanceof Error ? error.message : 'Internal Server Error');
  }
};
