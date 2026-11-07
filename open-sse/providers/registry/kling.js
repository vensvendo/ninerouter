export default {
  id: "kling",
  priority: 250,
  hasFree: false,
  alias: "kling",
  aliases: ["kling-ai", "kuaishou-kling"],
  uiAlias: "kling",
  display: {
    name: "Kling AI Video",
    icon: "movie",
    color: "#7C3AED",
    textIcon: "KL",
    website: "https://kling.ai",
    notice: {
      apiKeyUrl: "https://kling.ai/document-api/api/get-started/authentication?tab=ak-sk",
    },
  },
  category: "apikey",
  authType: "apikey",
  authHint: "Format: AccessKey:SecretKey",
  transport: null,
  models: [
    { id: "kling-v1", name: "Kling 1.0 (Standard)", params: ["duration", "aspect_ratio", "mode"], kind: "video" },
    { id: "kling-v1-5", name: "Kling 1.5 (Pro)", params: ["duration", "aspect_ratio", "mode"], kind: "video" },
    { id: "kling-v2-master", name: "Kling 2.0 Master", params: ["duration", "aspect_ratio", "mode"], kind: "video" },
  ],
  serviceKinds: ["video"],
  videoConfig: { baseUrl: "https://api.klingai.com/v1/videos/text2video" },
};
