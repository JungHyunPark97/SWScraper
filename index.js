

/* const osmosis = require('osmosis');

osmosis
	.get('www.southwest.com')
	//.data('console.log')
	//destinationAirport
	//originAirport
//line 939
//name = 'homepage-booking-form-air'
	.submit('homepage-booking-form-air', {
		'originAirport' : 'LAX', 
		'destinationAirport' : 'SJC',
		'outboundDateString' : '10/25/2017',	//dates stored in DMY form
		'returnDateString' : '10/31/2017',
		'adultPassengerCount' : '1',
		'seniorPassengerCount' : '0'
	}
	)
	//.data('console.log')
	
	.find('#faresOutbound .product_price')
	.then((Parsing) => {
		const ticket = Parsing.toString().match(/\$.*(\d+)/)
		const price = parseInt(ticket[1])
		console.log(price)
	})
	console.log('anything')	
	
*/


"use strict"

const osmosis = require("osmosis")
const mailer = require("nodemailer")

var sendOrNot = false;

var time_hour = 1000 * 60 * 60; // starts at ms, so 1000 ms = 1 s, then 60 s, then 60 mins = 1 hr total

// nodemailer section
var transport = mailer.createTransport({
	service: 'gmail',
	auth: { 
		user: 'southwestscraper@gmail.com', 
		pass: 'nononosenor'
	}
});

var details = {
	from: 'southwestscraper@gmail.com',
	to: 'parkjunghyun8@gmail.com',
	subject: 'Ticket price', 
	text: 'Check for lowered prices'
	
};

const fares = {
  outbound: [],
  inbound: []
}

const fetch = () => {
  osmosis
    .get("https://www.southwest.com")
    .submit(".booking_form", {
      twoWayTrip: true,
      returnAirport: "RoundTrip",
      outboundTimeOfDay: "ANYTIME",
      returnTimeOfDay: "ANYTIME",
      seniorPassengerCount: 0,
      fareType: "DOLLARS",
      originAirport: 'LAX',
      destinationAirport: 'SJC' ,
      outboundDateString: '10/25/2017', 
      returnDateString: '10/31/2017',
      adultPassengerCount: 1,
    })
    .find("#faresOutbound .product_price")  // locate the outbound prices
    .then((parsing) => {
      const matches = parsing.toString().match(/\$.*?(\d+)/)  // extract the price
      const price = parseInt(matches[1])
	  //console.log(price)
      fares.outbound.push(price)  // add the price to the outbound price array
    })
    .find("#faresReturn .product_price")
    .then((parsing) => {
      const matches = parsing.toString().match(/\$.*?(\d+)/)
      const price = parseInt(matches[1])
      fares.inbound.push(price)
    })
    .done(() => {   // 
      const lowestOutboundFare = Math.min(...fares.outbound)  // find the min prices in each array
      const lowestInboundFare = Math.min(...fares.inbound)
	  
	  if (lowestOutboundFare < 50 || lowestInboundFare < 50)	{
		  // send mail if prices for either are under 50
		  transport.sendMail(details, function (error, info)	{
			if (error)	{
				console.log(error);
			}
			else	{
				console.log("Sent - " + info.response);
			}
		});
	  }
		// do for every hour
	  	setTimeout(fetch, time_hour); 
    })
}

// execute
fetch();





