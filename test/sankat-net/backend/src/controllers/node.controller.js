import nodeService from "../services/node.service.js";

const getNodes = async (req, res, next) => {
  try {
    const result = await nodeService.getNodes(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await nodeService.getNode(nodeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createNode = async (req, res, next) => {
  try {
    const result = await nodeService.createNode(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Node created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await nodeService.updateNode(
      nodeId,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Node updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await nodeService.deleteNode(nodeId, req.user);

    return res.status(200).json({
      success: true,
      message: "Node deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const enableNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await nodeService.enableNode(nodeId, req.user);

    return res.status(200).json({
      success: true,
      message: "Node enabled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const disableNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const result = await nodeService.disableNode(nodeId, req.user);

    return res.status(200).json({
      success: true,
      message: "Node disabled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNodes,
  getNode,
  createNode,
  updateNode,
  deleteNode,
  enableNode,
  disableNode,
};