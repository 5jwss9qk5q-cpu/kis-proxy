export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    let raw = "";
    await new Promise((resolve, reject) => {
      req.on("data", c => raw += c);
      req.on("end", resolve);
      req.on("error", reject);
    });
    const { endpoint, method, headers, params, kisBody } = JSON.parse(raw);
    let url = "https://openapi.koreainvestment.com:9443" + endpoint;
    if (params) {
      url += "?" + Object.entries(params).map(([k,v]) => encodeURIComponent(k)+"="+encodeURIComponent(v)).join("&");
    }
    const r = await fetch(url, {
      method: method||"GET",
      headers: {"Content-Type":"application/json",...headers},
      body: kisBody ? JSON.stringify(kisBody) : undefined
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
