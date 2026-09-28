const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, meta = null) => {
  const timestamp = getTimestamp();

  let output = `[${timestamp}] [${level}] ${message}`;

  if (meta !== null && meta !== undefined) {
    if (typeof meta === "string") {
      output += ` | ${meta}`;
    } else {
      try {
        output += ` | ${JSON.stringify(meta)}`;
      } catch {
        output += " | [unserializable metadata]";
      }
    }
  }

  return output;
};

const logger = {
  info(message, meta = null) {
    console.log(formatMessage("INFO", message, meta));
  },

  warn(message, meta = null) {
    console.warn(formatMessage("WARN", message, meta));
  },

  error(message, meta = null) {
    console.error(formatMessage("ERROR", message, meta));
  },

  debug(message, meta = null) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  mqtt(message, meta = null) {
    console.log(formatMessage("MQTT", message, meta));
  },

  security(message, meta = null) {
    console.warn(formatMessage("SECURITY", message, meta));
  },

  network(message, meta = null) {
    console.log(formatMessage("NETWORK", message, meta));
  },
};

export default logger;