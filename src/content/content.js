const pluginClosedClassName = 'plugin-closed';
const headerSelector = 'h3[data-qa="bk-filepath"]';
const collapseIconSelector = 'span[aria-label="collapse"]';
const diffSectionSelector = 'section[aria-label="Diffs"]';
const commentShownSectionSelector = 'div[aria-hidden="false"]';
const arrowExpandSelector = 'span[aria-label="Expand/collapse file"]';

const hiddenFiles = ['back-end', 'snapshots', 'test.js'];

window.addEventListener('load', () => {
	const collapseIcons = document.querySelectorAll(collapseIconSelector);

	collapseIcons.forEach(item => item.click());

	const targetNode = document.querySelector(diffSectionSelector);

	if(targetNode){
		addObserver(targetNode)
	} else {
		setTimeout(() => {
			addObserver()
		}, 2500)
	}
})

function addObserver (targetNodeProps){
	const targetNode = targetNodeProps || document.querySelector(diffSectionSelector);

	const config = { attributes: false, childList: true, subtree: true };

	closeDiff(targetNode);

	const callback = () => {
		const targetNode = document.querySelector(diffSectionSelector);

		closeDiff(targetNode)
	};


	const observer = new MutationObserver(callback);

	observer.observe(targetNode, config);
}

function closeDiff (targetNode) {
	targetNode.querySelectorAll(headerSelector).forEach(item => {
		if(hiddenFiles.some(el => item.innerText.includes(el))){
			const parent = item.parentNode.parentNode.parentNode;

			if(parent.parentNode.querySelector(commentShownSectionSelector)){
				const arrow = parent.querySelector(arrowExpandSelector);

				if(!arrow.classList.contains(pluginClosedClassName)){
					arrow.classList.add(pluginClosedClassName);
					arrow.click()
				}
			}
		}
	});
}
