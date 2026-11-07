// Kling AI video jobs — https://kling.ai/dev/api-key & legacy https://kling.ai/document-api/api/get-started/authentication?tab=ak-sk
import crypto from "crypto";

const KLING_API_BASE = "https://api.klingai.com/v1/videos/text2video";

export function generateKlingJwt(accessKey, secretKey) {
  if (!accessKey || !secretKey) {
    throw new Error("Kling video requires both AccessKey and SecretKey (format: 'AccessKey:SecretKey')");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: accessKey,
    exp: now + 1800,
    nbf: now - 5,
  };

  const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsignedToken = `${b64url(header)}.${b64url(payload)}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

export function resolveCredentials(credentials) {
  const rawKey = String(credentials?.apiKey || credentials?.accessToken || "").trim();
  let accessKey = "";
  let secretKey = "";

  if (rawKey.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawKey);
      accessKey = parsed.accessKey || parsed.ak || parsed.access_key;
      secretKey = parsed.secretKey || parsed.sk || parsed.secret_key;
    } catch {}
  } else if (rawKey.includes(":")) {
    const parts = rawKey.split(":");
    accessKey = parts[0]?.trim();
    secretKey = parts[1]?.trim();
  }

  return { rawKey, accessKey, secretKey };
}

export function getKlingToken(credentialsOrKey) {
  const rawKey = typeof credentialsOrKey === "string"
    ? credentialsOrKey.trim()
    : String(credentialsOrKey?.apiKey || credentialsOrKey?.accessToken || "").trim();

  if (!rawKey) return "";

  const { accessKey, secretKey } = resolveCredentials({ apiKey: rawKey });
  if (accessKey && secretKey) {
    return generateKlingJwt(accessKey, secretKey);
  }
  return rawKey;
}

export default {
  buildRequest({ action, requestId, rawBody, contentType, credentials }) {
    const { rawKey, accessKey, secretKey } = resolveCredentials(credentials);
    if (!rawKey) {
      return {
        error: "Kling video authentication requires an API key in the API key field.",
      };
    }

    let token = rawKey;
    if (accessKey && secretKey) {
      try {
        token = generateKlingJwt(accessKey, secretKey);
      } catch (err) {
        return { error: `Failed to generate Kling JWT: ${err.message}` };
      }
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Polling GET
    if (requestId) {
      return {
        method: "GET",
        url: `${KLING_API_BASE}/${encodeURIComponent(requestId)}`,
        headers,
      };
    }

    if (action !== "generations") {
      return { error: `Kling video adapter supports 'generations' only (got '${action}')` };
    }

    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"));
      } catch {
        return { error: "Invalid JSON body for Kling video generation" };
      }
    }

    // Map OpenAI/standard video params to Kling API fields
    let modelName = body.model?.replace(/^kling\//, "") || "kling-v1-6";
    if (modelName === "kling-v1") {
      modelName = "kling-v1-6"; // Auto-migrate discontinued v1 to v1-6
    }

    const klingBody = {
      model_name: modelName,
      prompt: body.prompt || "",
      duration: String(body.duration || "5"),
      aspect_ratio: body.aspect_ratio || "16:9",
      mode: body.mode || (modelName === "kling-v1-5" ? "pro" : "std"),
    };

    if (body.negative_prompt) {
      klingBody.negative_prompt = body.negative_prompt;
    }
    if (body.image || body.image_url) {
      klingBody.image = typeof body.image === "string" ? body.image : (body.image?.url || body.image_url);
    }

    return {
      method: "POST",
      url: KLING_API_BASE,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(klingBody),
    };
  },

  async transformResponse(response) {
    if (!response.ok) {
      return response;
    }

    try {
      const data = await response.clone().json();

      // Creation response: { code: 0, message: "SUCCEED", data: { task_id: "..." } }
      if (data?.data?.task_id && !data?.data?.task_status) {
        const standardShape = {
          request_id: data.data.task_id,
          status: "pending",
        };
        return new Response(JSON.stringify(standardShape), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Polling query response
      if (data?.data?.task_status) {
        const status = data.data.task_status;
        let standardStatus = "processing";
        let videoUrl = null;

        if (status === "succeed") {
          standardStatus = "completed";
          videoUrl = data.data.task_result?.videos?.[0]?.url || null;
        } else if (status === "failed") {
          standardStatus = "failed";
        }

        const standardShape = {
          request_id: data.data.task_id,
          status: standardStatus,
          ...(videoUrl ? { video: { url: videoUrl } } : {}),
          ...(status === "failed" ? { error: data.data.task_status_msg || "Video generation failed" } : {}),
        };

        return new Response(JSON.stringify(standardShape), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // If parsing fails, pass through original response
    }

    return response;
  },
};
