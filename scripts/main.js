
function getFieldItem(field) {
	var fieldItem = field ? field.parentNode : null;

	while (fieldItem && fieldItem.classList && !fieldItem.classList.contains('field-item')) {
		fieldItem = fieldItem.parentNode;
	}

	return fieldItem;
}

function getFieldLabelText(field) {
	var el = null;

	if (field && field.hasAttribute) {
		if (field.hasAttribute('aria-labelledby')) {
			el = window.document.getElementById(field.getAttribute('aria-labelledby')); // use data- instead or just use 'legend'[0] ?
		} else {
			el = getFieldItem(field);

			if (el) {
				el = el.getElementsByClassName('field-label')[0];
			}
		}
	}

	return el ? el.textContent : null;
}

function getFieldset(field) {
	var fieldItem = getFieldItem(field);

	return fieldItem ? fieldItem.getElementsByTagName('fieldset')[0] : null; // only one fieldset per item?
}

function getConfirmFieldMessage(field, fieldConfirm) {
	return getFieldLabelText(field) + ' and ' + getFieldLabelText(fieldConfirm) + ' must match.';
}

function setConfirmFieldValidity(field, fieldConfirm) {
	var valid = null;

	if (field && fieldConfirm && field.setCustomValidity && fieldConfirm.setCustomValidity) {
		if (fieldConfirm.value === field.value) {
			fieldConfirm.setCustomValidity('');
			valid = true;
		} else {
			fieldConfirm.setCustomValidity(getConfirmFieldMessage(field, fieldConfirm));
			valid = false;
		}
	}

	return valid;
}

function getMinLengthMessage(length) {
	return 'Must be at least ' + length + ' characters long.';
}

function setMinLengthValidity(field) {
	var length,
		min,
		valid = null;

	if (field && field.hasAttribute && field.hasAttribute('data-minlength')) {
		length = field.value.length;
		min = field.getAttribute('data-minlength');

		if (length && length < min) {
			field.setCustomValidity(getMinLengthMessage(min));
			valid = false;
		} else {
			field.setCustomValidity('');
			valid = true;
		}
	}

	return valid;
}

function isFieldsetValid(fieldset) {
	return (fieldset && fieldset.querySelector) ? (fieldset.querySelector(':invalid') ? false : true) : null;
}

// function setCustomValidities(field) {
//     if (getFieldset(field)) {
//         if (field.required && field.nodeName === 'SELECT' && field.selectedOptions[0].disabled) {
//             field.setCustomValidity(field.title);
//         }
//     }
// }

function updateStatus(field, invalidState) {
	var container,
		fieldset,
		list = window.document.createElement('ul'), // frag
		msg,
		type,
		validity;

	function buildListItem(valid, msg) {
		var item = window.document.createElement('li');

		if (invalidState || field.value) {
			item.classList.add(valid ? 'valid' : 'invalid');
		}

		item.textContent = msg;

		return item;
	}

	if (field && field.validity) {
		container = field.hasAttribute('aria-controls') ? window.document.getElementById(field.getAttribute('aria-controls')) : null;
	}

	if (container) {
		fieldset = getFieldset(field);
		type = field.type;
		validity = field.validity;

		if (fieldset && fieldset.title) {
			list.appendChild(buildListItem(isFieldsetValid(fieldset), fieldset.title));
		} else {
			switch (type) {
			case 'email':
				type = 'email address';
				break;
			default:
				type = null;
			}

			if (field.required) {
				if (field.nodeName === 'INPUT') {
					msg = 'Please fill in this required field.';
				} else if (field.nodeName === 'SELECT') {
					msg = field.title;
				}

				if (msg) {
					list.appendChild(buildListItem(!validity.valueMissing, msg));
				}
			}

			if (validity.customError) {
				list.appendChild(buildListItem(false, field.validationMessage));
			} else if (field.hasAttribute('data-minlength')) {
				list.appendChild(buildListItem(true, getMinLengthMessage(field.getAttribute('data-minlength'))));
			} else if (field.hasAttribute('data-confirm-primary')) {
				list.appendChild(buildListItem(true,
						getConfirmFieldMessage(window.document.getElementById(field.getAttribute('data-confirm-primary')), field)));
			}

			if (field.pattern) {
				list.appendChild(buildListItem(!validity.patternMismatch, field.title));
			}

			if (type) {
				list.appendChild(buildListItem(!validity.typeMismatch, 'Must be a valid ' + type + '.'));
			}

			// badInput e.g. letters in number input

			if (!list.hasChildNodes() && !validity.valid) {
				list.appendChild(buildListItem(false, 'Something with this field is wrong!'));
			}
		}

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		if (list.hasChildNodes()) {
			container.appendChild(list);
		}
	}

	return field;
}

function setFieldValidity() {
	var active,
		confirmField,
		fieldItem = getFieldItem(this),
		fieldset = getFieldset(this),
		valid;

	active = (this === window.document.activeElement ||
			fieldItem === getFieldItem(window.document.activeElement));

	if (this.hasAttribute('data-confirm')) {
		confirmField = window.document.getElementById(this.getAttribute('data-confirm'));

		if (confirmField && confirmField.nodeName === 'INPUT') {
			setConfirmFieldValidity(this, confirmField);

			if (confirmField.value) {
				setFieldValidity.call(confirmField);
			}
		}
	} else if (this.hasAttribute('data-confirm-primary')) {
		setConfirmFieldValidity(window.document.getElementById(this.getAttribute('data-confirm-primary')), this);
	}

	setMinLengthValidity(this); // add all these to an array and pass to updatestatus to have multiple custom errors and remove ct=reating strings in update status

	valid = fieldset ? isFieldsetValid(fieldset) : (this.validity ? this.validity.valid : null);

	if (fieldItem) {
		if (valid) {
			fieldItem.classList.remove('invalid');
		} else if (this.form.classList.contains('submitted') || !active) {
			fieldItem.classList.add('invalid');
		}

		if (this === window.document.activeElement) {
			updateStatus(this, fieldItem.classList.contains('invalid'));
		}
	}

	return valid;
}

function addLeading(leading, maxLen) {
	var val = this.value;

	leading = leading || this.getAttribute('data-leading');
	maxLen = maxLen || this.maxLength;

	if (leading && maxLen && val.length) { // && this.validity.valid) {
		while (val.length + leading.length <= maxLen) {
			val = leading + val;
		}

		this.value = val;
	}

	return this;
}

function autoTab(event, maxLen) {
	var next = this.nextElementSibling,
		prev = this.previousElementSibling,
		val = this.value;

	maxLen = maxLen || this.maxLength;

	if (this.validity.valid && val.length === maxLen) {
		while (next && next.nodeName !== 'INPUT') {
			next = next.nextElementSibling;
		}

		if (next) {
			window.setTimeout(function () { next.focus(); }, 0);
		}
	} else if (event.keyCode === 8 && !val.length && !this.validity.badInput) {
		while (prev && prev.nodeName !== 'INPUT') {
			prev = prev.previousElementSibling;
		}

		if (prev) {
			window.setTimeout(function () { prev.focus(); }, 0);
		}
	}

	return this;
}

function limitLength(maxLen) { // on input
	var val = this.value;

	maxLen = maxLen || this.maxLength;

	if (this.type === 'number' && val.length > maxLen) {
		//event.preventDefault();
		this.value = val.substr(0, maxLen);
	}

	return this;
}

function matchMask() {
	var addedDelim = false,
		container = this.nextElementSibling,
		frag = window.document.createDocumentFragment(),
		hidden = window.document.createElement('span'),
		i,
		j,
		leadingNum = '0',
		mask = this.getAttribute('data-mask'),
		maskChar,
		placeholder = this.getAttribute('data-mask-placeholder'), //container && container.textContent || mask,
		val = this.value,
		valChar,

		alphanum = /[A-Za-z0-9]/,
		alpha = /[A-Za-z]/,
		num = /[0-9]/,
		maskAlphanum = /[A09*]/,
		maskAlpha = /A/,
		maskNum = /[09]/,
		maskNumLeading = /0/;

	if (container && mask && mask.length === placeholder.length) {
		for (i = 0; i < val.length; i += 1) {
			j = i - 1;
			maskChar = mask.charAt(i);
			valChar = val.charAt(i);

			if (maskAlphanum.test(maskChar)) {
				if (!alphanum.test(valChar) && maskNumLeading.test(mask.charAt(j)) && num.test(val.charAt(j))) {
					while (maskNumLeading.test(mask.charAt(j - 1))) {
						j -= 1;
					}
					val = val.substr(0, j) + leadingNum + val.substr(j);
				} else if ((maskAlpha.test(maskChar) && !alpha.test(valChar)) ||
						(maskNum.test(maskChar) && !num.test(valChar)) ||
						(maskAlphanum.test(maskChar) && !alphanum.test(valChar))) {
					val = val.substr(0, i);
				}
			} else if (valChar !== maskChar) {
				val = val.substr(0, i) + maskChar + val.substr(i);
				addedDelim = true;
			} else if (!maskAlphanum.test(mask.charAt(i + 1)) && addedDelim) {
				val += mask.charAt(i + 1);
			}
		}

		this.value = val = val.substr(0, mask.length);

		//window.setTimeout(function (field, pos) { field.selectionStart = pos; }, 0, this, val.length);

		hidden.textContent = val;

		frag.appendChild(hidden);
		frag.appendChild(window.document.createTextNode(placeholder.substring(val.length)));

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		container.appendChild(frag);
	}

	return this;
}

function focus(event) {
	var el = event.target;

	if (el.nodeName === 'INPUT' || el.nodeName === 'SELECT') {
		setFieldValidity.call(el);

		if (el.parentNode.classList.contains('textbox')) {
			el.parentNode.classList.add('focus');
		}
	}

	// if (el.nodeName === 'LABEL') {
	//     console.log('sdfs')
	//     event.preventDefault();
	// }

	return el;
}

function blur(event) {
	var el = event.target;

	if (el.nodeName === 'INPUT' || el.nodeName === 'SELECT') {
		if (el.nodeName === 'INPUT') {
			addLeading.call(el);
		}

		if (el.parentNode.classList.contains('textbox')) {
			el.parentNode.classList.remove('focus');
		}

		window.setTimeout(setFieldValidity.bind(el), 100);
	}

	return el;
}

function input(event) {
	var el = event.target;

	if (el.nodeName === 'INPUT') {
		if (el.type === "number") {
			limitLength.call(el);
		}

		setFieldValidity.call(el);

		/*if (el.validity.valid && el.id === 'field-test11-day') { // if data-autotab
			autoTab.call(el);
		}*/
	}

	return el;
}

function change(event) {
	var el = event.target;

	if (el.nodeName === 'SELECT') {
		window.setTimeout(setFieldValidity.bind(el), 0);
	}

	return el;
}

function showErrorMessages(invalidFields) {
	var container = this.getElementsByClassName('form-errors')[0],
		field,
		frag = window.document.createDocumentFragment(),
		i,
		list,
		title;

	function buildListItem(field, label, msg) {
		var item = window.document.createElement('li'),
			link = window.document.createElement('a'),
			name = window.document.createElement('strong'),
			para = window.document.createElement('p');

		name.textContent = label;

		link.setAttribute('href', '#' + field.id);
		link.addEventListener('click', function () {
			field.focus();
			window.setTimeout(function () { field.focus(); }, 1000); // works?
		}, false);

		link.appendChild(name);
		link.appendChild(window.document.createTextNode(' ' + msg));

		para.appendChild(link);

		item.appendChild(para);

		return item;
	}

	if (container) {
		if (invalidFields && invalidFields.length) {
			title = window.document.createElement('p');
			title.textContent = 'Please correct the following:';

			frag.appendChild(title);

			list = window.document.createElement('ol');

			for (i = 0; i < invalidFields.length; i += 1) {
				field = invalidFields[i];

				if (field.nodeName === 'INPUT' || field.nodeName === 'SELECT') {
					list.appendChild(buildListItem(field, getFieldLabelText(field),
							getFieldset(field) ? field.title : field.validationMessage));
				}
			}

			frag.appendChild(list);
		}

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		container.appendChild(frag);
	}

	return container;
}

function submit() {
	var field,
		fieldItem,
		i,
		invalidFields = this.querySelectorAll(':invalid');

	this.classList.add('submitted');

	for (i = 0; i < invalidFields.length; i += 1) {
		field = invalidFields[i];
		fieldItem = getFieldItem(field);

		if (fieldItem && field.nodeName !== 'FIELDSET') {
			fieldItem.classList.add('invalid');
			updateStatus(field, true);
		}
	}

	showErrorMessages.call(this, invalidFields);

	return this;
}

function clearField(field, fieldItem) {
	fieldItem.classList.remove('invalid');
	//setCustomValidities(field);
	updateStatus(field);

	return field;
}

function reset() {
	var allFields = this.querySelectorAll('input, select'),
		field,
		fieldItem,
		i;

	this.classList.remove('submitted');

	for (i = 0; i < allFields.length; i += 1) {
		field = allFields[i];
		fieldItem = getFieldItem(field);

		if (fieldItem) {
			fieldItem.classList.remove('invalid');
			window.setTimeout(clearField, 100, field, fieldItem);
		}
	}

	showErrorMessages.call(this);

	return this;
}

function init(form) {
	var allFields = form.querySelectorAll('input, select'),
		field,
		fieldItem,
		i,
		maskPlaceholder;

	for (i = 0; i < allFields.length; i += 1) {
		field = allFields[i];
		fieldItem = getFieldItem(field);

		if (fieldItem) {
			if (field.required) {
				fieldItem.classList.add('required');
			}

			//setCustomValidities(field);

			//updateStatus(field, fieldItem);

			// if (field.nodeName === 'INPUT') {
			//     //field.addEventListener('input', setFieldValidity, false);
			// } else if (field.nodeName === 'SELECT') {
			//     field.addEventListener('change', function () {
			//         // if (getFieldset(this)) {
			//         //     this.setCustomValidity('');
			//         // }
			//         window.setTimeout(setFieldValidity.bind(this), 0);
			//     }, false);
			// }

			// field.addEventListener('blur', function () {
			//     window.setTimeout(setFieldValidity.bind(this), 100);
			// }, false);

			// if (getFieldset(field) || true) {
			//     field.addEventListener('focus', setFieldValidity, false);
			// }

			if (field.hasAttribute('data-mask')) {
				maskPlaceholder = window.document.createElement('div');

				maskPlaceholder.setAttribute('class', 'mask-placeholder');
				//maskPlaceholder.setAttribute('for', field.id);
				maskPlaceholder.textContent = field.getAttribute('data-mask-placeholder');

				field.parentNode.insertBefore(maskPlaceholder, field.nextSibling);

				field.addEventListener('input', matchMask, false);
			}

			if (getFieldset(field)) {
				if (field.nodeName === 'INPUT') { // autotab for selects?
					field.addEventListener('keyup', autoTab.bind(field), false);
				}
			}
		}
	}

	form.addEventListener('focus', focus, true);
	form.addEventListener('blur', blur, true);

	form.addEventListener('input', input, true);
	form.addEventListener('change', change, true);

	form.addEventListener('click', function (event) {
		if (event.target.nodeName === 'INPUT' && event.target.parentNode.nodeName === 'LABEL') {
			event.preventDefault();
		}
	}, false);

	form.querySelector('button[type="submit"]').addEventListener('click', submit.bind(form), false);
	form.addEventListener('reset', reset, true);

	return form;
}

init(window.document.forms[0]);
