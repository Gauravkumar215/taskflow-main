import * as dashboardService from "./dashboard.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getDashboard = async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id);
  ApiResponse.ok(res, "Dashboard data retrieved", data);
};

export { getDashboard };
