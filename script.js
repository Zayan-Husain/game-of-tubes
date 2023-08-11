let range = n => [...Array(n).keys()]
var $ = q => { return document.querySelectorAll(q).length == 1 ? document.querySelectorAll(q)[0] : document.querySelectorAll(q) }
var gamePos = [
	['', '', '', '', '', '', ''],
	['', '', '', '', '', '', ''],
	['', '', '', '', '', '', ''],
	['', '', '', '', '', '', '']
]
var level = 1;
var filledTubesAmount;
var finishedTubes = 0;
var difficulties = [
	{ tubes: 2, colors: ['orange'], levels: [1] },
	{
		tubes: 3, colors: ['orange', 'purple'], levels: [2], specialCase: [
			['orange', 'purple'],
			['purple', 'orange'],
			['orange', 'purple'],
			['purple', 'orange']
		]
	},
	{ tubes: 5, colors: ['orange', 'purple', 'green'], levels: [3, 4] },
	{ tubes: 7, colors: ['red', 'green', 'purple', 'orange', 'white'], levels: [5, 6, 7, 8, 9] },
	{ tubes: 9, colors: ['red', 'green', 'purple', 'orange', 'white', 'yellow', 'lightblue'], levels: [10] },
	{ tubes: 6, colors: ['red', 'green', 'orange', 'purple'], levels: ['5-special'], specialCase: 'special-8heighttube' }
]
var levelDifficulties = [
	difficulties[0],
	difficulties[1],
	difficulties[2],
	difficulties[2],
	difficulties[3],
	difficulties[3],
	difficulties[3],
	difficulties[3],
	difficulties[3],
	difficulties[4],
	difficulties[4],
]
var difficulty = difficulties[0]
var selectedBall;
function newGame(lvl = level) {
    finishedTubes = 0;
	level = lvl;
	$('.level').innerText = level;
	//create tubes
	$('.game_container').replaceChildren();
	for (var i in range(levelDifficulties[lvl - 1]['tubes'])) {
		//create one tube
		let tube = document.createElement('div');
		tube.classList.add('tube');
		tube.innerHTML =
			`
	<img src="images/tube.png" alt="Tube" draggable="false">
	<div class="ball1"></div>
	<div class="ball2"></div>
	<div class="ball3"></div>
	<div class="ball4"></div>
	`;
		$('.game_container').appendChild(tube);
		tube.addEventListener('click', e => {
			let topBallPosition;
			for (var i in range(levelDifficulties[lvl - 1]['specialCase'] == 'special-8heighttube' ? 8 : 4)) {
				//loops through the height of the tube
				if (tube.children[Number(i) + 1].children.length > 0) {
					//there is a ball in that position
					if (!topBallPosition) topBallPosition = tube.children[Number(i) + 1].children[0]
				}
			}

			if (topBallPosition && topBallPosition.dataset.raised == "true") {
				topBallPosition.style.top = '1px';
				topBallPosition.dataset.raised = "false";
				selectedBall = null;
			} else {
				if (selectedBall != undefined) {
					console.log('second ball');

					//make sure the tube isn't full

					console.log(topBallPosition)
					if (topBallPosition && topBallPosition.parentElement.classList.contains('ball1')) {
						//the tube is full
						//un-lift the selected ball
						[...selectedBall.tube.children].forEach(elem => {
							if (elem.tagName == "DIV") {
								if (elem.children.length > 0) {
									elem.children[0].style.top = "1px";
									elem.children[0].dataset.raised = "false";
								}
							}
						})
						//lift the new selected ball
						topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
						topBallPosition.dataset.raised = "true";
						selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
					} else {
						//the tube isn't full

						//check if the tube has at least one ball in it
						//if so, make sure the top-most ball is the same color (if the tube isnt empty)

						if (topBallPosition) {
							//the tube has at least one ball in it
							//the top ball's color is topBallPosition.src.split('_')[1].split('.')[0]
							if (selectedBall.color == topBallPosition.src.split('_')[1].split('.')[0]) {
								//find the amount of same-colored balls at the top of selected ball's tube  
								if (getFreeTubePositions(tube) >= getBallNumFromTube(selectedBall.tube)) {
									moveBall(selectedBall.tube, tube, getBallNumFromTube(selectedBall.tube), getTopBallColorFromTube(selectedBall.tube));
									selectedBall = null;
								} else {
									moveBall(selectedBall.tube, tube, getFreeTubePositions(tube), getTopBallColorFromTube(selectedBall.tube));
									selectedBall = null;
								}
							} else {
								//do the same thing to do if the tube was full
								//un-lift the selected ball
								[...selectedBall.tube.children].forEach(elem => {
									if (elem.tagName == "DIV") {
										if (elem.children.length > 0) {
											elem.children[0].style.top = "1px";
											elem.children[0].dataset.raised = "false";
										}
									}
								})
								//lift the target ball
								topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
								topBallPosition.dataset.raised = "true";
								selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
							}
						} else {
							moveBall(selectedBall.tube, tube, getBallNumFromTube(selectedBall.tube), getTopBallColorFromTube(selectedBall.tube));
							selectedBall = null;
						}
					}


					return;
				}
				if (topBallPosition) {
					topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
					//topballPosition would be an html img element, with a class of ball and a src of its color.
					//topballposition's parent would be a div with a class of "ball1," "ball2," etc.
					//topballposition's parent determines the position of the ball. If it's ball1, the top should be -79px.
					//if its ball2, then -79px - 67px.
					//if its ball[n], then -79px - 67(n)px.
					topBallPosition.dataset.raised = "true";
				}
				if (topBallPosition) selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
			}
		})
	}
	let gameFilledTubes;
	if (levelDifficulties[lvl - 1]['tubes'] > 3) gameFilledTubes = levelDifficulties[lvl - 1]['tubes'] - 2;
	else if (levelDifficulties[lvl - 1]['tubes'] == 3) gameFilledTubes = levelDifficulties[lvl - 1]['tubes'] - 1;
	else gameFilledTubes = levelDifficulties[lvl - 1]['tubes'];
    filledTubesAmount = gameFilledTubes
	createGame(levelDifficulties[lvl - 1]['colors'], gameFilledTubes, levelDifficulties[lvl - 1]['specialCase'] == 'special-8heighttube' ? 8 : 4)
	levelDifficulties[lvl - 1]
}

function dropBall(color, tube, elem = false) { //for deeper explaining content, refer to function loadBall (should be directly after this)
	let tubeElement = $('.game_container').children[tube - 1]
	if (elem) tubeElement = tube;
	console.log(tubeElement)
	let positionToDrop;
	if (tubeElement.children[1].children.length > 0) return 0; //dont even try dropping the ball there, the tube is full
	else if (tubeElement.children[2].children.length > 0) positionToDrop = 1; //if the second-to-last spot is filled, the only spot left is the top spot.
	else if (tubeElement.children[3].children.length > 0) positionToDrop = 2; //if the third-to-last spot is filled, the bottom-most spot is the spot below the top.
	else if (tubeElement.children[4].children.length > 0) positionToDrop = 3; //if the fourth-to-last spot is filled, the bottom spot is the third position, or second from the bottom.
	else positionToDrop = 4; //the tube is empty, so the position to place the ball is at the bottom.
	var ballContainerElement = tubeElement.children[positionToDrop];
	var newBall = document.createElement('img');
	newBall.src = `images/ball_${color}.png`;
	newBall.classList.add('ball')
	newBall.alt = `${color[0].toUpperCase()}${color.slice(1)} ball`
	newBall.draggable = false
	ballContainerElement.replaceChildren()
	ballContainerElement.appendChild(newBall);
}

function getBallNumFromTube(tube) {
	let num = 0;
	let topBallColorArr = [];
	let topBallColor;
	if (tube.children[4].children.length == 0) return 0;
	[...tube.children].forEach(child => {
		if (child.tagName == "DIV") {
			if (child.children[0]) {
				topBallColorArr.push(child.children[0].src.split('_')[1].split('.')[0])
			}
		}
	})
	topBallColor = topBallColorArr[0];
	for (let i in topBallColorArr) {
		if (topBallColorArr[i] == topBallColor) num++;
		else return num;
	}
	return num;
}

function removeBallsFromTopOfTube(tube, ballNum) {
	console.log(ballNum)
	let dynamicBallNum = ballNum;
	[...tube.children].forEach(child => {
		if (child.tagName == "DIV") {
			if (dynamicBallNum > 0) {
				//remove the element
				if (child.children.length > 0) {
					child.replaceChildren();
					dynamicBallNum--;
				}
			} else {
				return;
			}
		}
	})
}

function addBallsToTopOfTube(tube, ballNum, color) {
	for (var i in range(ballNum)) {
		console.log(color, tube)
		dropBall(color, tube, true)
	}
}

function moveBall(tube1, tube2, ballNum, color) {
	console.log('gobble from ', tube1, ' to ', tube2)
	removeBallsFromTopOfTube(tube1, ballNum);
	addBallsToTopOfTube(tube2, ballNum, color)
}

function getTopBallPosition(tube) {
	let topBallPosition;
	for (var i in range(levelDifficulties[lvl - 1]['specialCase'] == 'special-8heighttube' ? 8 : 4)) {
		//loops through the height of the tube
		if (tube.children[Number(i) + 1].children.length > 0) {
			//there is a ball in that position
			if (!topBallPosition) topBallPosition = tube.children[Number(i) + 1].children[0]
		}
	}
	return topBallPosition;
}

function getTopBallColorFromTube(tube) {
	let topBallColorArr = [];
	let topBallColor;
	if (tube.children[4].children.length == 0) return 0;
	[...tube.children].forEach(child => {
		if (child.tagName == "DIV") {
			if (child.children[0]) {
				topBallColorArr.push(child.children[0].src.split('_')[1].split('.')[0])
			}
		}
	})
	topBallColor = topBallColorArr[0];
	return topBallColor;
}

function getFreeTubePositions(tube) {
	let freePositions = 0;
	[...tube.children].forEach(child => {
		if (child.tagName == "DIV") {
			if (child.children.length == 0) {
				freePositions++;
			}
		}
	})
	return freePositions;
}

function loadBall(color, position, tube) {
	//first we need to get which tube to put the ball in.
	//tube = 1 means the first tube, tube = 2 means second tube, etc.
	//we need to find the HTML element corresponding to the tube
	//we will define a variable called "tubeElement" with a value of the HTML element of the tube listed
	let tubeElement = $('.game_container').children[tube - 1]
	//next we need to know which position the ball will be put in. The HTML element of the ball container will be listed
	//in the next variable.
	var ballContainerElement = tubeElement.children[position];
	//Finally, we will add an image of the ball in the ball container element.
	var newBall = document.createElement('img');
	newBall.src = `images/ball_${color}.png`;
	newBall.classList.add('ball')
	newBall.alt = `${color[0].toUpperCase()}${color.slice(1)} ball`
	newBall.draggable = false
	ballContainerElement.replaceChildren()
	ballContainerElement.appendChild(newBall);
}

function createGame(colors, filledTubesNum, tubeHeight = 4) {
	var filledTubes = {};

	//SPECIAL CASES (LVL 1, 2)

	if (level == 1) {
		for (var i in range(4)) {
			let rand = Math.round(Math.random()) + 1;
			let tubeElement = $('.game_container').children[rand - 1]
			if (tubeElement.children[2].children.length > 0) rand = rand == 1 ? 2 : 1;
			dropBall('orange', rand);
		}
		return;
	}

	if (level == 2) {
		dropBall('purple', 1);
		dropBall('orange', 1);
		dropBall('purple', 1);
		dropBall('orange', 1);
		dropBall('orange', 2);
		dropBall('purple', 2);
		dropBall('orange', 2);
		dropBall('purple', 2);
		return;
	}


	//first we need to create a list full of all ball positions
	var positionList = []
	for (var i in range(tubeHeight)) {
		for (var j in range(filledTubesNum)) {
			positionList.push([i, j])
			filledTubes[`${i},${j}`] = '';
		}
	}

	//make 4* color list
	var fourColorList = [];
	colors.forEach(color => { for (var i in range(tubeHeight)) fourColorList.push(color); })

	//loop through position list
	for (var i in positionList) {
		//choose a random number from 0 to the end of fourColorList
		let rand = Math.round(Math.random() * (fourColorList.length - 1));
		//delete said number from fourColorList
		let color = fourColorList.splice(rand, 1)[0];
		filledTubes[positionList[i].join(',')] = color;
	}

	//load each ball
	for (var i of Object.keys(filledTubes)) {
		//how do we get from 0,0 to 1, 1
		let mappedKey = i.split(',').map(x => Number(x) + 1)
		loadBall(filledTubes[i], mappedKey[0], mappedKey[1])
	}
}
$('.topbarbtn.reset').addEventListener('click', e => {
    newGame(level)
})
$('.topbarbtn.undo').addEventListener('click', e => {
})
$('.topbarbtn.extratube').addEventListener('click', e => {
	//create one tube
	let tube = document.createElement('div');
	tube.classList.add('tube');
	tube.innerHTML =
		`
<img src="images/tube.png" alt="Tube" draggable="false">
<div class="ball1"></div>
<div class="ball2"></div>
<div class="ball3"></div>
<div class="ball4"></div>
`;
	$('.game_container').appendChild(tube);
	tube.addEventListener('click', e => {
		let topBallPosition;
		for (var i in range(levelDifficulties[level - 1]['specialCase'] == 'special-8heighttube' ? 8 : 4)) {
			//loops through the height of the tube
			if (tube.children[Number(i) + 1].children.length > 0) {
				//there is a ball in that position
				if (!topBallPosition) topBallPosition = tube.children[Number(i) + 1].children[0]
			}
		}

		if (topBallPosition && topBallPosition.dataset.raised == "true") {
			topBallPosition.style.top = '1px';
			topBallPosition.dataset.raised = "false";
			selectedBall = null;
		} else {
			if (selectedBall != undefined) {
				console.log('second ball');

				//make sure the tube isn't full

				console.log(topBallPosition)
				if (topBallPosition && topBallPosition.parentElement.classList.contains('ball1')) {
					//the tube is full
					//un-lift the selected ball
					[...selectedBall.tube.children].forEach(elem => {
						if (elem.tagName == "DIV") {
							if (elem.children.length > 0) {
								elem.children[0].style.top = "1px";
								elem.children[0].dataset.raised = "false";
							}
						}
					})
					//lift the new selected ball
					topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
					topBallPosition.dataset.raised = "true";
					selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
				} else {
					//the tube isn't full

					//check if the tube has at least one ball in it
					//if so, make sure the top-most ball is the same color (if the tube isnt empty)

					if (topBallPosition) {
						//the tube has at least one ball in it
						//the top ball's color is topBallPosition.src.split('_')[1].split('.')[0]
						if (selectedBall.color == topBallPosition.src.split('_')[1].split('.')[0]) {
							//find the amount of same-colored balls at the top of selected ball's tube  
							if (getFreeTubePositions(tube) >= getBallNumFromTube(selectedBall.tube)) {
								moveBall(selectedBall.tube, tube, getBallNumFromTube(selectedBall.tube), getTopBallColorFromTube(selectedBall.tube));
								selectedBall = null;
							} else {
								moveBall(selectedBall.tube, tube, getFreeTubePositions(tube), getTopBallColorFromTube(selectedBall.tube));
								selectedBall = null;
							}
						} else {
							//do the same thing to do if the tube was full
							//un-lift the selected ball
							[...selectedBall.tube.children].forEach(elem => {
								if (elem.tagName == "DIV") {
									if (elem.children.length > 0) {
										elem.children[0].style.top = "1px";
										elem.children[0].dataset.raised = "false";
									}
								}
							})
							//lift the target ball
							topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
							topBallPosition.dataset.raised = "true";
							selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
						}
					} else {
						moveBall(selectedBall.tube, tube, getBallNumFromTube(selectedBall.tube), getTopBallColorFromTube(selectedBall.tube));
						selectedBall = null;
					}
				}


				return;
			}
			if (topBallPosition) {
				topBallPosition.style.top = `${-79 - 67 * (Number(topBallPosition.parentElement.classList[0][4]) - 1)}px`;
				//topballPosition would be an html img element, with a class of ball and a src of its color.
				//topballposition's parent would be a div with a class of "ball1," "ball2," etc.
				//topballposition's parent determines the position of the ball. If it's ball1, the top should be -79px.
				//if its ball2, then -79px - 67px.
				//if its ball[n], then -79px - 67(n)px.
				topBallPosition.dataset.raised = "true";
			}
			if (topBallPosition) selectedBall = { color: topBallPosition.src.split('_')[1].split('.')[0], tube: tube }
		}
	})
})
$('.topbarbtn.home').addEventListener('click', e => {

})

newGame(10)