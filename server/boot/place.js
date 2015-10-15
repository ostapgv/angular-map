module.exports = function(app) {
  app.dataSources.mongo.automigrate('Place', function(err) {
    if (err) throw err;
 
    app.models.Place.create([
      {
        "name": "Kraków",
        "latitude": 50.06465009999999,
        "longitude": 19.94497990000002
      },
      {
        "name": "Kemerovo",
        "latitude": 55.3450231,
        "longitude": 86.06230440000002
      },
      {
        "name": "Saint Petersburg",
        "latitude": 59.9342802,
        "longitude": 30.335098600000038
      },
    ], function(err, place) {
      if (err) throw err;
 
      console.log('Models created: \n', place);
    });
  });
};