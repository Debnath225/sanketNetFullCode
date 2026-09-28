import telemetryService from "../services/telemetry.service.js";

export const getTelemetry = async (req, res, next) => {
  try {
    const result = await telemetryService.getTelemetry(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ingestTelemetry = async (req, res, next) => {
  try {
    const result = await telemetryService.ingestTelemetry(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Telemetry received successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestTelemetry = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await telemetryService.getLatestTelemetry(nodeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNodeHistory = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await telemetryService.getNodeHistory(nodeId, req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNodeTelemetry = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await telemetryService.getNodeTelemetry(nodeId, req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// module.exports = {
//   getTelemetry,
//   ingestTelemetry,
//   getLatestTelemetry,
//   getNodeHistory,
//   getNodeTelemetry,
// };
