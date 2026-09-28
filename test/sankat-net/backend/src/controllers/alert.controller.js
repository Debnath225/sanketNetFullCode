import alertService from "../services/alert.service.js";

export const getAlerts = async (req, res, next) => {
  try {
    const result = await alertService.getAlerts(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveAlerts = async (req, res, next) => {
  try {
    const result = await alertService.getActiveAlerts(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlertHistory = async (req, res, next) => {
  try {
    const result = await alertService.getAlertHistory(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const result = await alertService.getAlert(alertId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const result = await alertService.acknowledgeAlert(
      alertId,
      req.user,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Alert acknowledged successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const result = await alertService.resolveAlert(
      alertId,
      req.user,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Alert resolved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// module.exports = {
//   getAlerts,
//   getActiveAlerts,
//   getAlertHistory,
//   getAlert,
//   acknowledgeAlert,
//   resolveAlert,
// };