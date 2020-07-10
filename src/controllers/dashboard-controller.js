'use strict';

import DashboardService from '../services/dashboard-service';

const getActiveRequestsHelpseeker = async (req, res) => {
  DashboardService.getActiveRequests(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

const getFinishedRequestsHelpseeker = async (req, res) => {
  DashboardService.getFinishedRequests(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

module.exports = {
  getActiveRequestsHelpseeker,
  getFinishedRequestsHelpseeker,
};
