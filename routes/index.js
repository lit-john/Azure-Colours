/*
 * 	A Note about the Database Structure
 *
 *	The database consists of two collections:
 *		cappPerson:
 *			{_id: ObjectID, name: String}
 *		
 *			e.g.
 *				{_id: 01273460213874628304, name: 'John'}
 *
 *		cappColours:
 *			{_id: ObjectID, colour: String, person: ObjectID}
 *
 *			e.g.
 *				{_id: 976597059597, colour: 'Red', person: 01273460213874628304}
 *
 *	It is the person property/field in the cappColours document that links the colour
 *	to the person who owns it. Essentially it acts like a foreign key.
 */

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
 *	person to the database OR to copy an existing persons list. 
 *
 *	 <form name="newPersonForm" action="/addPerson" method="POST">
 *       <label>Person </label>
 *       <input type="text" name="person">
 *       <button type="submit" name="submit" value="add">ADD</button>
 *       <button type="submit" name="submit" value="copy">COPY</button>
 *     </form>
 *
 *	The newPersonForm form on the index page has two submit buttons, one with a value
 *	of 'add' and another with a value of 'copy'. By checking the vaue  of the submit button
 *	we can determine which button was pressed. If the 'add' button was pressed then the new 
 *	person is stored on the cappPersons collection. If the 'copy' button was pressed then 
 *	we call the pickCopyList function which displays a page from which the user can pick the
 *	list they want to copy.
 */
exports.addPerson = function(req, res){
	var db = req.app.settings.db;

	// Get the value of the person form input field
	var personsName = req.param('person');

	// If the input field is blank then just redirect the user back to /
	if(!personsName) {
		res.redirect('/');
	} else {

		if (req.param('submit') == 'copy')
		{
			// Ok somone pressed the copy button. Call the copyList function.
			pickCopyList(req, res);
		} else {
			// Ok someone pressed the add button

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
	}

};

/*
 *	GET /deletePerson
 *
 * 	This function gets called when someone clicks the delete button beside a users list on
 *	the index page. The delete button is actually a link as shown in the snippet of sample
 *	html that index.jade renders.
 *
 *	<ul>
 *       <li><a href="/personsColours?id=53335499bd11f60000c7c44e">John</a>
 *         <button><a href="/deletePerson?id=53335499bd11f60000c7c44e">DELETE</a></button>
 *       </li>
 *       <li><a href="/personsColours?id=533bce669157c000009fba0c">Philip</a>
 *         <button><a href="/deletePerson?id=533bce669157c000009fba0c">DELETE</a></button>
 *       </li>
 *  </ul>
 *
 *	As you can see above the delete buttons contain a link and the href of the link is in 
 *	the format:
 *		/deletePerson?id=<personsID>
 *
 *	where personsID is the ID of the person the user is looking to delete.
 *
 *	To delete a person we need to do two things:
 *		1. Delete all their colours from cappColours
 *		2. Delete their details from cappPerson
 */
exports.deletePerson = function (req, res) {
	var db = req.app.settings.db;

	// Get the "id" query parameter. This is the id of the person we
	// want to delete
	var personsID = req.param('id');

	// Convert the personsID from a String to an ObjectId object as this is how it is
	// stored in the database
	var personsOID = new ObjectId(personsID);

	// Get the cappPerson collection
	db.collection('cappPerson', function (err, personsCollection) {
		if (err) throw err;

		// Remove all documents from the cappPerson collection where the _id field
		// of the document is the same as personsOID. There should be only one such
		// document
		personsCollection.remove({_id: personsOID}, {w:1}, function (err, result) {
			if (err) throw err;

			// Get the cappColours collection
			db.collection('cappColours', function (err, coloursCollection) {
				if (err) throw err;

				// Remove all documents from the cappColours collection where the person
				// field of the document is the same as personsOID i.e. remove all
				// colours owned by the person we want to delete
				coloursCollection.remove({person: personsOID}, {w:1}, function (err, result) {
					if (err) throw err;

					// Redirect the user back to the index page.
					res.redirect('/');
				});
			});
		});
	});
};

/*
 * 	GET /personsColours
 *
 *	This gets called when sone clicks on the name of a person in the index (/) page.
 *
 *	<ul>
 *       <li><a href="/personsColours?id=53335499bd11f60000c7c44e">John</a>
 *         <button><a href="/deletePerson?id=53335499bd11f60000c7c44e">DELETE</a></button>
 *       </li>
 *       <li><a href="/personsColours?id=533bce669157c000009fba0c">Philip</a>
 *         <button><a href="/deletePerson?id=533bce669157c000009fba0c">DELETE</a></button>
 *       </li>
 *  </ul>
 *
 *	The link contains a query parameter called id which is equal to the persons _id field.
 *	
 *	The function uses the persons _id to get all the colours belonging to this person from 
 *	the cappColours collection.
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

		/*
		 * Store the "id" up on the users session, this allows us to keep a "note" of
		 * what person we are dealing with. I am doing this because I am about to display
		 * a page that contains a form that allows the user to add a new colour to this
		 * persons list. The form looks something like:
		 *
		 * <form name="newColourForm" action="/addColour" method="POST">
         *		<input type="text" name="colour">
         *		<button type="submit" name="submit" value="Add">ADD</button>
      	 *	</form>
      	 *
      	 * As you can see, if someone submits the form it gets posted to /addColour. What 
      	 * gets posted to that URL is the contents of the form which contains the name of
      	 * the colour you want to add to the persons list but NOT the id of the person. This
      	 * is why I store the persons ID now on the session (before I send the user back the
      	 * above form) so that if the user does add a new colour using the above form I know
      	 * what person they are are talking about.
		 */
		req.session.personsOID = personsID;

		// Get the cappColours collection
		db.collection('cappColours', function (err, coloursCollection) {
			if (err) throw err;

			// Find 50 documents in the cappColours collection where the person field is that same as
			// personsObjectID
			coloursCollection.find({person: personsObjectID}).limit(50).toArray(function (err, resultsArray){
				if (err) throw err;

				res.render('personsColours', {coloursArray: resultsArray});
			});
		});

		
	}
	
};

/*
 *  POST /addColour
 *
 *	This function gets called if the user submits the newColourForm on the personsColours page.
 * 	Below is an example of the form
 *
 * <form name="newColourForm" action="/addColour" method="POST">
 *		<input type="text" name="colour">
 *		<button type="submit" name="submit" value="Add">ADD</button>
 *	</form>
 *
 *  Before the above page was sent to the user (as part of the personsColours function above)
 *	we stored the ID of the person, whose colours we were displaying, up on the session. We
 *  will now retrieve the ID from the session and add the colour to that persons list of colours.
 */
exports.addColour = function(req, res) {
	var db = req.app.settings.db;
	var colour = req.param('colour');

	// Get the persons ID that we stored on the users session (so we know what user we are
	// dealing with) and create an ObjectId object
	var personsObjectID = new ObjectId(req.session.personsOID);

	if (!colour) {
		res.redirect('/personsColours?id='+req.session.personsOID);
	} else {
		// Get the cappColours collection
		db.collection('cappColours', function (err, coloursCollection) {
			if (err) throw exception;

			// Insert a new document containing the name of the new colour and the person
			// it belongs to
			coloursCollection.insert({colour: colour, person: personsObjectID}, {w:1}, function(err, result) {
				if (err) throw err;

				// Redirect the user back to this persons personsColours page
				res.redirect('/personsColours?id='+req.session.personsOID);
			});
		});
	}
};

/*
 *	GET /deleteColour
 *
 *  The personsColours page contains a list of a persons favourite colours. This list is actually a list
 * 	of forms, like so:
 *
 *	<ul>
 *       <li>
 *         <form action="/editColour" method="POST" onsubmit="return onEditColour(this)">
 *           <input type="text" name="colourField" value="Green" readonly class="readonly">
 *           <input type="hidden" name="id" value="533bce669157c000009fba0d">
 *           <button type="submit" name="submit" value="edit">EDIT</button>
 *           <button type="button"><a href="deleteColour?id=533bce669157c000009fba0d">DELETE</a></button>
 *         </form>
 *       </li>
 *       <li>
 *         <form action="/editColour" method="POST" onsubmit="return onEditColour(this)">
 *           <input type="text" name="colourField" value="Blue" readonly class="readonly">
 *           <input type="hidden" name="id" value="533bce669157c000009fba0e">
 *           <button type="submit" name="submit" value="edit">EDIT</button>
 *           <button type="button"><a href="deleteColour?id=533bce669157c000009fba0e">DELETE</a></button>
 *         </form>
 *       </li>
 *	</ul>
 *
 *	As you can see from above, each form contains a delete button which is a button that contains
 *	a link. The link is in teh form /deleteColour?id=<colourID> where colourID is the ID of the
 *  colour we want to delete (this is the same approach taken with deleting a person).
 *
 */
exports.deleteColour = function (req, res) {
	var db = req.app.settings.db;

	// Get the id of the colour we have been asked to delete
	var colourID = req.param('id');

	if (!colourID) {
		res.redirect('/personsColours?id='+req.session.personsOID);
	} else {
		// Convert the colourID to an ObjectId object
		var colourObjectID = new ObjectId(colourID);

		// Get the cappColours collection
		db.collection('cappColours', function (err, coloursCollection){

			// Remove all documents (there should be only one) where the _id field is
			// the same as colourObjectID
			coloursCollection.remove({_id: colourObjectID}, {w:1}, function (err, result) {
				if (err) throw err;

				// Redirect the user
				res.redirect('/personsColours?id='+req.session.personsOID);
			});
		});
	}
	
}

/*
 *	POST /editColour
 *
 *	This function gets called when someone wants to edit a colour in a persons list. The personsColours
 *	page returns back a list of colours. As mentioned above, it actually returns a list of forms like so:
 *
 *	<ul>
 *       <li>
 *         <form action="/editColour" method="POST" onsubmit="return onEditColour(this)">
 *           <input type="text" name="colourField" value="Green" readonly class="readonly">
 *           <input type="hidden" name="id" value="533bce669157c000009fba0d">
 *           <button type="submit" name="submit" value="edit">EDIT</button>
 *           <button type="button"><a href="deleteColour?id=533bce669157c000009fba0d">DELETE</a></button>
 *         </form>
 *       </li>
 *       <li>
 *         <form action="/editColour" method="POST" onsubmit="return onEditColour(this)">
 *           <input type="text" name="colourField" value="Blue" readonly class="readonly">
 *           <input type="hidden" name="id" value="533bce669157c000009fba0e">
 *           <button type="submit" name="submit" value="save">SAVE</button>
 *           <button type="button"><a href="deleteColour?id=533bce669157c000009fba0e">DELETE</a></button>
 *         </form>
 *       </li>
 *	</ul>
 *
 */
exports.editColour = function (req, res) {
	var db = req.app.settings.db;
	var colourID = req.param('id');
	var newColour = req.param('colourField');

	if(!colourID) {
		res.redirect('/personsColours?id='+req.session.personsOID);
	} else {
		var colourObjectID = new ObjectId(colourID);

		db.collection('cappColours', function (err, coloursCollection){
			coloursCollection.update({_id: colourObjectID}, {$set: {colour: newColour}}, function (err, result) {
				if (err) throw err;

				res.redirect('/personsColours?id='+req.session.personsOID);
			});
		});
	}
};

var pickCopyList = function (req, res) {
	var db = req.app.settings.db;

	// Get the value of the person form input field and store it on the session, we'll need it
	// later
	var newListName = req.param('person');
	req.session.newListName = newListName;

	/*
	 *	Get a list of the first 10 people from the cappPersons collection
	 *  and pass them to the pickCopyList page.
	 */
	db.collection('cappPerson', function (err, personsCollection) {
		if (err) throw err;

		personsCollection.find().limit(10).toArray(function(err, resultsArray){
			if (err) {throw err};

			res.render('pickCopyList', { personsArray: resultsArray });
		})
	});
};

exports.copyList = function (req, res) {
	var db = req.app.settings.db;

	// Get the value of the radio button called person. The value is the 
	// id of the person in the DB
	var personsToCopyID = req.param('person');

	var personsToCopyObjectID = new ObjectId(personsToCopyID);

	// Get the name of the list that we have already stored on the users session
	var newListName = req.session.newListName;

	db.collection('cappPerson', function (err, personsCollection) {
		personsCollection.insert({name: newListName}, {w:1}, function (err, insertedDocs) {
			if (err) throw err;

			var newPersonsOID = insertedDocs[0]._id;

			db.collection('cappColours', function (err, coloursCollection) {
				if (err) throw err;

				coloursCollection.find({person: personsToCopyObjectID}).limit(10).toArray(function(err, resultsArray){
					for (var i=0; i < resultsArray.length; i++) {
						resultsArray[i].person = newPersonsOID;
						delete resultsArray[i]._id;
					}

					coloursCollection.insert(resultsArray, {w:1}, function (err, result) {
						if (err) throw err;

						res.render('copyListName', {personsID: newPersonsOID})
						res.redirect('/personsColours?id='+newPersonsOID)
					});
				});
			});
		});
	});

};


