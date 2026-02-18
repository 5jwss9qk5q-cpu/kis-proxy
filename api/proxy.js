export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { endpoint, method, headers, params, kisBody } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "endpoint missing", received: req.body });
    }

    const BASE = "https://openapi.koreainvestment.com:9443";
    let url = `${BASE}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      url += `?${query}`;
    }

    const fetchOptions = {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (kisBody) {
      fetchOptions.body = JSON.stringify(kisBody);
    }

    const kisRes = await fetch(url, fetchOptions);
    const text = await kisRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "KIS 응답 파싱 실패", raw: text.slice(0, 500) });
    }

    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ 
      error: e.message, 
      stack: e.stack?.slice(0, 300) 
    });
  }
}
