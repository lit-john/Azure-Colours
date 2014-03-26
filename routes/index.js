/*
 * Require the ObjectId object from the mongodb package. I use it later to
 * create ObjectId objects.
 */

var ObjectId = require('mongodb').ObjectID;

/*
 * GET dashboard page.
 */

exports.index = function(req, res){
	var db = req.app.settings.db;

	/*
	 *	Get a list of the first 10 people from the cappPersons collection
	 *  and pass them to the index page.
	 */
	db.collection('cappPerson', function (err, personsCollection) {
		if (err) throw err;

		personsCollection.find().limit(10).toArray(function(err, resultsArray){
			if (err) {throw err};

			res.render('index', { personsArray: resultsArray });
		})
	});
};

/*
 * 	POST /addPerson
 *
 *	This is called when someone submits the form on the index page to add a new
 *	person to the database. The new person is stored on the cappPersons collection
 */
exports.addPerson = function(req, res){
	var db = req.app.settings.db;

	// Get the value of the person form input field
	var personsName = req.param('person');

	// If the input field is blank then just redirect the user back to /
	if(!personsName) {
		res.redirect('/');
	} else {

		/*
		 *	Insert a new document into the cappPersons collection. The document
		 *	has a field called name, the value of which is the value of the person
		 *	input field
		 */

		db.collection('cappPerson', function (err, personsCollection) {
			personsCollection.insert({name: personsName}, {w:1}, function (err, result) {
				if (err) throw err;

				/*
				 *	Now that we have added a new person redirect the user back to the
				 *	dashboard (/)
				 */
				res.redirect('/');
			});
		});
	}

};

/*
 * 	GET /personsColours
 *
 *	This gets called when sone clicks on the name of a person in the dashboard (/) page.
 *	The link contains an query parameter called id which is equal to the persons _id field.
 */
exports.personsColours = function(req, res) {
	var db = req.app.settings.db;

	// Get the "id" query parameter
	var personsID = req.param('id');

	if (!personsID) {
		res.render('/');
	} else {
		// Convert the "id" to an ObjectId
		var personsObjectID = new ObjectId(personsID);

		// Store the "id" up on the users session, this allows us to keep a "note" of
		// what person we are dealing with.
		req.session.personsOID = personsID;

		db.collection('cappColours', function (err, coloursCollection) {
			coloursCollection.find({person: personsObjectID}).limit(50).toArray(function (err, resultsArray){
				if (err) throw err;

				res.render('personsColours', {coloursArray: resultsArray});
			});
		});

		
	}
	
};

exports.addColour = function(req, res) {
	var db = req.app.settings.db;
	var colour = req.param('colour');

	// Get the persons ID that we stored on the users session (so we know what user we are
	// dealing with) and create an ObjectId object
	var personsObjectID = new ObjectId(req.session.personsOID);

	if (!colour) {
		res.redirect('/personsColours?id='+req.session.personsOID);
	} else {
		db.collection('cappColours', function (err, coloursCollection) {
			if (err) throw exception;

			coloursCollection.insert({colour: colour, person: personsObjectID}, {w:1}, function(err, result) {
				if (err) throw err;

				res.redirect('/personsColours?id='+req.session.personsOID);
			});
		});
	}
};

exports.deleteColour = function (req, res) {
	var db = req.app.settings.db;
	var colourID = req.param('id');

	if (!colourID) {
		res.redirect('/personsColours?id='+req.session.personsOID);
	} else {
		var colourObjectID = new ObjectId(colourID);

		db.collection('cappColours', function (err, coloursCollection){
			coloursCollection.remove({_id: colourObjectID}, {w:1}, function (err, result) {
				if (err) throw err;

				res.redirect('/personsColours?id='+req.session.personsOID);
			});
		});
	}
	
}
