const pluginClosedClassName = 'plugin-closed';
const arrowClosedClassName = 'plugin-arrow-closed';
const headerSelector = 'h3[data-qa="bk-filepath"]';
const collapseIconSelector = 'button[aria-expanded="true"]';
const diffSectionSelector = 'section[aria-label="Diffs"]';
const commentShownSectionSelector = 'div[aria-hidden="false"]';
const arrowExpandSelector = 'span[aria-label="Expand/collapse file"]';
const collapseIconSelector2 = 'span[aria-label="collapse"]';
const hiddenFiles = ['back-end', 'snapshots', 'test.js'];
const includeClasses = ['ak-navigation-resize-button', 'collapse-sidebar-button', pluginClosedClassName];

window.addEventListener('load', () => {
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

		const observer = new MutationObserver(callback);

		observer.observe(content, config);

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
