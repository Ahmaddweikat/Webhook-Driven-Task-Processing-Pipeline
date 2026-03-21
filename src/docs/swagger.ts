export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Pipeline Service API",
    version: "1.0.0",
    description: "Webhook-Driven Task Processing Pipeline",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Ali" },
                  email: { type: "string", example: "ali@test.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "ali@test.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string", example: "abc123..." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "New access token returned" },
          401: { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and invalidate tokens",
        responses: {
          200: { description: "Logged out successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/pipelines": {
      get: {
        tags: ["Pipelines"],
        summary: "Get all pipelines",
        responses: {
          200: { description: "List of pipelines" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Pipelines"],
        summary: "Create a pipeline (admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "name",
                  "actionType",
                  "actionConfig",
                  "subscriberUrls",
                ],
                properties: {
                  name: { type: "string", example: "Filter Orders" },
                  description: {
                    type: "string",
                    example: "Removes sensitive fields",
                  },
                  actionType: {
                    type: "string",
                    enum: [
                      "field_filter",
                      "field_rename",
                      "enrich",
                      "ai_summary",
                      "conditional_filter",
                      "template_transform",
                      "http_enrich",
                    ],
                  },
                  actionConfig: {
                    type: "object",
                    example: { remove: ["password"] },
                  },
                  subscriberUrls: {
                    type: "array",
                    items: { type: "string" },
                    example: ["https://webhook.site/your-url"],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Pipeline created" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/pipelines/{id}": {
      get: {
        tags: ["Pipelines"],
        summary: "Get one pipeline",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Pipeline found" },
          404: { description: "Pipeline not found" },
        },
      },
      put: {
        tags: ["Pipelines"],
        summary: "Update pipeline (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  actionType: { type: "string" },
                  actionConfig: { type: "object" },
                  status: { type: "string", enum: ["active", "inactive"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Pipeline updated" },
          403: { description: "Admin access required" },
          404: { description: "Pipeline not found" },
        },
      },
      delete: {
        tags: ["Pipelines"],
        summary: "Delete pipeline (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Pipeline deleted" },
          403: { description: "Admin access required" },
          404: { description: "Pipeline not found" },
        },
      },
    },
    "/pipelines/{id}/run": {
      post: {
        tags: ["Pipelines"],
        summary: "Trigger a pipeline run",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: {
                  order_id: "123",
                  amount: 99,
                  password: "secret",
                },
              },
            },
          },
        },
        responses: {
          202: { description: "Pipeline triggered successfully" },
          404: { description: "Pipeline not found" },
        },
      },
    },
    "/history": {
      get: {
        tags: ["History"],
        summary: "Get all runs for logged in user",
        responses: {
          200: { description: "List of pipeline runs" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/history/{id}": {
      get: {
        tags: ["History"],
        summary: "Get one run by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Run details" },
          403: { description: "Forbidden" },
          404: { description: "Run not found" },
        },
      },
    },
    "/history/{id}/deliveries": {
      get: {
        tags: ["History"],
        summary: "Get delivery attempts for a run",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "List of delivery attempts" },
          403: { description: "Forbidden" },
          404: { description: "Run not found" },
        },
      },
    },
  },
};
