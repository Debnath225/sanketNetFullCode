import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});

// ─── Nodes ──────────────────────────────────────────────────────────────────

const nodeRoleEnum = z.enum([
  "fire_pollution",
  "flood_soil",
  "seismic_environment",
  "water_quality",
  "gateway",
  "generic",
]);

export const createNodeSchema = z.object({
  nodeId: z
    .string({ required_error: "nodeId is required" })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,32}$/, "nodeId must be 2-32 uppercase letters, numbers, _ or -"),

  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  role: nodeRoleEnum.optional().default("generic"),

  latitude: z
    .number({ required_error: "Latitude is required" })
    .min(-90, "Latitude must be ≥ -90")
    .max(90, "Latitude must be ≤ 90"),

  longitude: z
    .number({ required_error: "Longitude is required" })
    .min(-180, "Longitude must be ≥ -180")
    .max(180, "Longitude must be ≤ 180"),

  txInterval: z
    .number()
    .int()
    .min(1, "TX interval must be at least 1 second")
    .max(3600, "TX interval must be at most 3600 seconds")
    .optional()
    .default(60),
});

export const updateNodeSchema = createNodeSchema.partial().omit({ nodeId: true });

// ─── Telemetry ───────────────────────────────────────────────────────────────

export const ingestTelemetrySchema = z.object({
  nodeId: z
    .string({ required_error: "nodeId is required" })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,32}$/, "Invalid nodeId format"),

  temperature_c: z.number().finite().optional().nullable(),
  humidity_pct: z.number().min(0).max(100).optional().nullable(),
  pressure_hpa: z.number().min(800).max(1100).optional().nullable(),
  water_level_pct: z.number().min(0).max(100).optional().nullable(),
  gas_voltage: z.number().min(0).max(5).optional().nullable(),
  mq2: z.number().min(0).optional().nullable(),
  mq135: z.number().min(0).optional().nullable(),
  accel_x: z.number().finite().optional().nullable(),
  accel_y: z.number().finite().optional().nullable(),
  accel_z: z.number().finite().optional().nullable(),
  battery_pct: z.number().min(0).max(100).optional().nullable(),
  battery_volts: z.number().min(0).max(5).optional().nullable(),
  soil_sat: z.number().min(0).max(1).optional().nullable(),
  rainfall_mm: z.number().min(0).optional().nullable(),
  slope: z.number().min(0).max(90).optional().nullable(),
  vegetation: z.number().min(0).max(1).optional().nullable(),
  elevation: z.number().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  timestamp: z.string().datetime({ offset: true }).optional(),
}).passthrough(); // allow extra fields from ESP32

// ─── Alerts ──────────────────────────────────────────────────────────────────

export const updateAlertSchema = z.object({
  state: z.enum(["ACTIVE", "ACKNOWLEDGED", "RESOLVED"]),
  note: z.string().trim().max(500).optional(),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
  nodeId: z.string().trim().toUpperCase().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates `req.body` (or `req.query`)
 * against the given Zod schema. Sends 400 on failure.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {"body"|"query"|"params"} source
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      });
    }
    req[source] = result.data; // replace with coerced/transformed data
    return next();
  };
}
