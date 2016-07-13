
module.exports = function(BCalendars) {

    BCalendars.observe('loaded', function(ctx, next) {
      console.log('loaded = ',ctx);
      next();
    });  

    BCalendars.observe('access', function logQuery(ctx, next) {
  console.log('Accessing %s matching %s', ctx.Model.modelName, ctx.query.where);
  next();
});
 
Object.defineProperty(BCalendars.prototype, 'countryCode', {
  get: function() {
    //var name = this.countryName;
    var code = '001';// convert name to code
    return code;
  }
});

};
