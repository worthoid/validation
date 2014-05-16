
//trouble with fieldLen = 1 and delimLen = 1 or 2
function matchDateMask() {
	var container = this.nextElementSibling,
		delim,
		delimChars = /[/ .-]/,
		delimLen,
		delimSearch = /[^A-Z]+/g,
		fieldLen,
		fieldSearch = /[A-Z]+/g,
		fieldVal,
		fieldValNext,
		frag = document.createDocumentFragment(),
		i,
		mask = this.getAttribute('data-mask'),
		max,
		min = 1,
		replaceChar = '0',
		span = document.createElement('span'),
		val = this.value,
		valLen = val.length,
		year = '19';

	function moveCaretTo(pos) {
		setTimeout(function (field, pos) {
			field.selectionStart = pos;
		}, 0, this, pos);
	}

	if (container && mask) {
		delim = mask.match(delimSearch);

		if (delim) {
			delim = delim[0];
			delimLen = delim.length;
		}

		fieldLen = mask.match(fieldSearch);

		if (fieldLen) {
			fieldLen = fieldLen[0].length;
		}
	}

	if (delim && fieldLen) {
		max = valLen <= fieldLen + 1 ? 31 : 12;

		if (mask.substr(valLen, delimLen) === delim) { // filled section in field
			fieldVal = val.substr(-fieldLen);

			for (i = 0; i < fieldLen - 1; i += 1) {
				if (delimChars.test(fieldVal.substr(-1))) {
					fieldVal = ' ' + fieldVal.substr(0, (fieldLen - 1));
				}
			}

			if (fieldVal >= min && fieldVal <= max) {
				this.value = val = val.substr(0, valLen - fieldLen) +
						fieldVal.replace(/\s/g, replaceChar) + delim;
				valLen = val.length;
				moveCaretTo.call(this, valLen);
			}
		} else if (mask.substr(valLen - 1, delimLen) === delim) { // extra char in field section
			fieldVal = val.substr(-(fieldLen + 1), fieldLen).replace(/\s/g, replaceChar);
			fieldValNext = val.substr(-1);

			if (fieldVal >= min && fieldVal <= max && fieldValNext !== delim.substr(0, 1)) {
				this.value = val = val.substr(0, valLen - (fieldLen + 1)) + fieldVal +
						delim + (delimChars.test(fieldValNext) ? '' : fieldValNext);
				valLen = val.length;
				moveCaretTo.call(this, valLen);
			} else {
				this.value = val = val.substr(0, valLen - 1);
				valLen = val.length;
			}
		} else if (((valLen + 1) % (fieldLen + delimLen) === 0) && mask.substr(valLen - (delimLen - 1), delimLen - 1) === delim.substr(0, delimLen - 1)) { // backspaced into delim
			this.value = val = val.substr(0, valLen - (delimLen - 1));
			valLen = val.length;
		} else if (valLen === fieldLen * 2 + delimLen * 2 + 1) { // filled year with one char
			fieldVal = val.substr(-1);

			if (fieldVal.indexOf(' ') === -1 && fieldVal > -1 && fieldVal < 10 && fieldVal !== year.substr(0, 1)) { // need to test for empty space?
				this.value = val = val.substr(0, valLen - 1) + year + fieldVal;
				valLen = val.length;
				moveCaretTo.call(this, valLen);
			}
		} else if (valLen === fieldLen * 2 + delimLen * 2 + 2) { // filled year with two chars
			fieldVal = val.substr(-2);

			if (fieldVal.indexOf(' ') === -1 && fieldVal > -1 && fieldVal < 100 && fieldVal !== year) {
				this.value = val = val.substr(0, valLen - 2) + year + fieldVal;
				valLen = val.length;
				moveCaretTo.call(this, valLen);
			}
		}

		span.textContent = val;

		frag.appendChild(span);
		frag.appendChild(document.createTextNode(mask.substring(valLen)));

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		container.appendChild(frag);
	}

	return this;
}
