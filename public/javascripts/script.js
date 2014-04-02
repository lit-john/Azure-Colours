function onEditColour(theForm)
{
	var buttonPressed = $(theForm.submit).val();

	if (buttonPressed == "edit"){
		$(theForm.colourField).removeAttr('readonly');
		$(theForm.colourField).toggleClass('readonly active');
		$(theForm.submit).attr('value', 'save');
		$(theForm.submit).html('SAVE');

		return false;
	}
	else if (buttonPressed == "save") {
		return true;
	}
	else {
		return false;
	}
}