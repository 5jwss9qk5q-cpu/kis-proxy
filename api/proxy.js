export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { endpoint, method, headers, params, kisBody } = req.body;

    let url = `https://openapi.koreainvestment.com:9443${endpoint}`;
    if (params) {
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      url += `?${query}`;
    }

    const kisRes = await fetch(url, {
      method: method || "GET",
      headers: { "Content-Type": "application/json", ...headers },
      body: kisBody ? JSON.stringify(kisBody) : undefined,
    });

    const data = await kisRes.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
