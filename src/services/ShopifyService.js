import axios from 'axios';
import meowlog from '@meowapp/meowlog';

export default class ShopifyService {
  static async deleteWebhooks(
    shopifyDomain,
    accessToken,
    apiVersion = '2024-04'
  ) {
    const apiUrl = this.createGraphQLURL(shopifyDomain, apiVersion);

    const WEBHOOOKS_GET_QUERY = `#graphql
      query {
        webhookSubscriptions(first: 10) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
                ... on WebhookEventBridgeEndpoint {
                  arn
                }
                ... on WebhookPubSubEndpoint {
                  pubSubProject
                  pubSubTopic
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios
      .post(
        apiUrl,
        JSON.stringify({
          query: WEBHOOOKS_GET_QUERY,
        }),
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => res.data);

    const isHasData = response?.data?.webhookSubscriptions?.edges.length > 0;

    if (!isHasData) {
      return true;
    }

    for (const node of response.data.webhookSubscriptions.edges) {
      console.log('DELETE_WEBHOOK: ', node.node.id, node.node.topic);
      await this.deleteWebhook(
        shopifyDomain,
        accessToken,
        apiVersion,
        node.node.id
      );
    }

    meowlog('response', response);
    return false;
  }

  static deleteWebhook(
    shopifyDomain,
    accessToken,
    apiVersion = '2024-04',
    webhookId
  ) {
    // console.log(shopifyDomain, accessToken, apiVersion, webhookId);
    const apiUrl = this.createGraphQLURL(shopifyDomain, apiVersion);
    const WEBHOOK_DELETE_QUERY = `#graphql
      mutation webhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
          userErrors {
            field
            message
          }
          deletedWebhookSubscriptionId
        }
      }
    `;

    const variables = {
      id: webhookId,
    };

    return axios
      .post(
        apiUrl,
        JSON.stringify({
          query: WEBHOOK_DELETE_QUERY,
          variables,
        }),
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => res.data);
  }

  static createGraphQLURL(shopifyDomain, apiVersion) {
    return `https://${shopifyDomain}/admin/api/${apiVersion}/graphql.json`;
  }
}
