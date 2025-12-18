/**
 * 環境変数の検証
 */
export function validateEnvironmentVariables(): void {
  const required: string[] = ["JWT_SECRET"];

  if (process.env.NODE_ENV === "production") {
    required.push("GCS_BUCKET_NAME");
  }

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

