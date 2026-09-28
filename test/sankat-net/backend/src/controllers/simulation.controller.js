import simulationService from "../services/simulation.service.js";

export const getSimulationStatus = async (req, res, next) => {
  try {
    const result = await simulationService.getSimulationStatus();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const startSimulation = async (req, res, next) => {
  try {
    const result = await simulationService.startSimulation(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Simulation started successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const stopSimulation = async (req, res, next) => {
  try {
    const result = await simulationService.stopSimulation(req.user);

    return res.status(200).json({
      success: true,
      message: "Simulation stopped successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createSimulationEvent = async (req, res, next) => {
  try {
    const result = await simulationService.createSimulationEvent(
      req.body,
      req.user,
    );

    return res.status(201).json({
      success: true,
      message: "Simulation event created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSimulationEvents = async (req, res, next) => {
  try {
    const result = await simulationService.getSimulationEvents(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// module.exports = {
//   getSimulationStatus,
//   startSimulation,
//   stopSimulation,
//   createSimulationEvent,
//   getSimulationEvents,
// };
