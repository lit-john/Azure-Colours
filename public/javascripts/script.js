$(document).ready(function() {

	/*
	$('#edit').click(function(){
		$('#colourField').removeAttr('readonly');
		$(this).focus();
		$(this).attr('value','SAVE');
		$(this).html('<small>SAVE</small>')
		return false;
	});
	*/
	console.log("Document ready");

	
	/*
	$('#editForm').submit(function(event) {
		//var buttonPressed = $('#edit').val();

		console.log("Form submitted: " + buttonPressed);

		if (buttonPressed == "edit"){
			$('#colourField').removeAttr('readonly');
			$('#colourField').addClass('editable');
			return false;
		}
		else if (buttonPressed == "save") {
			return false;
		}
		
		return false;
	});
	*/
	
});

function onEditColour(theForm)
{
	console.log("Testing: " + $(theForm.colourField).val());
	console.log("Testing2: " + $(theForm.submit).val());
	var buttonPressed = $(theForm.submit).val();

	console.log("Form submitted: " + buttonPressed);

	if (buttonPressed == "edit"){
		$(theForm.colourField).removeAttr('readonly');
		$(theForm.colourField).toggleClass('readonly active');
		$(theForm.submit).attr('value', 'save');
		$(theForm.submit).html('<small>SAVE</small>');

		return false;
	}
	else if (buttonPressed == "save") {
		return true;
	}
	else {
		return false;
	}
}