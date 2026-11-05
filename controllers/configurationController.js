import httpStatusCodes from "http-status-codes";
import Configuration from "../models/configuration.js";
import TrackImage from "../models/trackImage.js";
import GeoFence from "../models/geoFence.js";
import { ApiError } from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";

// KAN-20: Configuration Management APIs.
// Every query is scoped to the authenticated user (req.user.id), so a user can only
// create, read, update or delete their own configurations.

// POST /configurations
const addNewConfiguration = async (req, res, next) => {
  try {
    const { trackId, configurationName, direction, polygons } = req.body;
    if (!trackId || !configurationName || !direction) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "All Fields are required");
    }
    const track = await TrackImage.findByPk(trackId);
    if (!track) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Track Not Found");
    }
    const configuration = await Configuration.create({
      userId: req.user.id,
      trackId,
      configurationName,
      direction,
      polygons: polygons ?? null,
    });
    return res
      .status(httpStatusCodes.OK)
      .json(ApiResponse.result(httpStatusCodes.OK, { status: "Config Added successfully", configurationId: configuration.id }));
  } catch (error) {
    next(error);
  }
};

// GET /configurations
const getAllConfigurations = async (req, res, next) => {
  try {
    const configurations = await Configuration.findAll({
      where: { userId: req.user.id },
      include: [
        { model: TrackImage, as: "track" },
        { model: GeoFence, as: "geoFences" },
      ],
    });
    if (!configurations.length) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Configuration Not Found");
    }
    return res.status(httpStatusCodes.OK).json(ApiResponse.result(httpStatusCodes.OK, configurations));
  } catch (error) {
    next(error);
  }
};

// GET /configurations/:configurationId
const getSingleConfiguration = async (req, res, next) => {
  try {
    const { configurationId } = req.params;
    const configuration = await Configuration.findOne({
      where: { id: configurationId, userId: req.user.id },
      include: [{ model: TrackImage, as: "track" }],
    });
    if (!configuration) {
      // also returned for another user's configuration, so its existence is not revealed
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Configuration Not Found");
    }
    return res.status(httpStatusCodes.OK).json(ApiResponse.result(httpStatusCodes.OK, configuration));
  } catch (error) {
    next(error);
  }
};

// PUT/PATCH /configurations/:configurationId
const updateConfiguration = async (req, res, next) => {
  try {
    const { configurationId } = req.params;
    const { configurationName, polygons, direction } = req.body;
    // only fields that were sent are updated, so a partial update does not erase data
    const payload = {};
    if (configurationName !== undefined) payload.configurationName = configurationName;
    if (polygons !== undefined) payload.polygons = polygons;
    if (direction !== undefined) payload.direction = direction;

    const [updatedRows] = await Configuration.update(payload, {
      where: { id: configurationId, userId: req.user.id },
    });
    if (updatedRows === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Configuration Not Found");
    }
    return res
      .status(httpStatusCodes.OK)
      .json(ApiResponse.result(httpStatusCodes.OK, { status: "Configuration updated successfully" }));
  } catch (error) {
    next(error);
  }
};

// DELETE /configurations/:configurationId
const deleteConfiguration = async (req, res, next) => {
  try {
    const { configurationId } = req.params;
    const deletedRows = await Configuration.destroy({
      where: { id: configurationId, userId: req.user.id },
    });
    if (deletedRows === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Configuration Not Found");
    }
    return res
      .status(httpStatusCodes.OK)
      .json(ApiResponse.result(httpStatusCodes.OK, { status: "Configuration deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

export {
  addNewConfiguration,
  getAllConfigurations,
  getSingleConfiguration,
  updateConfiguration,
  deleteConfiguration,
};
