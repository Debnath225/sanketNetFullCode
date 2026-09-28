import dashboardService from "../services/dashboard.service.js";

export const getSummary = async (req, res, next) => {
  try {
    const result = await dashboardService.getSummary();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatest = async (req, res, next) => {
  try {
    const result = await dashboardService.getLatest();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const result = await dashboardService.getActivity(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHazards = async (req, res, next) => {
  try {
    const result = await dashboardService.getHazards(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

