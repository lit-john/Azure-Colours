
var ObjectId = require('mongodb').ObjectID;

/*
 * GET home page.
 */

exports.index = function(req, res){
	var db = req.app.settings.db;

	db.collection('cappPerson', function (err, personsCollection) {
		if (err) throw err;

		personsCollection.find().limit(10).toArray(function(err, resultsArray){
			if (err) {throw err};

			res.render('index', { personsArray: resultsArray });
		})
	});
};

exports.addPerson = function(req, res){
	var db = req.app.settings.db;

	var personsName = req.param('person');

	if(!personsName) {
		res.redirect('/');
	} else {
		db.collection('cappPerson', function (err, personsCollection) {
			personsCollection.insert({name: personsName}, {w:1}, function (err, result) {
				if (err) throw err;

				res.redirect('/');
			});
		});
	}

};

exports.personsColours = function(req, res) {
	var db = req.app.settings.db;
	var personsID = req.param('id');

	if (!personsID) {
		res.render('/');
	} else {
		var personsObjectID = new ObjectId(personsID);

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
