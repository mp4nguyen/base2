var moment = require('moment');
var _ = require('underscore');

module.exports = function(CRosters) {

    CRosters.generateRoster = function(def, cb) {
    	/*
    	"def":{
    			"doctorId":1,
    			"workingSiteId": 1,
    			"bookingTypeId": 2,
    			"timeInterval": 15,
    			"fromTime": "09:00",
    			"toTime": "16:00",
    			"fromDate":"2016-05-20",
    			"toDate":"2016-10-20",
    			"repeatType":"DAILY",
    			}
    	repeatType = [DAILY,WEEKLY,MONTHLY,2WEEKLY,3WEEKLY,5WEEKLY,6WEEKLY,7WEEKLY,8WEEKLY,]
    	*/
    	console.log('para = ',def);
    	var repeatType = def.repeatType;
    	var fromDate = moment(def.fromDate);
    	var toDate = moment(def.toDate);
    	var pFromDate = moment(def.fromDate);
    	var pToDate = moment(def.toDate);
    	var fromTime = def.fromTime;
    	var toTime = def.toTime;
    	var rosterDate = fromDate;
    	var rosters = [];
        var rosterErrors = [];

		//{where:{siteId:siteID,fromTime:{between:[(new Date(fromDate)),(new Date(toDate))]}}, order:'fromTime'}
		
		pToDate.add(1,'d');

		//console.log(' fromDate =',pFromDate,' toDate = ',pToDate);

    	CRosters.find({where:{doctorId:def.doctorId,fromDate:{between:[pFromDate,pToDate]}}},function(err,data){
    		console.log('query all roster of doctor = ',err,data);

            while(rosterDate.isSameOrBefore(toDate)){

                var roster = {
                                rosterId: 0,
                                repeatType : def.repeatType,
                                doctorId : def.doctorId,
                                workingSiteId : def.workingSiteId,
                                bookingTypeId : def.bookingTypeId,
                                timeInterval : def.timeInterval         
                            };
                
                //console.log('doing something... at ',rosterDate.format('dd DD/MM/YYYY'),' repeatType = ',repeatType,def.repeatType);
                
                roster.fromDate = rosterDate.format('YYYY-MM-DD') + ' ' + fromTime;     
                roster.toDate = rosterDate.format('YYYY-MM-DD') + ' ' + toTime;
                roster.dayOfWeek = rosterDate.format('dd');

                var willGenFromTime = moment(roster.fromDate,'YYYY-MM-DD HH:mm');
                var willGenToTime = moment(roster.toDate,'YYYY-MM-DD HH:mm');

                var indexOfRoster = _.find(data,function(oneRoster){
                    if(oneRoster){
                        var apptFromTime = moment(oneRoster.fromDate).add(oneRoster.fromDate.getTimezoneOffset(),"m");
                        var apptFromTime2 = apptFromTime.format("DD/MM/YYYY HH:mm");   
                        var apptToTime = moment(oneRoster.toDate).add(oneRoster.toDate.getTimezoneOffset(),"m");
                        var apptToTime2 = apptFromTime.format("DD/MM/YYYY HH:mm");                           
                        console.log(' apptTime = ',apptFromTime2, '  - ', apptToTime2, '  with ',roster.fromDate,' ',roster.toDate );
                        if((apptFromTime.isSameOrBefore(willGenFromTime) && apptToTime.isSameOrAfter(willGenFromTime))||
                            (apptFromTime.isSameOrBefore(willGenToTime) && apptToTime.isSameOrAfter(willGenToTime))){
                            return true;
                        }
                    }
                });

                console.log('indexOfRoster = ',indexOfRoster);

                if(indexOfRoster === undefined || indexOfRoster === null){
                    console.log('will add roster into the array:',roster);
                    rosters.push(roster);    
                }else{
                    rosterErrors.push(indexOfRoster);                    
                }    
                

                if(repeatType == 'DAILY'){
                    rosterDate.add(1,'d');
                }else if(repeatType == 'WEEKLY'){
                    rosterDate.add(1,'w');
                }else if(repeatType == 'MONTHLY'){
                    rosterDate.add(1,'M');
                }else if(repeatType == '2WEEKLY'){
                    rosterDate.add(2,'w');
                }else if(repeatType == '3WEEKLY'){
                    rosterDate.add(3,'w');
                }else if(repeatType == '4WEEKLY'){
                    rosterDate.add(3,'w');
                }else if(repeatType == '5WEEKLY'){
                    rosterDate.add(5,'w');
                }else if(repeatType == '6WEEKLY'){
                    rosterDate.add(6,'w');
                }else if(repeatType == '7WEEKLY'){
                    rosterDate.add(7,'w');
                }else if(repeatType == '8WEEKLY'){
                    rosterDate.add(8,'w');
                }else{
                    break;
                }
            }

            //console.log(rosters);
            if(rosterErrors.length == 0){
                CRosters.create(rosters,function(err,data){
                    console.log('after inserted roster',err,data);
                    cb(err,data);
                });                                         
            }else{
                cb(rosterErrors,null);
            }


    	});
      			
    }
     
    CRosters.remoteMethod(
        'generateRoster', 
        {
          accepts: [{arg: 'def', type: 'object', http: {source: 'body'}}],
          returns: {arg: 'rosters', type: 'array'},
          http: {path: '/generateRoster', verb: 'post'}
        }
    );    
};
