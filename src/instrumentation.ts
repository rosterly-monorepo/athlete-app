import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "athlete-app",
    attributes: {
      "deployment.environment": process.env.LOGFIRE_ENVIRONMENT ?? "dev",
    },
  });
}
