const pluginClosedClassName = 'plugin-closed';
const arrowClosedClassName = 'plugin-arrow-closed';
const headerSelector = 'h3[data-qa="bk-filepath"]';
const collapseIconSelector = 'button[aria-expanded="true"]';
const diffSectionSelector = 'section[aria-label="Diffs"]';
const commentShownSectionSelector = 'div[aria-hidden="false"]';
const arrowExpandSelector = 'span[aria-label="Expand/collapse file"]';
const collapseIconSelector2 = 'span[aria-label="collapse"]';
let hiddenFiles = localStorage.getItem('hiddenFiles')?.trim().split(',').map(item => item.trim())
	|| ['back-end', 'snapshots', 'test.js', 'test.ts', 'package-lock.json'];
const includeClasses = ['sidebar-expander-panel-heading', 'ak-navigation-resize-button', 'collapse-sidebar-button', pluginClosedClassName];

let isDescriptionHidden = true;
let isCommentsHidden = true;
let observerRef = null;

const defaultDescriptionState = localStorage.getItem('isDescriptionHidden');
const defaultCommentState = localStorage.getItem('isCommentsHidden');
let isStarted = localStorage.getItem('isStartedPlugin') === 'true';

isDescriptionHidden = defaultDescriptionState === 'true';
isCommentsHidden = defaultCommentState === 'true';

const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

function onClickOutside(element) {
	const outsideClickListener = event => {
		if (!element.contains(event.target) && isVisible(element)) {
			element.style.display = 'none';
		}
	}

	document.addEventListener('click', outsideClickListener, true);
}

function toggleDescription (){
	isDescriptionHidden = !isDescriptionHidden;
	localStorage.setItem('isDescriptionHidden', isDescriptionHidden);
}

function toggleComments (){
	isCommentsHidden = !isCommentsHidden;
	localStorage.setItem('isCommentsHidden', isCommentsHidden);
}

function applyBtnHandle () {
	const input = document.querySelector('#input-file-name-plugin');

	if(input.value){
		localStorage.setItem('hiddenFiles', input.value);

		if(observerRef){
			observerRef.disconnect();
		}

		hiddenFiles = input.value.trim().split(',').map(item => item.trim());

		const hiddenSettings = document.querySelector('.hidden-settings');
		hiddenSettings.style.display = 'none';
		hiddenSettings.classList.remove('open')
		localStorage.setItem('isStartedPlugin', `${!isStarted}`);
		isStarted = !isStarted;

		startProcessingPlugin()

		alert('Changes applied');
	}
}

window.addEventListener('load', () => {
	const pluginWrapper = document.createElement('div');
	const pluginBtnWrapper = document.createElement('div');
	const usePluginButton = document.createElement('button');
	const span = document.createElement('span');
	const hiddenSettings = document.createElement('div');

	span.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" role="presentation">
		<path d="M8.292 10.293a1.009 1.009 0 000 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955a1.01 1.01 0 000-1.419.987.987 0 00-1.406 0l-2.298 2.317-2.307-2.327a.99.99 0 00-1.406 0z" fill="currentColor" fill-rule="evenodd">
		</path></svg>`

	span.className = 'settings-button'

	hiddenSettings.innerHTML = `
		<div class="checkbox-wrapper-24">
		  <input type="checkbox" id="check-24" name="check" value="" checked />
		  <label for="check-24" id="check-24-label">
		    <span></span>Hide Description
		  </label>
		</div>
		<div class="checkbox-wrapper-24">
		  <input type="checkbox" id="check-25" name="check" value="" checked />
		  <label for="check-25" id="check-25-label">
		    <span></span>Hide Comments
		  </label>
		</div>
		<div class="group">      
      <input class="file-text-input" id="input-file-name-plugin" type="text" placeholder="Enter file names separated by commas" required>
      <span class="highlight"></span>
      <span class="bar"></span>
      <label class="file-text-label">File names</label>
    </div>
    <button class="use-plugin-button" id="apply-btn">Apply</button>
	`

	span.addEventListener('click', () => {
		const hiddenSettings = document.querySelector('.hidden-settings');

		if(hiddenSettings.classList.contains('open')){
			hiddenSettings.style.display = 'none';
			hiddenSettings.classList.remove('open')
		} else {
			hiddenSettings.style.display = 'flex';
			hiddenSettings.classList.add('open')
		}
	})

	if(isStarted){
		startProcessingPlugin()
	}

	const textBtn = `Difference Plugin`;

	const startStopPlugin = (e) => {
		if(!isStarted){
			closeDescription();
			closeDiff();
			startProcessingPlugin();
		} else {
			observerRef.disconnect();
		}
		localStorage.setItem('isStartedPlugin', `${!isStarted}`);
		isStarted = !isStarted;

		e.target.innerText = `${isStarted ? 'Stop' : 'Start'} ${textBtn}`;
	}

	usePluginButton.addEventListener('click', startStopPlugin);

	pluginBtnWrapper.className = 'plugin-btn-wrapper';
	usePluginButton.className = 'use-plugin-button';
	pluginWrapper.className = 'plugin-wrapper';
	hiddenSettings.className = 'hidden-settings';

	usePluginButton.innerText = `${isStarted ? 'Stop' : 'Start'} ${textBtn}`;

	pluginBtnWrapper.append(usePluginButton);
	pluginBtnWrapper.append(span);
	pluginWrapper.append(pluginBtnWrapper);
	pluginWrapper.append(hiddenSettings);
	document.body.append(pluginWrapper);


	const hiddenSettingsRef = document.querySelector('.hidden-settings');

	onClickOutside(hiddenSettingsRef);

	const inputDescription = document.querySelector('#check-24');
	const inputComments = document.querySelector('#check-25');
	const inputFileName = document.querySelector('#input-file-name-plugin');
	const applyBtn = document.querySelector('#apply-btn');

	inputFileName.defaultValue = localStorage.getItem('hiddenFiles');
	inputDescription.checked = isDescriptionHidden;
	inputComments.checked = isCommentsHidden;
	inputDescription.addEventListener('click', toggleDescription)
	inputComments.addEventListener('click', toggleComments)
	applyBtn.addEventListener('click', applyBtnHandle);
})

function closeDiff () {
	const targetNode = document.querySelector(diffSectionSelector);

	if(targetNode) {
		targetNode.querySelectorAll(headerSelector).forEach(item => {
			if (hiddenFiles.some(el => item.innerText.includes(el))) {
				const parent = item.parentNode.parentNode.parentNode;

				if (parent.parentNode.querySelector(commentShownSectionSelector)) {
					const arrow = parent.querySelector(arrowExpandSelector);

					if (!arrow.classList.contains(pluginClosedClassName)) {
						arrow.classList.add(pluginClosedClassName);
						arrow.click()
					}
				}
			}
		});
	}
}

function closeDescription (){
	const collapseIcons = document.querySelectorAll(collapseIconSelector);

	collapseIcons.forEach(item => {
		const parent = item.parentNode.parentNode;
		const textCheckbox = parent.querySelector('h2')?.innerText || '';

		if(parent.tagName === 'SECTION'){
			return
		}

		if((textCheckbox.includes('Description') && !isDescriptionHidden) || (textCheckbox.includes('comment') && !isCommentsHidden)){
			return
		}

		if(!includeClasses.some(el => item.getAttribute('data-testid') === el || item.classList.contains(el))){
			item.classList.add(arrowClosedClassName);
			item.click()
		} else {
			item.classList.remove(arrowClosedClassName);
		}
	});
}


function startProcessingPlugin () {
	const content = document.querySelector('div[data-testid="Content"]');

	const config = { attributes: false, childList: true, subtree: true };

	const callback = () => {
		closeDiff();

		const collapseButton = document.querySelectorAll(collapseIconSelector);
		let some = [];

		collapseButton.forEach(item => {
			if(item.classList.contains(arrowClosedClassName)){
				some.push(1);
			}

		});

		if(some.length){
			return;
		}

		closeDescription();
	};

	observerRef = new MutationObserver(callback);

	observerRef.observe(content, config);
}
