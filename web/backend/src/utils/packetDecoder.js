import crypto from "crypto";
import logger from "./logger.js";

const PACKET_VERSION = 1;

const AES_KEY_LENGTH = 32;
const GCM_NONCE_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

const FIXED_HEADER_LENGTH = 13;

const getEncryptionKey = () => {
  const keyHex = process.env.PACKET_ENCRYPTION_KEY_HEX;

  if (!keyHex) {
    throw new Error("PACKET_ENCRYPTION_KEY_HEX is not configured");
  }

  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error(
      "PACKET_ENCRYPTION_KEY_HEX must contain exactly 64 hexadecimal characters",
    );
  }

  return Buffer.from(keyHex, "hex");
};

const ensureBuffer = (payload) => {
  if (Buffer.isBuffer(payload)) {
    return payload;
  }

  if (payload instanceof Uint8Array) {
    return Buffer.from(payload);
  }

  if (typeof payload === "string") {
    return Buffer.from(payload, "base64");
  }

  throw new Error("Unsupported packet payload type");
};

export const decodePacket = (payload) => {
  const packet = ensureBuffer(payload);

  if (packet.length < FIXED_HEADER_LENGTH) {
    throw new Error("Packet is too short");
  }

  let offset = 0;

  const version = packet.readUInt8(offset);
  offset += 1;

  if (version !== PACKET_VERSION) {
    throw new Error(`Unsupported packet version: ${version}`);
  }

  const flags = packet.readUInt8(offset);
  offset += 1;

  const headerLength = packet.readUInt16BE(offset);
  offset += 2;

  const timestamp = packet.readUInt32BE(offset);
  offset += 4;

  const sequence = packet.readUInt32BE(offset);
  offset += 4;

  const nodeIdLength = packet.readUInt8(offset);
  offset += 1;

  if (nodeIdLength < 2 || nodeIdLength > 64) {
    throw new Error("Invalid node ID length");
  }

  if (headerLength !== FIXED_HEADER_LENGTH + nodeIdLength) {
    throw new Error("Invalid packet header length");
  }

  if (packet.length < headerLength) {
    throw new Error("Incomplete packet header");
  }

  const nodeId = packet
    .subarray(offset, offset + nodeIdLength)
    .toString("utf8");

  offset += nodeIdLength;

  if (!/^[A-Za-z0-9_-]{2,64}$/.test(nodeId)) {
    throw new Error("Invalid node ID");
  }

  const remainingLength = packet.length - offset;

  if (remainingLength < GCM_NONCE_LENGTH + GCM_TAG_LENGTH + 1) {
    throw new Error("Packet encryption section is incomplete");
  }

  const nonce = packet.subarray(offset, offset + GCM_NONCE_LENGTH);

  offset += GCM_NONCE_LENGTH;

  const ciphertextEnd = packet.length - GCM_TAG_LENGTH;

  const ciphertext = packet.subarray(offset, ciphertextEnd);

  const authTag = packet.subarray(ciphertextEnd);

  if (ciphertext.length === 0) {
    throw new Error("Encrypted payload is empty");
  }

  const key = getEncryptionKey();

  /*
   * Authenticate the packet header as AES-GCM AAD.
   * The ciphertext itself is not modified.
   */
  const aad = packet.subarray(0, headerLength);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);

  decipher.setAAD(aad);
  decipher.setAuthTag(authTag);

  let plaintext;

  try {
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    logger.security("Packet authentication/decryption failed", {
      nodeId,
      sequence,
      reason: error.message,
    });

    throw new Error("Packet authentication failed");
  }

  return {
    version,
    flags,
    timestamp: new Date(timestamp * 1000),
    sequence,
    nodeId,
    plaintext,
  };
};

export const decodeTelemetryPayload = (plaintext) => {
  if (!Buffer.isBuffer(plaintext)) {
    throw new Error("Telemetry payload must be a Buffer");
  }

  /*
   * Initial telemetry payload format:
   *
   * Byte 0      Payload version
   * Byte 1      Field count
   *
   * Each field:
   * Byte        Field ID
   * Byte        Data type
   * 4 bytes     IEEE-754 float
   *
   * This keeps the packet compact while allowing
   * additional sensors to be added later.
   */

  if (plaintext.length < 2) {
    throw new Error("Telemetry payload is too short");
  }

  const payloadVersion = plaintext.readUInt8(0);
  const fieldCount = plaintext.readUInt8(1);

  if (payloadVersion !== 1) {
    throw new Error(`Unsupported telemetry payload version: ${payloadVersion}`);
  }

  const FIELD_MAP = {
    1: "temperature_c",
    2: "humidity_pct",
    3: "pressure_hpa",
    4: "gas_voltage",
    5: "water_level_pct",
    6: "soil_sat",
    7: "soil_temp_c",
    8: "rainfall_mm",
    9: "wind_speed",
    10: "wind_direction",
    11: "mq2",
    12: "mq135",
    13: "turbidity",
    14: "ph",
    15: "tds",
    16: "accel_x",
    17: "accel_y",
    18: "accel_z",
    19: "battery_pct",
    20: "battery_volts",
    21: "latitude",
    22: "longitude",
    23: "elevation",
    24: "slope",
    25: "vegetation",
  };

  const DATA_TYPE_FLOAT32 = 1;
  const FIELD_SIZE = 6;

  const expectedLength = 2 + fieldCount * FIELD_SIZE;

  if (plaintext.length !== expectedLength) {
    throw new Error("Telemetry payload length does not match field count");
  }

  const telemetry = {};

  let offset = 2;

  for (let index = 0; index < fieldCount; index += 1) {
    const fieldId = plaintext.readUInt8(offset);
    offset += 1;

    const dataType = plaintext.readUInt8(offset);
    offset += 1;

    if (dataType !== DATA_TYPE_FLOAT32) {
      throw new Error(`Unsupported telemetry data type: ${dataType}`);
    }

    const value = plaintext.readFloatBE(offset);
    offset += 4;

    const fieldName = FIELD_MAP[fieldId];

    if (!fieldName) {
      throw new Error(`Unknown telemetry field ID: ${fieldId}`);
    }

    if (!Number.isFinite(value)) {
      throw new Error(`Invalid value for telemetry field: ${fieldName}`);
    }

    telemetry[fieldName] = value;
  }

  return telemetry;
};

export const decodeEncryptedTelemetryPacket = (payload) => {
  const decodedPacket = decodePacket(payload);

  const telemetry = decodeTelemetryPayload(decodedPacket.plaintext);

  return {
    nodeId: decodedPacket.nodeId,
    timestamp: decodedPacket.timestamp,
    sequence: decodedPacket.sequence,
    flags: decodedPacket.flags,
    telemetry,
  };
};

export default {
  decodePacket,
  decodeTelemetryPayload,
  decodeEncryptedTelemetryPacket,
};
