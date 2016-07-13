var moment = require('moment');

module.exports = function(BClinics) {

	    BClinics.observe('loaded', function(ctx, next) {
      //console.log('BClinics.loaded = ',ctx.instance);
      next();
    });  

    BClinics.filterClinic = function(pbookingTypeId,ptime,plong,plat, cb) {
        console.log('type =',pbookingTypeId);
        var ds = BClinics.dataSource;
        var sql = "select clinic_id from Clinic_Booking_Types where booking_type_id = ?";
        var params = [];
        var clinicIds = [];

        params[0] = pbookingTypeId;

        //get all clinic ids that have this booking type id
        ds.connector.query(sql, params, function (err, clinics) {
            if (err) console.error(err);
            for(var i in clinics){            	
            	clinicIds.push(clinics[i].clinic_id);
            }

            //after get clinicIDs, return all that clinics with their calendars
            //{relation:'Calendars',scope:{where: {fromTime: {between: [new Date('2016-06-16T08:00:00.000Z'),new Date('2016-06-17T08:00:00.000Z')]} }}}            
            var pfromDate,ptoDate;
            var pdate = moment(ptime,'DD/MM/YYYY');
            console.log(' ptime converse to date =',pdate._d);	
            if(pdate._d == 'Invalid Date'){
            	pfromDate = moment(moment().format('DD/MM/YYYY'),'DD/MM/YYYY');
            	ptoDate = moment().add(1,'d');
            }else{
            	pfromDate = pdate;
            	ptoDate = pdate;
            }

        	//console.log(' test1 =',moment('Today','DD/MM/YYYY')._d);	

        	//console.log(' test2 =',moment('01/06/2016','DD/MM/YYYY')._d);	

			//console.log(' pfromDate =',moment().add(3,'d').format('DD/MM/YYYY'),' = ',moment().format('DD/MM/YYYY'));            
	    	
	    	BClinics.find({
	    		where:{isenable:1,clinicId:{"inq": clinicIds}},
	    		include:[
	    					{relation:'BookingTypes'},
	    					{	
	    						relation:'Rosters',
	    						scope:{
	    								where: {calendarDate: {between: [pfromDate,ptoDate] } },
	    								order:'fromDate',
	    								include:{
	    											relation:'Calendars',
	    											scope:{}
	    										} 
	    						}
	    					}	    					
	    				]
	    			},function(err,data){

	    		cb(err, data);
	    	});            

        });

      //cb(null, 'Greetings... ' + pbookingTypeId + long + lat);
    }
     
    BClinics.remoteMethod(
        'filterClinic', 
        {
			accepts: [
							{arg: 'bookingTypeId', type: 'number'},
							{arg: 'time', type: 'string'},
							{arg: 'long', type: 'string'},
							{arg: 'lat', type: 'string'},
						],
			returns: {arg: 'clinics', type: 'object'}
        }
    );

};
