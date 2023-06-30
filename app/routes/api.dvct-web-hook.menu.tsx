import {json, redirect} from '@remix-run/node'
import fetch from 'node-fetch'

export const action = async ({request}: ActionArgs) => {
  //   throw new Error("GRAPHQL_API is required");
  // }
  const rawData = await request.text()
  console.log('rawData', rawData)
  // const body: any = { query };

  // if (variables) body.variables = variables;
  return json({success: true})
}

// export default function apI() {
//   return <div>api</div>
// }
