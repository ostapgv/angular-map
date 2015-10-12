module.exports = function(app) {
  app.dataSources.mongo.automigrate('AngularMapData', function(err) {
    if (err) throw err;
 
    app.models.AngularMapData.create([
      {
        "name": "point 1",
        "latitude": 50,
        "longitude": 5
      },
      {
        "name": "point 2",
        "latitude": 20,
        "longitude": 6
      },
      {
        "name": "point 3",
        "latitude": 12,
        "longitude": 34
      },
    ], function(err, angularMapData) {
      if (err) throw err;
 
      console.log('Models created: \n', angularMapData);
    });
  });
};