const pluginClosedClassName = 'plugin-closed';
const arrowClosedClassName = 'plugin-arrow-closed';
const headerSelector = 'h3[data-qa="bk-filepath"]';
const collapseIconSelector = 'button[aria-expanded="true"]';
const diffSectionSelector = 'section[aria-label="Diffs"]';
const commentShownSectionSelector = 'div[aria-hidden="false"]';
const arrowExpandSelector = 'span[aria-label="Expand/collapse file"]';
const collapseIconSelector2 = 'span[aria-label="collapse"]';
const hiddenFiles = ['back-end', 'snapshots', 'test.js', 'test.ts', 'package-lock.json'];
const includeClasses = ['sidebar-expander-panel-heading', 'ak-navigation-resize-button', 'collapse-sidebar-button', pluginClosedClassName];

let observerRef = null;

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
		  <label for="check-24">
		    <span></span>Is Description hidden
		  </label>
		</div>
		<div class="checkbox-wrapper-24">
		  <input type="checkbox" id="check-25" name="check" value="" checked />
		  <label for="check-25">
		    <span></span>Is Comments hidden
		  </label>
		</div>
		<div class="group">      
      <input class="file-text-input" type="text" required>
      <span class="highlight"></span>
      <span class="bar"></span>
      <label class="file-text-label">File names</label>
    </div>
    <button class="use-plugin-button">Apply</button>
	`

	span.addEventListener('click', () => {
		const hiddenSettings = document.querySelector('.hidden-settings');
		console.log('hiddenSettings', hiddenSettings.classList);
		if(hiddenSettings.classList.contains('open')){
			hiddenSettings.style.display = 'none';
			hiddenSettings.classList.remove('open')
		} else {
			hiddenSettings.style.display = 'flex';
			hiddenSettings.classList.add('open')
		}
	})


	let isStarted = localStorage.getItem('isStartedPlugin') === 'true';

	if(isStarted){
		startProcessingPlugin()
	}

	const textBtn = `Difference Plugin`;

	const startStopPlugin = (e) => {
		// const pluginState = !isStarted;
		if(!isStarted){
			closeDescription();
			closeDiff();
			startProcessingPlugin();
		} else {
			observerRef.disconnect();
		}
		localStorage.setItem('isStartedPlugin', `${!isStarted}`);
		isStarted = !isStarted;
		// const isStarted2 = localStorage.getItem('isStartedPlugin') === 'started';

		e.target.innerText = `${isStarted ? 'Stop' : 'Start'} ${textBtn}`;
	}

	pluginBtnWrapper.addEventListener('click', startStopPlugin);
	console.log('isStarted', isStarted)
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

})

function addObserver (){
	const targetNode = document.querySelector(diffSectionSelector);

	const config = { attributes: false, childList: true, subtree: true };

	closeDiff();

	const callback = () => {
		// console.log('callback2')
		closeDiff()
	};

	const observer = new MutationObserver(callback);

	observer.observe(targetNode, config);
}

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
	// console.log('collapseIcons', collapseIcons)
	collapseIcons.forEach(item => {
		// console.log('closeDescription', item.classList, includeClasses)
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
		// console.log('collapseIcons', collapseIcons)
		let some = [];

		collapseButton.forEach(item => {
			// console.log('closeDescription3', item.classList, includeClasses)
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
