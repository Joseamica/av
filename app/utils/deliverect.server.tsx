import fetch from 'node-fetch'

function getDomainUrl(host) {
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export const getDeliverect = async (request: Request) => {
  // if (!process.env.GRAPHQL_API) {
  //   throw new Error("GRAPHQL_API is required");
  // }

  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  }
  const url = 'localhost:3000/api/deliverect-web-hook'
  console.log('url', url)

  // const body: any = { query };

  // if (variables) body.variables = variables;

  return fetch(url, options)
}
