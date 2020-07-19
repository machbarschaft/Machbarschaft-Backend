import DashboardService from '../services/dashboard-service';
import APIError from '../errors';

const getActiveRequests = async (req, res) => {
  DashboardService.getActiveRequests(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const getFinishedRequests = async (req, res) => {
  DashboardService.getFinishedRequests(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  getActiveRequests,
  getFinishedRequests,
};
