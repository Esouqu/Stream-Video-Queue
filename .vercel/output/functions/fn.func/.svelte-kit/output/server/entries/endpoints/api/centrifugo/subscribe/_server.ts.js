import { D as DONATIONALERTS_SESSION } from "../../../../../chunks/private.js";
const POST = async ({ request, cookies }) => {
  const session = cookies.get(DONATIONALERTS_SESSION);
  const body = await request.json();
  if (!session) return new Response("No donation alerts session available", { status: 401 });
  const url = "https://www.donationalerts.com/api/v1/centrifuge/subscribe";
  const data = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then((res) => res.json()).then((data2) => data2.channels[0].token);
  return new Response(JSON.stringify(data), { status: 200 });
};
export {
  POST
};
