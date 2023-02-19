const pluginClosedClassName = 'plugin-closed';
const arrowClosedClassName = 'plugin-arrow-closed';
const inputFileClassName = 'input-file-name-plugin';
const settingsButtonClassName = 'settings-button';
const	pluginBtnWrapperClassName = 'plugin-btn-wrapper';
const	usePluginButtonClassName = 'use-plugin-button';
const	pluginWrapperClassName = 'plugin-wrapper';
const	hiddenSettingsClassName = 'hidden-settings';

const inputDescriptionId = 'check-24';
const inputCommentsId = 'check-25';
const applyBtnId = 'apply-btn';

const headerSelector = 'h3[data-qa="bk-filepath"]';
const collapseIconSelector = 'button[aria-expanded="true"]';
const diffSectionSelector = 'section[aria-label="Diffs"]';
const commentShownSectionSelector = 'div[aria-hidden="false"]';
const arrowExpandSelector = 'span[aria-label="Expand/collapse file"]';
const includeClasses = ['sidebar-expander-panel-heading', 'ak-navigation-resize-button', 'collapse-sidebar-button', pluginClosedClassName];
const textBtn = 'Difference Plugin';

/** Setting default hiddenFiles getting it from localstorage **/
let hiddenFiles = localStorage.getItem('hiddenFiles')?.trim().split(',').map(item => item.trim())
	|| ['snapshots', 'package-lock.json'];

/** Setting default state ofr checkboxes and observer **/
let isDescriptionHidden = true;
let isCommentsHidden = true;
let observerRef = null;

/** Getting actual state from localstorage **/
const defaultDescriptionState = localStorage.getItem('isDescriptionHidden');
const defaultCommentState = localStorage.getItem('isCommentsHidden');
let isStarted = localStorage.getItem('isStartedPlugin') === 'true';

isDescriptionHidden = defaultDescriptionState === 'true';
isCommentsHidden = defaultCommentState === 'true';

function applyBtnHandle () {
	const input = document.querySelector(`#${inputFileClassName}`);

	if(input.value){
		/** Setting entered files into storage **/
		localStorage.setItem('hiddenFiles', input.value);

		/** Stopping previous picked files to close by plugin **/
		if(observerRef){
			observerRef.disconnect();
		}

		/** Converting string to array of file names **/
		hiddenFiles = input.value.trim().split(',').map(item => item.trim());

		/** Closing opened settings modal **/
		const hiddenSettings = document.querySelector(`.${hiddenSettingsClassName}`);

		hiddenSettings.style.display = 'none';
		hiddenSettings.classList.remove('open')

		/** Changing state of start/stop button **/
		localStorage.setItem('isStartedPlugin', `${!isStarted}`);
		isStarted = !isStarted;

		const usePluginButton = document.querySelector(`.${usePluginButtonClassName}`);

		usePluginButton.innerText = `Stop ${textBtn}`;

		startProcessingPlugin()

		alert('Changes applied');
	}
}

window.addEventListener('load', () => {
	const pluginWrapper = document.createElement('div');
	const pluginBtnWrapper = document.createElement('div');
	const usePluginButton = document.createElement('button');
	const settingsButton = document.createElement('span');
	const hiddenSettings = document.createElement('div');

	/** Adding svg **/
	settingsButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" role="presentation">
		<path d="M8.292 10.293a1.009 1.009 0 000 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955a1.01 1.01 0 000-1.419.987.987 0 00-1.406 0l-2.298 2.317-2.307-2.327a.99.99 0 00-1.406 0z" fill="currentColor" fill-rule="evenodd">
		</path></svg>`

	settingsButton.className = settingsButtonClassName;

	/** Filling settings modal  **/
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

	/** Starting plugin if user picked to start it before **/
	if(isStarted){
		startProcessingPlugin()
	}

	pluginBtnWrapper.className = pluginBtnWrapperClassName;
	usePluginButton.className = usePluginButtonClassName;
	pluginWrapper.className = pluginWrapperClassName;
	hiddenSettings.className = hiddenSettingsClassName;

	usePluginButton.innerText = `${isStarted ? 'Stop' : 'Start'} ${textBtn}`;

	pluginBtnWrapper.append(usePluginButton);
	pluginBtnWrapper.append(settingsButton);
	pluginWrapper.append(pluginBtnWrapper);
	pluginWrapper.append(hiddenSettings);

	document.body.append(pluginWrapper);

	onClickOutside(hiddenSettings);

	const inputDescription = document.querySelector(`#${inputDescriptionId}`);
	const inputComments = document.querySelector(`#${inputCommentsId}`);
	const inputFileName = document.querySelector(`#${inputFileClassName}`);
	const applyBtn = document.querySelector(`#${applyBtnId}`);

	/** Setting value inside input file name and checkboxes state **/
	inputFileName.defaultValue = localStorage.getItem('hiddenFiles') ? localStorage.getItem('hiddenFiles') : hiddenFiles;
	inputDescription.checked = isDescriptionHidden;
	inputComments.checked = isCommentsHidden;

	inputDescription.addEventListener('click', toggleDescription)
	inputComments.addEventListener('click', toggleComments)
	applyBtn.addEventListener('click', applyBtnHandle);
	settingsButton.addEventListener('click', toggleSettings)
	usePluginButton.addEventListener('click', startStopPlugin);
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
	const isSourcePage = document.querySelector('table[data-qa="repository-directory"]');

	if(isSourcePage){
		return;
	}

	collapseIcons.forEach(item => {
		const parent = item.parentNode.parentNode;
		/** Getting exact field name (Description/Comments) **/
		const textCheckbox = parent.querySelector('h2')?.innerText || '';

		/** Excluding section tag because it provides sidebar buttons that we don't need **/
		if(parent.tagName === 'SECTION'){
			return
		}

		/** Checking state of checkboxes and deciding to close or not fields **/
		if((textCheckbox.includes('Description') && !isDescriptionHidden) || (textCheckbox.includes('comment') && !isCommentsHidden)){
			return
		}

		/** Selecting fields to close **/
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

	if (!content) {
		return
	}

	const config = { attributes: false, childList: true, subtree: true };

	const callback = () => {
		/** Calling close difference files **/
		closeDiff();

		/** Getting all collapse buttons **/
		const collapseButton = document.querySelectorAll(collapseIconSelector);

		let alreadyCollapsedButtons = [];
		/** Checking is button already collapsed **/
		collapseButton.forEach(item => {
			if(item.classList.contains(arrowClosedClassName)){
				alreadyCollapsedButtons.push(1);
			}

		});
		/** Not calling close descriptions if button already collapsed**/
		if(alreadyCollapsedButtons.length){
			return;
		}

		/** Calling close Description files **/
		closeDescription();
	};

	/** Calling callback for first time to close selected fields don't wait till observer trigger it. **/
	callback();

	/** Saving observer ref to be able to stop it. **/
	observerRef = new MutationObserver(callback);

	/** Setting config **/
	observerRef.observe(content, config);
}

/** Check is hidden settings modal open **/
const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

/** Handle to close settings modal on outside click **/
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

function toggleSettings () {
	const hiddenSettings = document.querySelector('.hidden-settings');

	if(hiddenSettings.classList.contains('open')){
		hiddenSettings.style.display = 'none';
		hiddenSettings.classList.remove('open')
	} else {
		hiddenSettings.style.display = 'flex';
		hiddenSettings.classList.add('open')
	}
}

function startStopPlugin (e) {
	if(!isStarted){
		startProcessingPlugin();
	} else {
		observerRef.disconnect();
	}

	localStorage.setItem('isStartedPlugin', `${!isStarted}`);
	isStarted = !isStarted;

	e.target.innerText = `${isStarted ? 'Stop' : 'Start'} ${textBtn}`;
}

