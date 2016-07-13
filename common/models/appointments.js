module.exports = function(BAppointments) {

  BAppointments.observe('after save', function(ctx, next) {
    if (ctx.instance) {
      console.log('Saved %s#%s', ctx.Model.modelName, ctx.instance);
      console.log(ctx.instance);
      var patientPerson =
        {
          "personId": 0,
          "isenable": 1,
          "title": "NA",
          "firstName": ctx.instance.firstName,
          "lastName": ctx.instance.lastName,
          "dob" : "1990-01-01",
          "gender": "NA",
          "mobile": ctx.instance.mobile,
          "email": ctx.instance.email,
          "occupation": "",
          "address": "",
          "suburbDistrict": "",
          "ward": "string",
          "postcode": "string",
          "stateProvince": "string",
          "country": "string",
          "ispatient": 1,
          "isdoctor": 0,
          "image": "string",
          "sourceId": ctx.instance.apptId
        };
      BAppointments.app.models.BPeople.create(patientPerson,function(err,data){
        console.log('data = ',data,'err = ',err);
        var patient = {
          "patientId": 0,
          "medicalCompanyId": ctx.instance.companyId,
          "personId": data.personId,
          "isenable": 1,
          "sourceId": ctx.instance.apptId
        };
        BAppointments.app.models.BPatients.create(patient,function(err,data){
          console.log('data = ',data,'err = ',err);
          var companyPatient = {
            "companyId": ctx.instance.companyId,
            "patientId": data.patientId,
            "isenable": 1
          };
          var patientAppointments = {
              "apptId": 0,
              "patientId": data.patientId,
              "calendarId": ctx.instance.calendarId,
              "requireDate": "2016-07-01",
              "description": ctx.instance.reason,
              "apptType": "string",
              "apptStatus": "Pending",
              "createdBy": 0,
              "creationDate": "2016-07-01",
              "lastUpdatedBy": 0,
              "lastUpdateDate": "2016-07-01",
              "apptDate": "2016-07-01",
              "bookingTypeId": ctx.instance.bookingTypeId,
              "clinicId": ctx.instance.clinicId,
              "doctorId": ctx.instance.doctorId,
              "rosterId": ctx.instance.rosterId,
              "personId": ctx.instance.personId,
              "sourceId": ctx.instance.apptId
          };

          BAppointments.app.models.BCompanyPatients.create(companyPatient,function(err,data){
            console.log('data = ',data,'err = ',err);
          });
          BAppointments.app.models.BPatientAppointments.create(patientAppointments,function(err,data){
            console.log('data = ',data,'err = ',err);
          });
        });
      });
    } else {
      console.log('Updated %s matching %j',
        ctx.Model.pluralModelName,
        ctx.where);
    }
    next();
  });

};
