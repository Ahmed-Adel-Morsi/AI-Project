var boxes = document.querySelectorAll (".box");

/* X |  O | - : blank */
var state = [
	['-','-','-'],
	['-','-','-'],
	['-','-','-']
];

var player = 'X';
var ai = 'O';

for (let i = 0; i < boxes.length ; i ++){
	boxes[i].addEventListener ("click", BoxClicked);
}

function CheckWinner (state){
	let isFinished = false ;

	if (Utility(state) == 10) {
		alert ("You lost");
		isFinished = true ;
	}else if (Utility(state) == -10) {
		alert ("You won");
		isFinished = true;
	}else if (TerminalTest(state)) {
		alert ("Draw");
		isFinished = true;
	}

	if (!isFinished) return false ;

	//Reset state
	for (let i = 0 ; i < 3 ; i ++){
		for (let j = 0 ; j < 3 ; j ++ ){
			state [i][j] = '-';

			BoxFromPosition(i, j).innerText = "";
			BoxFromPosition(i, j).classList.remove ("disabled");
			BoxFromPosition(i, j).classList.add ("enabled");
		}
	}

	return true;
}

function BoxClicked (e){

	let i = e.target.getAttribute("row");
	let j = e.target.getAttribute("col");

	let action = {
		symbol: player,
		position: [i,j]
	}

	state = Result (state, action);

	e.target.classList.remove("red");
	e.target.classList.add("green");
	e.target.classList.remove ("enabled");
	e.target.classList.add ("disabled");
	e.target.innerText = player;

	setTimeout(() => {
		if (CheckWinner(state)) {
			return ;
		}

	}, 200);

	let AI_move_position = AIMove (state, false);

	action.symbol = ai;
	action.position = AI_move_position;

	AI_BOX = BoxFromPosition(AI_move_position[0], AI_move_position[1]);

	AI_BOX.classList.remove("green");
	AI_BOX.classList.add("red");
	AI_BOX.classList.remove ("enabled");
	AI_BOX.classList.add ("disabled");
	AI_BOX.innerText = ai;

	state = Result (state, action);

	setTimeout(() => {
		if (CheckWinner(state)) {
			return ;
		}
	}, 200);

}

function BoxFromPosition (i, j){
	let k = i * 3 + j;

	return boxes[k];
}

// Returns the position of the AI move
function AIMove (state){
	
	let maxScore = -Infinity;
	let bestAction = null ;
	EmptyCells(state).forEach(action_position => {
		let current_action ={
			symbol: ai,
			position: action_position
		};

		// move_score = Minimax (Result(state, current_action), 9, false);
		move_score = MinimaxPruning (Result(state, current_action), 9, -Infinity, Infinity, false);

		if (move_score > maxScore ){
			maxScore = move_score;
			bestAction = current_action;
		}

	});

	return bestAction.position;
}


function Minimax (state, depth, isMaximizingPlayer){

	if (depth == 0 || TerminalTest (state)){
		return Utility (state, (isMaximizingPlayer)? ai:player) + depth;
	}

	if (isMaximizingPlayer){
	
		let maxEva = -Infinity;

		EmptyCells(state).forEach(action_position => {
			let current_action = {
				symbol: ai,
				position: action_position
			}

			maxEva = Math.max (maxEva, Minimax (Result(state, current_action), depth-1, false));
		});

		return maxEva;

	}else {

		let minEva = Infinity;

		EmptyCells(state).forEach(action_position => {
			let current_action = {
				symbol: player,
				position: action_position
			}

			minEva = Math.min (minEva, Minimax (Result(state, current_action), depth-1, true));
		});

		return minEva;

	}

}

function MinimaxPruning (state, depth, alpha, beta, isMaximizingPlayer){

	if (depth == 0 || TerminalTest (state)){
		return Utility (state, (isMaximizingPlayer)? ai:player) + depth;
	}

	if (isMaximizingPlayer){

		let maxEva = -Infinity;

		EmptyCells(state).forEach(action_position => {
			let current_action = {
				symbol: ai,
				position: action_position
			}
			let current_eval = MinimaxPruning (Result(state, current_action), depth-1,  alpha, beta, false);

			maxEva = Math.max (maxEva, current_eval);
			alpha = Math.max (alpha, maxEva);

			if (beta <= alpha) return maxEva ;
		});

		return maxEva;

	}else {

		let minEva = Infinity;

		EmptyCells(state).forEach(action_position => {
			let current_action = {
				symbol: player,
				position: action_position
			}
			
			let current_eval = MinimaxPruning (Result(state, current_action), depth-1,  alpha, beta, true);

			minEva = Math.min (minEva, current_eval);
			beta = Math.min (beta, minEva);

			if (beta <= alpha) return minEva ;
		});
		return minEva;
	}
}

// Returns all the empty boxes
function EmptyCells (state){
	let k = 0 ;
	let legal_actions = [];

	for (let i = 0 ; i < 3 ; i ++){
		for (let j = 0 ; j < 3 ; j ++ ){
			
			if (state[i][j] == '-'){
				legal_actions[k++] = [i,j];
			}
			
		}
	}
	return legal_actions;
}

// Result on the state after an action is taken
function Result (state, action) {
	var new_state = new Array ();
	for (let i = 0 ; i < 3 ; i ++){
		new_state[i] = new Array ();
		for (let j = 0 ; j < 3 ; j ++ ){
			new_state [i][j] = state[i][j];
		}
	}

	var sym = action.symbol;
	var pos = action.position;

	new_state [pos[0]][pos[1]] = sym;

	return new_state;
}

// returns 10  if ai wins, -10 if ai lose
function Utility (state){

	//الصفوف الافقية
	for ( let i = 0 ; i < 3; i ++){
		if (state[i][0] == '-') continue;

		if (state[i][0] == state [i][1] && state[i][1] == state[i][2]) {
			if (state[i][0] == ai)
				return 10;
			else
				return -10;
		}
	}

	//الأعمدة الرأسية
	for ( let j = 0 ; j < 3; j ++){
		if (state[0][j] == '-') continue;

		if (state[0][j] == state [1][j] && state[1][j] == state[2][j]){
			if (state[0][j] == ai)
				return 10;
			else
				return -10;
		}
	}

	//القطرين
	if (
		 (state[0][0] == state[1][1] && state[1][1] == state[2][2])
		|| (state[0][2] == state[1][1] && state[1][1] == state[2][0]) 
		){
			if (state[1][1] == '-') return 0;

			if (state[1][1] == ai)
				return 10;
			else
				return -10;
		}

		

	return 0;
}

//If state is a terminal state
function TerminalTest (state){
	if (Utility(state) == -10) return true ;
	if (Utility(state) == 10) return true;

	for (let i = 0 ; i < 3; i ++){
		for (let j = 0 ; j < 3 ; j ++ ){
			if (state[i][j] == '-')
				return false;
		}
	}

	return true ;
}
