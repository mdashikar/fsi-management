module.exports = function (app) {
  const userRoutes = require('./user')
  const driverRoutes = require('./driver')
  const childRoutes = require('./child')
  const paRoutes = require('./passengerAssistant')
  const fileUploadRoutes = require('./fileUpload')
  app.use(userRoutes, driverRoutes, childRoutes, paRoutes, fileUploadRoutes);
};
