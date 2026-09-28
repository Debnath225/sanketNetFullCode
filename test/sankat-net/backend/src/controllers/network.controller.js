import networkService from "../services/network.service.js";

export const getNetworkStatus = async (req, res, next) => {
  try {
    const result = await networkService.getNetworkStatus();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNetworkNodes = async (req, res, next) => {
  try {
    const result = await networkService.getNetworkNodes(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNetworkLinks = async (req, res, next) => {
  try {
    const result = await networkService.getNetworkLinks(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNetworkRoutes = async (req, res, next) => {
  try {
    const result = await networkService.getNetworkRoutes(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNetworkEvents = async (req, res, next) => {
  try {
    const result = await networkService.getNetworkEvents(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// module.exports = {
//   getNetworkStatus,
//   getNetworkNodes,
//   getNetworkLinks,
//   getNetworkRoutes,
//   getNetworkEvents,
// };
