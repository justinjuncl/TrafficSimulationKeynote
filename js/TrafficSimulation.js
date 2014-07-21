
Bezier = function ( args ) {

	this.start = args.start;
	this.cont1 = args.cont1;
	this.cont2 = args.cont2;
	this.end = ages.end;

};

Bezier.prototype = {

	length: function () {



	},

	pointByT: function ( t ) {

		var a = new Vector2(),
			b = new Vector2(),
			c = new Vector2();

		c = this.cont1.subVector( this.start ).multiplyScalar( 3 );
		b = this.cont2.subVector( this.cont1 ).multiplyScalar( 3 ).subVector( c );
		a = this.end.subVector( this.start ).subVector( c ).subVector( b );

		return a.multiplyScalar( t * t * t).addVector( b.multiplyScalar( t * t ) ).addVector( c.multiplyScalar( t ) ).addVector( this.start );

	}

}

Canvas = function ( args ) {

	//-------------------------------------------

	this.whiteColor = "#FFFFFF";
	this.blackColor = "#000000";
	this.darkGreyColor = "#555555";
	this.greyColor = "#BFBFBF";
	this.yellowColor = "#F5B753";
	this.redColor = "#FF0000";
	this.blueColor = "#0000FF";
	this.greenColor = "#00FF00";

	this.outlineWidth = 2;
	this.inlineWidth = 0.4;
	this.generatorLength = 5;
	this.signalLength = 3;

	//-------------------------------------------

	this.traffic = args.traffic;

	this.width = args.width;
	this.height = args.height;

	this.canvasContainer = document.createElement( "div" );
	this.canvasContainer.id = "canvasContainer";
	this.traffic.trafficContainer.appendChild( this.canvasContainer );

	this.canvasBlocks = document.createElement( "canvas" );
	this.canvasBlocks.width = this.width;
	this.canvasBlocks.height = this.height;
	this.canvasBlocks.id = "canvasBlocks";
	this.canvasContainer.appendChild( this.canvasBlocks );
	this.contextBlocks = this.canvasBlocks.getContext('2d');

	this.canvasVehicles = document.createElement( "canvas" );
	this.canvasVehicles.width = this.width;
	this.canvasVehicles.height = this.height;
	this.canvasVehicles.id = "canvasVehicles";
	this.canvasContainer.appendChild( this.canvasVehicles );
	this.contextVehicles = this.canvasVehicles.getContext('2d');

	this.sensitivity = args.sensitivity || 1;

	this.scale = args.scale || 1;

	this.offsetX = 0;
	this.offsetY = 0;

	this.isPanning = false;
	this.isZooming = false;

	this.init();

};

Canvas.prototype = {

	get widthHalf () {

		return Math.floor( this.width );

	},

	get heightHalf () {

		return Math.floor( this.height );

	},

	get roads () {

		return this.traffic.roads;

	},

	get junctions () {

		return this.traffic.junctions;

	},

	get generators () {

		return this.traffic.generators;

	},

	interpolate: function ( start, end, percent ) {

		return Math.floor( start + ( end - start ) * percent );

	},

	vehicleColor: function ( a ) {

		var colors = [[255, 0, 0], [0, 0, 0], [0, 0, 255]];

		if ( a >= 0 ) {

			var r = this.interpolate( colors[1][0], colors[2][0], a );
			var g = this.interpolate( colors[1][1], colors[2][1], a );
			var b = this.interpolate( colors[1][2], colors[2][2], a );

		} else {

			a = -a;

			var r = this.interpolate( colors[1][0], colors[0][0], a );
			var g = this.interpolate( colors[1][1], colors[0][1], a );
			var b = this.interpolate( colors[1][2], colors[0][2], a );

		}

		return "rgb( " + r + ", " + g + ", " + b + " )";

	},

	init: function () {

		this.contextBlocks.setTransform( 1, 0, 0, -1, 0, 0 );
		this.contextVehicles.setTransform( 1, 0, 0, -1, 0, 0 );

		this.contextBlocks.translate( 0, -this.height );
		this.contextVehicles.translate( 0, -this.height );

		canvas = this;

		window.addEventListener( "mousemove", mouseMoveListener, false );
		window.addEventListener( "keydown", keyDownListener, false );
		window.addEventListener( "keyup", keyUpListener, false );

	},

	clearBlocks: function () {

		this.contextBlocks.save();
		this.contextBlocks.setTransform( 1, 0, 0, 1, 0, 0 );
		this.contextBlocks.clearRect( 0, 0, this.width, this.height );
		this.contextBlocks.restore();

	},

	clearVehicles: function () {

		this.contextVehicles.save();
		this.contextVehicles.setTransform( 1, 0, 0, 1, 0, 0 );
		this.contextVehicles.clearRect( 0, 0, this.width, this.height );
		this.contextVehicles.restore();

	},

	renderBlocks: function () {

		this.clearBlocks();

		this.renderJunctions();
		this.renderGenerators();
		this.renderRoads();

	},

	// ------------------------------------------
	// Junctions
	// ------------------------------------------

	renderJunctions: function () {

		var junctions = this.traffic.junctions;

		this.contextBlocks.save();
		this.contextBlocks.fillStyle = this.darkGreyColor;
		for ( var j = 0; j < junctions.length; j++ ) {

			this.renderJunctionOutline( junctions[j] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		this.contextBlocks.fillStyle = this.greyColor;
		for ( var j = 0; j < junctions.length; j++ ) {

			this.renderJunction( junctions[j] );

		}
		this.contextBlocks.restore();

	},

	renderJunction: function ( junction ) {

		var position = junction.position;

		this.contextBlocks.fillRect( position.x - 20, position.y - 20, 40, 40 );

	},

	renderJunctionOutline: function ( junction ) {

		var position = junction.position;
		var o = this.outlineWidth;

		this.contextBlocks.fillRect( position.x - 20 - o, position.y - 20 - o, 40 + 2 * o, 40 + 2 * o );

	},

	// ------------------------------------------
	// Generators
	// ------------------------------------------

	renderGenerators: function () {

		var generators = this.traffic.generators;

		this.contextBlocks.save();
		this.contextBlocks.fillStyle = this.darkGreyColor;
		for ( var g = 0; g < generators.length; g++ ) {

			this.renderGeneratorOutline( generators[g] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		this.contextBlocks.fillStyle = this.yellowColor;
		for ( var g = 0; g < generators.length; g++ ) {

			this.renderGenerator( generators[g] );

		}
		this.contextBlocks.restore();

	},

	renderGenerator: function ( generator ) {

		if ( generator.to === undefined ) return;

		// var start = generator.position;
		// var end = generator.direction.multiplyScalar( this.generatorLength )
		// 							.addVector( generator.tangent.multiplyScalar( generator.width + this.outlineWidth ) );

		// this.contextBlocks.fillRect( start.x, start.y, end.x, end.y );

		var position = generator.position;

		this.contextBlocks.fillRect( position.x - 20, position.y - 20, 40, 40 );

	},

	renderGeneratorOutline: function ( generator ) {

		var position = generator.position;
		var o = this.outlineWidth;

		this.contextBlocks.fillRect( position.x - 20 - o, position.y - 20 - o, 40 + 2 * o, 40 + 2 * o );

	},

	// ------------------------------------------
	// Roads
	// ------------------------------------------

	renderRoads: function () {

		var roads = this.traffic.roads;

		this.contextBlocks.save();
		this.contextBlocks.fillStyle = this.greyColor;
		for ( var r = 0; r < roads.length; r++ ) {

			this.renderRoad( roads[r] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		for ( var r = 0; r < roads.length; r++ ) {

			this.renderRoadSignal( roads[r] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		this.contextBlocks.strokeStyle = this.yellowColor;
		this.contextBlocks.lineWidth = this.inlineWidth;
		for ( var r = 0; r < roads.length; r++ ) {

			this.renderRoadOutlineLeft( roads[r] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		this.contextBlocks.strokeStyle = this.darkGreyColor;
		this.contextBlocks.lineWidth = this.outlineWidth;
		for ( var r = 0; r < roads.length; r++ ) {

			this.renderRoadOutlineRight( roads[r] );

		}
		this.contextBlocks.restore();

		this.contextBlocks.save();
		this.contextBlocks.strokeStyle = this.whiteColor;
		this.contextBlocks.lineWidth = this.inlineWidth;
		for ( var r = 0; r < roads.length; r++ ) {

			this.renderRoadLanes( roads[r] );

		}
		this.contextBlocks.restore();

	},

	renderRoad: function ( road ) {

		var start = road.position;
		var end = road.vector.addVector( road.tangent.multiplyScalar( road.width ) );

		this.contextBlocks.fillRect( start.x, start.y, end.x, end.y );

	},

	renderRoadSignal: function ( road ) {

		var start = road.position.addVector( road.vector );
		var end = road.direction.multiplyScalar( this.signalLength )
							.addVector( road.tangent.multiplyScalar( road.laneWidth ) );

		for (var i = 0; i < road.laneCount; i++) {

			this.contextBlocks.fillStyle = road.signal[i] ? this.greenColor : this.redColor;
			this.contextBlocks.fillRect( start.x, start.y, end.x, end.y );

			start.addVector( road.tangent.multiplyScalar( road.laneWidth ) );

		}

	},

	renderRoadOutlineLeft: function ( road ) {

		var start = road.position.addVector( road.tangent.multiplyScalar( -this.inlineWidth/2 ) );
		var end = start.clone.addVector( road.vector );

		this.contextBlocks.beginPath();
		this.contextBlocks.moveTo( start.x, start.y );
		this.contextBlocks.lineTo( end.x, end.y );
		this.contextBlocks.stroke();

	},

	renderRoadOutlineRight: function ( road ) {

		var start = road.position.addVector( road.tangent.multiplyScalar( -this.outlineWidth/2 ) )
									.addVector( road.tangent.multiplyScalar( road.width + this.outlineWidth ) );
		var end = start.clone.addVector( road.vector );

		this.contextBlocks.beginPath();
		this.contextBlocks.moveTo( start.x, start.y );
		this.contextBlocks.lineTo( end.x, end.y );
		this.contextBlocks.stroke();

	},

	renderRoadLanes: function ( road ) {

		var start = road.position.addVector( road.tangent.multiplyScalar( road.laneWidth ) );
		var end = start.clone.addVector( road.vector );

		for ( var l = 0; l < road.lane.length - 1; l++ ) {

			this.contextBlocks.beginPath();
			this.contextBlocks.moveTo( start.x, start.y );
			this.contextBlocks.lineTo( end.x, end.y );
			this.contextBlocks.stroke();

			start.addVector( road.tangent.multiplyScalar( road.laneWidth ) );
			end.addVector( road.tangent.multiplyScalar( road.laneWidth ) );

		}

	},

	// ------------------------------------------
	// Veicles
	// ------------------------------------------

	renderVehicles: function () {

		this.clearVehicles();

		var vehicles = this.traffic.vehicles;

		for ( var v = 0; v < vehicles.length; v++ ) {

			this.contextVehicles.save();
			this.contextVehicles.fillStyle = this.vehicleColor( vehicles[v].color );
			this.renderVehicle( vehicles[v] );
			this.contextVehicles.restore();

		}

	},

	renderVehicle: function ( vehicle ) {

		var start = vehicle.globalPosition;
		var end = vehicle.direction.multiplyScalar( vehicle.length )
										.addVector( vehicle.tangent.multiplyScalar( vehicle.width ) );

		this.contextVehicles.fillRect( start.x, start.y, end.x, end.y );

	}

}

function getMousePosition ( e ) {

	var bRect = canvas.canvasVehicles.getBoundingClientRect();
	canvas.mouseX = (e.clientX - bRect.left) * (canvas.width/bRect.width);
	canvas.mouseY = (e.clientY - bRect.top) * (canvas.height/bRect.height);

}

function mouseMoveListener ( e ) {

	getMousePosition( e );

	if ( canvas.isPanning ) {

		var panDeltaX = canvas.mouseX - canvas.panStartX;
		var panDeltaY = canvas.mouseY - canvas.panStartY;

		panDeltaX *= canvas.scale;
		panDeltaY *= canvas.scale;

		canvas.offsetX += panDeltaX;
		canvas.offsetY += panDeltaY;

		canvas.contextBlocks.translate( panDeltaX, -panDeltaY );
		canvas.contextVehicles.translate( panDeltaX, -panDeltaY );

	}

	if ( canvas.isZooming ) {

		canvas.zoomDeltaX = canvas.mouseX - canvas.zoomStartX;
		canvas.zoomDeltaY = canvas.mouseY - canvas.zoomStartY;

		canvas.scale = Math.pow( 1.2, -canvas.zoomDeltaY / 200 );

		// 		canvas.zoomDeltaX *= canvas.scale;
		// canvas.zoomDeltaY *= canvas.scale;

		canvas.contextBlocks.translate( canvas.zoomStartX, canvas.zoomStartY);
		canvas.contextBlocks.scale( canvas.scale, canvas.scale );
		canvas.contextBlocks.translate( -canvas.zoomStartX, -canvas.zoomStartY);

		canvas.contextVehicles.translate( canvas.zoomStartX, canvas.zoomStartY);
		canvas.contextVehicles.scale( canvas.scale, canvas.scale );
		canvas.contextVehicles.translate( -canvas.zoomStartX, -canvas.zoomStartY);

		// canvas.contextBlocks.setTransform(canvas.scale, 0, 0, -canvas.scale, canvas.offsetX, canvas.offsetY);
		// canvas.contextVehicles.setTransform(canvas.scale, 0, 0, -canvas.scale, canvas.offsetX, canvas.offsetY);

	}

	canvas.panStartX = canvas.mouseX;
	canvas.panStartY = canvas.mouseY;

	canvas.renderBlocks();

	if ( !canvas.traffic.running ) canvas.renderVehicles();

}

function keyDownListener ( e ) {

	var code = e.keyCode;

	switch ( code ) {

		case 49:

			canvas.isPanning = true;

			canvas.panStartX = canvas.mouseX;
			canvas.panStartY = canvas.mouseY;

			break;

		case 50:

			canvas.isZooming = true;

			canvas.zoomStartX = canvas.mouseX;
			canvas.zoomStartY = canvas.mouseY;

			break;

		case 51:

			canvas.isRotating = true;

			canvas.rotStartX = canvas.mouseX;
			canvas.rotStartY = canvas.mouseY;

		default:

			break;

	}


}

function keyUpListener ( e ) {

	var code = e.keyCode;

	switch ( code ) {

		case 49:

			canvas.isPanning = false;

			break;

		case 50:

			canvas.isZooming = false;

			canvas.offsetX += canvas.scale * canvas.zoomDeltaX;
			canvas.offsetY += canvas.scale * canvas.zoomDeltaY;

			break;

		default:

			break;

	}

}

Generator = function ( args ) {

	this.traffic = args.traffic;

	this.type = "Generator";

	this.x = args.x;
	this.y = args.y;

	this.generationRate = args.generationRate || 1;
	this.truckRatio = args.truckRatio || 0.05;
	this.maxVehicles = args.maxVehicles || 50;

	this.carSize = args.carSize || 3;
	this.truckSize = args.truckSize || 5;

};

Generator.prototype = {

	get position () {

		return new Vector2( this.x, this.y );

	},

	get width () {

		return this.to ? this.to.width : this.from.width;

	},

	get direction () {

		return this.to ? this.to.direction.multiplyScalar( -1 ) : this.from.direction;

	},

	get tangent () {

		return this.to ? this.to.tangent : this.from.tangent;

	},

	insertIntoLane: function ( lane, jD ) {

		var size = ( probability( this.truckRatio ) ) ? this.truckSize : this.carSize;

		if ( !this.to.vehicleAtLocation( lane, size / 2 ) ) {

			this.traffic.vehicle({
				length: size,
				location: this.to,
				lane: lane,
				startLane: lane,
				junctionDecision: ( jD !== undefined ) ? jD : randomWeighted([-1, 0, 1], [1, 2, 1]),
				minDistance: randomDistribution( 2, 1 )
			});

		}

	},

	init: function () {

		this.time = 0;
		this.totalTime = 0;
		this.vehiclesCount = 0;

		if (!this.to) {

			return;

		}

		this.direction = this.to.direction;
		this.laneCount = this.to.laneCount;
		this.width = this.to.width;

	},

	updateCustom: function ( deltaTime ) {


	},

	update: function ( deltaTime ) {

		return;

		if (!this.to) {

			return;

		}

		this.time += deltaTime;
		this.totalTime += deltaTime;

		if ( this.vehiclesCount < this.maxVehicles ) {

			if ( this.time >= this.generationRate ) {

				this.time -= this.generationRate;
				this.vehiclesCount++;

				var randomLane = Math.floor( Math.random() * this.laneCount );
				this.insertIntoLane( randomLane, -1 );

			}

		}

		this.updateCustom( deltaTime );

	},

}

// Junction Array Elements
// 0: North (0, 1)
// 1: East (1, 0)
// 2: South (0, -1)
// 3: West (-1, 0)

Junction = function ( args ) {

	this.traffic = args.traffic;

	this.type = "Junction";

    this.x = args.x;
    this.y = args.y;

    this.inComing = [undefined, undefined, undefined, undefined];
    this.outGoing = [undefined, undefined, undefined, undefined];

    this.inComingUnsorted = [];
    this.outGoingUnsorted = [];

    this.signalRate = 30;

};

Junction.prototype = {

	get position () {

		return new Vector2( this.x, this.y );

	},

	get direction () {

		return new Vector2(0, 0);

	},

	get tangent () {

		return new Vector2(0, 0);

	},

	init: function () {

		this.time = 0;
		this.totalTime = 0;

		for ( var r = 0; r < this.inComingUnsorted.length; r++ ) {

			var road = this.inComingUnsorted[r];

			switch ( road.direction.x.toString() + road.direction.y.toString() ) {

				case "0-1":

					this.inComing[0] = road;
					break;

				case "-10":

					this.inComing[1] = road;
					break;

				case "01":

					this.inComing[2] = road;
					break;

				case "10":

					this.inComing[3] = road;
					break;

			}

		}

		for ( var r = 0; r < this.outGoingUnsorted.length; r++ ) {

			var road = this.outGoingUnsorted[r];

			switch ( road.direction.x.toString() + road.direction.y.toString() ) {

				case "01":

					this.outGoing[0] = road;
					break;

				case "10":

					this.outGoing[1] = road;
					break;

				case "0-1":

					this.outGoing[2] = road;
					break;

				case "-10":

					this.outGoing[3] = road;
					break;

			}

		}

		this.width = 40;//this.inComing[0].width + this.inComing[2].width;
		this.height = 40;//this.inComing[1].width + this.inComing[3].width;

		this.signal = [[], [], [], []];

		for ( var r = 0; r < this.inComing.length; r++ ) {

			if ( this.inComing[r] ) {

				for ( var l = 0; l < this.inComing[r].laneCount; l++ ) {

					this.signal[r].push( true );

				}

			}

		}

		for ( var a = 0; a < this.signal.length; a++ ) {

			if ( this.signal[a] ) {
				this.minIndex = a;
				break;
			}

		}

		for ( var a = this.signal.length - 1; a >= 0; a-- ) {

			if ( this.signal[a] ) {
				this.maxIndex = a;
				break;
			}

		}

		this.invertSignal(this.minIndex);

	},

	to: function ( road, decision ) {

		var index = this.inComing.indexOf( road );

		var nextIndex;
		var array = this.outGoing;
		var count = 0;

		for ( var i = 0; i < array.length; i++ ) {

			if ( typeof array[i] === "undefined" ) {

				count++;

			}

		}

		if ( array.length - count === 2 ) {

			for ( var i = 0; i < this.outGoing.length; i++ ) {

				if ( this.outGoing[i] !== undefined && i !== index ) {

					nextIndex = i;

				}

			}

			return this.outGoing[nextIndex];

		} else {

			return this.outGoing[(index + decision + 2) % 4];

		}

	},

	update: function ( deltaTime ) {

		this.time += deltaTime;
		this.totalTime += deltaTime;

		if ( this.time >= this.signalRate ) {

			this.time -= this.signalRate;

			this.invertSignal(this.minIndex);
			this.invertSignal(this.maxIndex);

		}

	},

	invertSignal: function ( r ) {

		for ( var l = 0; l < this.signal[r].length; l++ ) {

			this.signal[r][l] = !this.signal[r][l];
			this.inComing[r].signal[l] = !this.inComing[r].signal[l];

		}

		this.traffic.renderBlocks();

	},

	changeSignal: function ( r, l, s ) {

		if ( s !== undefined ) {

			this.signal[r][l] = s;
			this.inComing[r].signal[l] = s;

		} else {

			for ( var a = 0; a < this.signal[r].length; a++ ) {

				this.signal[r][a] = l;
				this.inComing[r].signal[a] = l;

			}

		}

	},

};

// Fisher-Yates Shuffle

function shuffle ( array ) {

	var m = array.length, t, i;

	// While there remain elements to shuffle
  	while ( m ) {

		// Pick a remaining element
		i = Math.floor( Math.random() * m-- );

		// And swap it with the current element
    	t = array[m];
		array[m] = array[i];
		array[i] = t;

	}

	return array;

}

function randomWeighted ( list, weight ) {

	var totalWieght = weight.reduce(function (prev, cur, i, arr) {

		return prev + cur;

	});

	var random = Math.floor(Math.random() * totalWieght) + 1;
	var sum = 0;

	for (var i = 0; i < list.length; i++) {
		sum += weight[i];
		if (random <= sum) {
			return list[i];
		}
	}

}

function probability ( x ) {

	return ( Math.random() <= x ) ? true : false;

}

// [x] + ( x - [x] )probability

function rA ( x ) {

	var g = Math.floor(x);
	var a = (probability(x - g)) ? 1 : 0;

	return g + a;

}

// Distribution Auxiliary Function

function randomDTA () {

	return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;

}

function randomDistribution ( mean, sD ) {

	return mean + sD * randomDTA();

}

Road = function ( args ) {

	this.traffic = args.traffic;

	this.type = "Road";

	this.from = args.from;
	this.to = args.to;

	this.laneCount = args.laneCount || 5;
	this.laneWidth = args.laneWidth || 4;
	this.maxSpeed = args.maxSpeed || 27;

	this.init();

	this.safetyDistance = 5;

};

Road.prototype = {

	get width () {

		return this.laneWidth * this.laneCount;

	},

	get position() {

		return this.from.position.addVector( this.direction.multiplyScalar(20) );

	},

	get vector() {

		var v = new Vector2( this.to.x - this.from.x, this.to.y - this.from.y );

		return v.subVector( v.normal.multiplyScalar(40) );

	},

	get length() {

		return this.vector.length;

	},

	get direction() {

		return this.vector.normal;

	},

	get tangent() {

		return this.vector.tangent;

	},

	delta: function ( vehicle ) {

		var array = this.lane[vehicle.lane];
		var index = array.indexOf( vehicle );

		if ( index < array.length - 1 ) {

			return array[index + 1].localY - vehicle.maxLocalY;

		} else {

			if ( this.signal[vehicle.lane] ) {

				return this.traffic.maxVision;

			} else {

				return this.length - this.safetyDistance - vehicle.maxLocalY;

			}

		}

	},

	gamma: function ( vehicle ) {

		var array = this.lane[vehicle.lane];
		var index = array.indexOf( vehicle );

		if ( index > 0 ) {

			return vehicle.localY - array[index - 1].maxLocalY;

		} else {

			return vehicle.localY;

		}

	},

	deltaAtLocation: function ( lane, y ) {

		if ( this.vehicleAtLocation( lane, y ) ) {

			return 0;

		} else {

			var array = this.lane[lane];

			if ( array.length === 0 ) {

				if ( this.signal[lane] ) {

					return this.traffic.maxVision;

				} else {

					return this.length - y;

				}
			}

			if ( y >= array[array.length - 1].maxLocalY ) {

				if ( this.signal[lane] ) {

					return this.traffic.maxVision;

				} else {

					return this.length - y;

				}

			}

			if ( y <= array[0].localY ) return array[0].localY - y;

			for ( var i = 0; i < array.length - 1; i++ ) {

				vehicle = array[i];
				vehicleFront = array[i + 1];

				if ( vehicle.maxLocalY <= y && y <= vehicleFront.localY ) {

					return vehicleFront.localY - y;

				}

			}

			debug;

		}

	},

	gammaAtLocation: function ( lane, y ) {

		if ( this.vehicleAtLocation( lane, y ) ) {

			return 0;

		} else {

			var array = this.lane[lane];

			if ( !array[0] ) return y;

			if ( y <= array[0].localY ) return y;

			if ( y >= array[array.length - 1].maxLocalY ) return y - array[array.length - 1].maxLocalY;

			for ( var i = 0; i < array.length - 1; i++ ) {

				vehicle = array[i];
				vehicleFront = array[i + 1];

				if ( vehicle.maxLocalY <= y && y <= vehicleFront.localY ) {

					return y - vehicle.maxLocalY;

				}

			}

		}

	},

	vehicleFront: function ( vehicle ) {

		var array = this.lane[vehicle.lane];
		var index = array.indexOf( vehicle );

		return array[index + 1];

	},

	vehicleBehind: function ( vehicle ) {

		var array = this.lane[vehicle.lane];
		var index = array.indexOf( vehicle );

		return array[index - 1];

	},

	vehicleAtLocation: function ( lane, y ) {

		var array = this.lane[lane];

		if ( array.length === 0 ) return null;

		for ( var i = 0; i < array.length; i++ ) {

			vehicle = array[i];

			if ( vehicle.localY <= y && y < vehicle.maxLocalY ) {

				return vehicle;

			}

		}

		return null;

	},

	vehicleFrontLocation: function ( lane, y ) {

		var array = this.lane[lane];

		if ( array.length === 0 ) return null;

		if ( y > array[array.length - 1].maxLocalY ) return null;

		if ( y < array[0].localY ) return array[0];

		for ( var i = 0; i < array.length - 1; i++ ) {

			vehicle = array[i];
			vehicleFront = array[i + 1];

			if ( vehicle.maxLocalY < y && y < vehicleFront.localY ) {

				return vehicleFront;

			}

		}

		return null;

	},

	vehicleBehindLocation: function ( lane, y ) {

		var array = this.lane[lane];

		if ( !array[0] ) return null;

		if ( y < array[0].localY ) return null;

		if ( y > array[array.length - 1].maxLocalY ) return array[array.length - 1];

		for ( var i = 0; i < array.length - 1; i++ ) {

			vehicle = array[i];
			vehicleFront = array[i + 1];

			if ( vehicle.maxLocalY < y && y < vehicleFront.localY ) {

				return vehicle;

			}

		}

		return null;

	},

	init: function () {

		this.lane = [];

		this.signal = [];

		for ( var i = 0; i < this.laneCount; i++ ) {

			this.signal.push(true);

		}

		for ( var i = 0; i < this.laneCount; i++ ) {

			this.lane.push( [] );

		}

		if ( this.to.type == "Generator" ) {

			this.to.from = this;

		}

		if ( this.from.type == "Generator" ) {

			this.from.to = this;

			//GENERATION FUNCTION

			this.time = 0;
			this.totalTime = 0;
			this.vehiclesCount = 0;

			this.generationRate = this.from.generationRate || 1;
			this.truckRatio = this.from.truckRatio || 0.05;
			this.maxVehicles = this.from.maxVehicles || 50;

			this.carSize = this.from.carSize || 3;
			this.truckSize = this.from.truckSize || 5;


		}

		if ( this.from.type == "Junction" ) {

			this.from.outGoingUnsorted.push(this);

		}

		if ( this.to.type == "Junction" ) {

			this.to.inComingUnsorted.push(this);

		}

	},

	insertIntoLane: function ( lane, jD ) {

		jD = this.jD;

		var size = ( probability( this.truckRatio ) ) ? this.truckSize : this.carSize;

		if ( !this.vehicleAtLocation( lane, size / 2 ) ) {

			this.traffic.vehicle({
				length: size,
				location: this,
				lane: lane,
				startLane: lane,
				junctionDecision: ( jD !== undefined ) ? jD : randomWeighted([-1, 0, 1], [1, 2, 1]),
				minDistance: randomDistribution( 2, 1 )
			});

		}

	},

	updateCustom: function ( deltaTime ) {

		this.time += deltaTime;
		this.totalTime += deltaTime;

		if ( this.vehiclesCount < this.maxVehicles ) {

			if ( this.time >= this.generationRate ) {

				this.time -= this.generationRate;
				this.vehiclesCount++;

				var randomLane = Math.floor( Math.random() * this.laneCount );
				this.insertIntoLane( randomLane );

			}

		}

	},

	update: function ( deltaTime ) {

		if ( this.from.type === "Generator" ) {
			this.updateCustom( deltaTime );
		}

	},

};

Traffic = function ( args ) {

	this.aValue = 4 / 11;
	this.cValue = 2;
	this.eValue = 1;
	this.fValue = 1;
	this.hValue = 1;
	this.kValue = 0.5;
	this.qValue = 1;
	this.rValue = 1;
	this.zValue = 1;
	this.tMinValue = 3;
	this.tMaxValue = 10;
	this.maxVision = 300;

	this.maxAngle = 0.5;

	this.maxSpeed = 27;
	this.initialSpeed = 10;

	this.maxAcceleration = 4;
	this.minAcceleration = -4;
	this.initialAcceleration = 3;

	this.enableLaneChange = true;

	this.minLaneChangeY = 100;

	this.vehicles = [];
	this.vehiclesCrashed = [];

	this.roads = [];
	this.junctions = [];
	this.generators = [];

	this.totalTime = 0;

	this.fastForward = args.fastForward || 1;

	this.trafficContainer = document.getElementById("trafficContainer");

	if ( this.trafficContainer === null ) {

		this.trafficContainer = document.createElement( "div" );
		this.trafficContainer.id = "trafficContainer";
		document.body.appendChild( this.trafficContainer );

	}

	this.inputsContainer = document.createElement( "div" );
	this.inputsContainer.id = "inputsContainer";
	this.trafficContainer.appendChild( this.inputsContainer );

	this.canvas( args );

};

Traffic.prototype = {

	button: function ( args ) {

		var button = document.createElement( "input" );

		button.type = "button";
		button.value = args.label;
		button.id = args.label + "Button";

		var self = this;

		button.onclick = function () {

			self[args.func]();

		};

		this.inputsContainer.appendChild( button );

	},

	canvas: function ( args ) {

		args.traffic = this;
		var canvas = new Canvas( args );
		this.canvas = canvas;
	},

	junction: function ( args ) {

		args.traffic = this;
		var junction = new Junction( args );
		this.junctions.push( junction );
		return junction;

	},

	generator: function ( args ) {

		args.traffic = this;
		var generator = new Generator( args );
		this.generators.push( generator );
		return generator;

	},

	road: function ( args ) {

		args.traffic = this;
		var road = new Road( args );
		this.roads.push( road );
		return road;

	},

	link: function ( link1, link2 ) {

		this.road({
			from: link1,
			to: link2
		});

		this.road({
			from: link2,
			to: link1
		});

	},

	vehicle: function ( args ) {

		args.traffic = this;
		var vehicle = new Vehicle( args );
		this.vehicles.push( vehicle );
		return vehicle;

	},

	start: function () {

		if( !this.running ) {

			var self = this;

			self.lastTime = Date.now();
			self.running = true;

			self.init();
			self.renderBlocks();

			(function run(){
				self.animationFrame = window.requestAnimationFrame(run);
				self.update();
				self.renderVehicles();
			})();

		}

	},

	pause: function () {

		if ( this.running ) {

			this.running = false;
			window.cancelAnimationFrame( this.animationFrame );

		}

	},

	init: function () {

		for ( var j = 0; j < this.junctions.length; j++ ) {

			this.junctions[j].init();

		}

		for ( var g = 0; g < this.generators.length; g++ ) {

			this.generators[g].init();

		}

	},

	update: function () {

		this.currentTime = Date.now();
		this.deltaTime = ( this.currentTime - this.lastTime ) / 1000;
		this.lastTime = this.currentTime;

		this.deltaTime *= this.fastForward;

		this.totalTime += this.deltaTime;

		// console.log(this.deltaTime, this.totalTime);

		// document.getElementById('totalTime').innerHTML = this.totalTime;

		for ( var j = 0; j < this.junctions.length; j++ ) {

			this.junctions[j].update( this.deltaTime );

		}

		for ( var g = 0; g < this.generators.length; g++ ) {

			this.generators[g].update( this.deltaTime );

		}

		for ( var r = 0; r < this.roads.length; r++ ) {

			this.roads[r].update( this.deltaTime );

		}

		for ( var v = 0; v < this.vehicles.length; v++ ) {

			this.vehicles[v].update( this.deltaTime );

		}

	},

	reset: function () {

		this.pause();
		this.animationFrame = null;

		this.totalTime = 0;

		this.vehicles = [];
		this.roads = [];
		this.junctions = [];
		this.generators = [];

	},

	resetSimulation: function () {

		this.pause();
		this.animationFrame = null;

		this.totalTime = 0;

		this.vehicles = [];

		for ( var r = 0; r < this.roads.length; r++ ) {

			this.roads[r].init();

		}

		for ( var g = 0; g < this.generators.length; g++ ) {

			this.generators[g].init();

		}

		this.renderBlocks();

	},

	renderBlocks: function () {

		this.canvas.renderBlocks();

	},

	renderVehicles: function () {

		this.canvas.renderVehicles();

	},

	logConstants: function () {

		console.log("C: " + this.cValue);
		console.log("E: " + this.eValue);
		console.log("F: " + this.fValue);
		console.log("K: " + this.kValue);
		console.log("Z: " + this.zValue);
		console.log("tMin: " + this.tMinValue);
		console.log("tMax: " + this.tMaxValue);
		console.log("Max Vision: " + this.maxVision);

	},

	resize: function ( newWidth, newHeight ) {

		this.width = newWidth;
		this.height = newHeight;

		var canvas = this.canvas;
		canvas.width = newWidth;
		canvas.height = newHeight;

		var canvasBlocks = this.canvas.canvasBlocks;
		canvasBlocks.width = newWidth;
		canvasBlocks.height = newHeight;

		var canvasVehicles = this.canvas.canvasVehicles;
		canvasVehicles.width = newWidth;
		canvasVehicles.height = newHeight;

		canvas.contextBlocks.setTransform( 1, 0, 0, -1, 0, 0 );
		canvas.contextVehicles.setTransform( 1, 0, 0, -1, 0, 0 );

		canvas.contextBlocks.translate( 0, -canvas.height );
		canvas.contextVehicles.translate( 0, -canvas.height );


	}

}

Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

Vector2.prototype = {

	add: function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;

		return this;

	},

	sub: function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;

		return this;

	},

	addVector: function ( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;
	},

	subVector: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

		return this;

	},

    divideScalar: function ( s ) {

        if ( s !== 0 ) {

            this.x /= s;
            this.y /= s;

        } else {

            this.x = 0;
            this.y = 0;

        }

        return this;

    },

    translate: function (x, y) {

        this.x += x;
        this.y += y;

    },

    translateVector: function ( v ) {

        this.x += v.x;
        this.y += v.y;
    },

	isEqual: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

    isPerpendicular: function ( v ) {

        return ( this.x * v.x + this.y * v.y === 0 );

    },

    get lengthSquared () {

        return this.x * this.x + this.y + this.y;

    },

    get length () {

        return Math.sqrt( this.x * this.x + this.y * this.y );

    },

    normalize: function () {

        return this.divideScalar( this.length );

    },

	get clone () {

		return new Vector2( this.x, this.y );

	},

    get normal () {

        return this.clone.normalize();

    },

    // 0 1
    // -1 0

    get tangent () {

        return new Vector2( this.normal.y, -this.normal.x );

    },

    get angleRad () {

        return Math.acos( this.x / this.length );
    },

    get angleDeg () {

        return this.angleRad * 180 / Math.PI;

    },

    left: function ( v ) {

        return new Vector2( -v.y, v.x );

    },

    straight: function ( v ) {

        return v;

    },

    right: function ( v ) {

        return new Vector2( v.y, -v.x );

    }

};

Vehicle = function ( args ) {

	this.traffic = args.traffic;

	this.isStationary = args.isStationary || false;

	this.stopTime = 0;

	this.isAlerted = false;

	this.length = args.length || 3;
	this.width = args.width || 2;

	this.isTruck = this.length > 3;

	this.minDistance = args.minDistance === undefined ? 2 : args.minDistance;

	this.acceleration = this.traffic.initialAcceleration;
	this.maxAcceleration = ( 3 / this.length ) * this.traffic.maxAcceleration;
	this.minAcceleration = ( 3 / this.length ) * this.traffic.minAcceleration;

	this.aKeep = false;
	this.aTime = 0;

	this.speed = args.speed || this.traffic.initialSpeed;
	this.angle = 0;

	this.safeness = [Date.now() / 1000, Infinity];
	this.pastSafeness = [this.safeness[0] - 0.5, Infinity];
	this.veryPastSafeness = [this.safeness[0] - 1, Infinity];

	this.laneDecision = args.laneDecision === undefined ? 0 : args.laneDecision;
	this.junctionDecision = args.junctionDecision === undefined ? 0 : args.junctionDecision;
	this.wantedLaneDecision = args.wantedLaneDecision === undefined ? 0 : args.wantedLaneDecision;

	this.wantToChangeLane = false;

	this.isChangingLane = false;

	this.location = args.location;
	this.lane = args.lane;

	this.startLane = args.startLane;

	this.pLane = 0;

	this.partialX = args.partialX === undefined ? 0 : args.partialX;
	this.localY = args.localY === undefined ? 0: args.localY;

	this.timeSafeness = 0;
	this.totalTime = 0;

	this.setLocation( this.location, this.lane, this.localY );
};

Vehicle.prototype = {

	get localX () {

		return this.partialX + this.location.laneWidth * ( this.lane + 0.5 ) - ( this.width * 0.5 );

	},

	get centerLocalX () {

		return this.localX + ( this.width / 2 );

	},

	get maxLocalX () {

		return this.localX + this.width;

	},

	get centerLocalY () {

		return this.localY + ( this.length / 2 );

	},

	set centerLocalY ( y ) {

		this.localY = y - ( this.length / 2 );

	},

	get maxLocalY () {

		return this.localY + this.length;

	},

	get globalPosition () {

		return this.location.position.addVector( this.direction.multiplyScalar( this.localY ) )
											.addVector( this.tangent.multiplyScalar( this.localX ) );

	},

	get centerGlobalPosition () {

		var position = this.globalPosition;

		return position.addVector( this.direction.multiplyScalar( this.length / 2 ) )
						.addVector( this.tangent.multiplyScalar( this.width / 2 ) );

	},

	get maxGlobalPosition () {

		var position = this.globalPosition;

		return position.addVector( this.direction.multiplyScalar( this.length ) )
						.addVector( this.tangent.multiplyScalar( this.width ) );

	},

	get delta () {

		if ( this.isChangingLane ) {

			return Math.min(this.deltaSide( this.laneDecision ), this.location.delta( this ) );

		} else {

			return this.location.delta( this );

		}

	},

	get gamma () {

		if ( this.isChangingLane ) {

			return Math.min( this.gammaSide( this.laneDecision ), this.location.gamma( this ) );

		} else {

			return this.location.gamma( this );

		}

	},

	deltaSide: function ( i ) {

		if ( i === 0 ) {

			return this.location.delta( this );

		} else {

			return this.location.deltaAtLocation( this.lane + i, this.maxLocalY );

		}

	},

	gammaSide: function ( i ) {

		if ( i === 0 ) {

			return this.location.gamma( this );

		} else {

			return this.location.gammaAtLocation( this.lane + i, this.localY);

		}

	},

	get vehicleFront () {

		if ( this.isChangingLane ) return this.location.vehicleFrontLocation( this.lane + this.laneDecision, this.maxLocalY );
		return this.location.vehicleFront( this );

	},

	get vehicleBehind () {

		if ( this.isChangingLane ) return this.location.vehicleBehindLocation( this.lane + this.laneDecision, this.localY );
		return this.location.vehicieBehind( this );

	},

	get locationTo () {

		switch ( this.location.type ) {

			case "Road":

				if ( this.location.to.type === "Junction" ) {

					return this.location.to.to( this.location, this.junctionDecision );

				}

				return this.location.to;

				break;

			case "Junction":

				return this.location.to( this.location, this.junctionDecision );

				break;

			default:

				break;

		}

	},

	get locationFrom () {

		switch ( this.location.type ) {

			case "Road":

				return this.location.from;

				break;

			case "Junction":

				return this.location.locationsFrom;

				break;

			default:

				break;

		}

	},

	get direction () {

		return this.location.direction;

	},

	get tangent () {

		return this.location.tangent;

	},

	get velocity () {

		return this.direction.multiplyScalar( this.speed );

	},

	get color () {

		return this.acceleration / this.maxAcceleration;

	},

	get angle () {

		if ( this.laneDecision === 0 ) {

			return 0;

		} else {

			var a = this.traffic.aValue * this.location.laneWidth / this.speed;
			if ( a >= this.traffic.maxAngle ) a = this.traffic.maxAngle;
			return Math.asin( a );

		}

	},

	get speedX () {

		return Math.sin( this.angle ) * this.speed;

	},

	get speedY () {

		return Math.cos( this.angle ) * this.speed;

	},

	get maxSpeed () {

		return ( 3 / this.length ) * this.traffic.maxSpeed;

	},

	removeVehicle: function () {

		if ( this.futureBehindVehicle ) {

			this.futureBehindVehicle.futureFrontVehicle = null;
			this.futureBehindVehicle.isAlerted = false;

		}

		var array = this.traffic.vehicles;
		var index = array.indexOf(this);

		array.splice( index, 1 );

	},

	removeLocation: function () {

		switch ( this.location.type ) {

			case "Road":

				var location = this.location;
				var lane = this.lane;
				var index = location.lane[ lane ].indexOf( this );

				if ( index === -1 ) break;

				location.lane[ lane ].splice( index, 1 );

				break;

			default:

				break;

		}

	},

	setLocation: function ( location, lane, localY ) {

		switch ( location.type ) {

			case "Road":

				this.removeLocation();

				this.localY = localY;
				this.location = location;
				this.lane = lane;

				if (location.lane[lane].length === 0) {
					location.lane[lane].unshift( this );
					break;
				}

				if ( this.localY < location.lane[lane][0].localY ) {

					location.lane[lane].unshift( this );
					break;

				}

				if ( this.localY > location.lane[lane][location.lane[lane].length - 1].localY ) {

					location.lane[lane].push( this );
					break;

				}

				for ( var i = 0; i < location.lane[lane].length - 1; i++ ) {
					if ( location.lane[lane][i].localY < this.localY && this.localY < location.lane[lane][i + 1].localY ) {
						location.lane[ lane ].splice( i + 1, 0, this);
						break;
					}
				}

			case "Junction":

				this.location = location;

				break;

			case "Generator":

				if ( this.location.type === "Road") this.removeLocation();
				this.removeVehicle();

				break;

			default:

				break;

		}

	},

	checkCollision: function () {

		if ( !this.vehicleFront ) return;

		var colFront = this.delta <= 0;

		if ( colFront ) {

			this.collided = true;
			this.vehicleFront.collided = true;

			this.traffic.vehiclesCrashed.push(this);
			this.traffic.vehiclesCrashed.push(this.vehicleFront);

			this.acceleration = this.minAcceleration;
			this.vehicleFront.acceleration = this.vehicleFront.minAcceleration;

			this.removeVehicle();
			this.vehicleFront.removeVehicle();

			console.log("Collided!!");

		}

	},

	updateLane: function ( deltaTime ) {

		if ( this.location.type !== "Road" ) return;
		if ( this.laneDecision === 0 ) return;
		if ( !this.wantToChangeLane ) return;

		this.partialX += this.speedX * deltaTime * this.laneDecision;

		this.isChangingLane = true;

		if ( ( this.partialX >= this.location.laneWidth ) || ( this.partialX <= -this.location.laneWidth ) ) {

			this.partialX -= this.laneDecision * this.location.laneWidth;
			this.setLocation( this.location, this.lane + this.laneDecision, this.localY );

			this.wantToChangeLane = false;
			this.laneDecision = 0;
			this.wantedLaneDecision = 0;

			this.isChangingLane = false;

		}

	},

	attractivenessLaneDecision: function ( i ) {

		if ( this.lane + i < 0 || this.lane + i >= this.location.laneCount || ( this.deltaSide( i ) === 0 ) ) {

			return -1;

		} else {

			var deltaSide = this.deltaSide( i );
			var vehicleSideFront = this.location.vehicleFrontLocation( this.lane + i, this.localY);
			var sF = ( vehicleSideFront ) ? vehicleSideFront.speed : 0;
			var sM = this.maxSpeed;

			var truckState = this.isTruck ? 0 :
							( vehicleSideFront ?
								( vehicleSideFront.isTruck ? 1 : 0 ) :
								0 );

			var pLane;

			pLane = 1 - ( sF / sM ) * Math.pow( this.delta / deltaSide , this.traffic.hValue );

			pLane = Math.max( Math.min( pLane, 1), 0 );

			pLane = Math.pow( pLane, this.traffic.qValue / ( 1 + this.traffic.rValue * truckState ) );

			if (isNaN(pLane)) debug;
			return pLane;

		}

	},

	isSafeLaneDecision: function ( i ) {

		if ( this.lane + i < 0 || this.lane + i >= this.location.laneCount ) {

			return false;

		}

		if ( this.location.vehicleAtLocation( this.lane + i, this.localY ) ) {

			return false;

		}

		var vehicleSideBehind = this.location.vehicleBehindLocation( this.lane + i, this.localY );

		if ( !vehicleSideBehind ) {

			return true;

		}

		var s = vehicleSideBehind.speed;

		if ( this.speed === 0 ) return true;

		if ( s > 3 * this.speed ) {

			return false;

		}

		if ( this.gammaSide( i ) <= this.safetyDistance * 0.5 ) {

			return false;

		}

		return true;

	},

	updateLaneDecision: function ( deltaTime ) {

		if ( this.junctionDecision === 0 ) {

			var a = [this.attractivenessLaneDecision( -1 ), this.attractivenessLaneDecision( 0 ), this.attractivenessLaneDecision( 1 )];

			// wLDI - wantedLaneDecisionIndex = wantedLaneDecision + 1
			var wLDI = a.indexOf(Math.max.apply(null, a));

			if (wLDI === -1) debug;

			if ( a[wLDI] === a[1] ) {

				wLDI = 1;

			}

			this.wantedLaneDecision = wLDI - 1;

		} else {

			this.wantedLaneDecision = this.junctionDecision;

		}

		if ( !this.wantToChangeLane ) {

			var pLane;

			if ( this.junctionDecision === 0) {

				if ( this.vehicleFront ) {

					pLane = this.attractivenessLaneDecision( this.wantedLaneDecision );

				if (isNaN(pLane)) debug;

				} else {

					pLane = 0;

				}

				this.timeLaneChange = ( 1 - pLane ) * this.traffic.tMinValue + pLane * this.traffic.tMaxValue;

			} else {

				var l = this.location.length;

				var n = ( this.wantedLaneDecision > 0 ) ? this.location.laneCount - 1 - this.lane : this.lane;
				//var d = this.location.length - this.maxLocalY;

				if ( n === 0 ) n = 1;

				pLane = Math.pow( this.maxLocalY / l, 1 / n );

				if (isNaN(pLane)) debug;

				this.timeLaneChange = this.traffic.tMinValue / Math.pow( 1 - pLane, this.traffic.zValue);

			}

			this.pLane = pLane;

			if ( probability( pLane ) ) {
				this.wantToChangeLane = true;
			} else {
				this.wantedLaneDecision = 0;
			}

		}

		if ( this.isSafeLaneDecision( this.wantedLaneDecision ) ) {

			this.laneDecision = this.wantedLaneDecision;

		} else {

			this.laneDecision = 0;

		}

		if ( this.timeLaneChange > 0 ) {

			this.timeLaneChange -= deltaTime;

		} else {

			this.timeLaneChange = 0;
			this.wantedLaneDecision = 0;
			this.laneDecision = 0;
			this.wantToChangeLane = false;

		}

	},

	get safetyDistance () {

		var sl = this.speed * this.speed * 81 / 625;

		return ( this.length / 3 ) * sl;

	},

	updateSpeed: function ( deltaTime ) {

		var s = this.speed;

		var svf = ( this.vehicleFront ) ? this.vehicleFront.speed : s;

		var svsf = s;

		if ( this.isChangingLane ) {
			svsf = this.location.vehicleFrontLocation( this.lane, this.maxLocalY ) ? this.location.vehicleFrontLocation( this.lane, this.maxLocalY ).speed : Infinity;
		}

		var sF = Math.min( svf , svsf );

		var sM = this.maxSpeed;

		//---------------------------------------
		// Calculating safenessValue

		var newSafenessValue;

		if ( this.delta > this.traffic.maxVision ) {

			newSafenessValue = Infinity;

		} else {

			var nSVAux = this.delta - this.minDistance - this.safetyDistance - ( s - sF );
			newSafenessValue = (nSVAux > 0) ? this.traffic.kValue * nSVAux: nSVAux;

		}

		//---------------------------------------

		//---------------------------------------
		// Calculating newAcceleration

		var newAcceleration;

		if ( s < sM - this.traffic.eValue ) {

			newAcceleration = this.maxAcceleration * Math.pow( 1 - s / sM, this.traffic.fValue );

		} else if ( sM - this.traffic.eValue <= s && s <= sM + this.traffic.eValue ) {

			newAcceleration = 0;

		} else if ( sM + this.traffic.eValue < s ) {

			newAcceleration = this.maxAcceleration * ( 1 - s / sM );

		}

		//---------------------------------------
		// Getting oldSafenessValue

		var newSafeness = [Date.now() / 1000, newSafenessValue];

		var veryPastTime = Math.abs( newSafeness[0] - this.veryPastSafeness[0] - 1 );
		var pastTime = Math.abs( newSafeness[0] - this.pastSafeness[0] - 1 );

		var oldSafenessValue = ( veryPastTime < pastTime ) ? this.veryPastSafeness[1] : this.pastSafeness[1];

		//---------------------------------------

		//---------------------------------------
		// Calculating acceleration for lane decision

		var p = this.pLane;
		var a = ( probability(p) ) ? 1 : 0;
		var laneAcceleration = a * Math.pow( p, this.traffic.cValue ) * s;

		//---------------------------------------

		newAcceleration = Math.min( oldSafenessValue - s, newAcceleration);

		if ( this.laneDecision !== 0 ) {

			newAcceleration = Math.min( -laneAcceleration, newAcceleration );

		}

		newAcceleration = Math.max( this.minAcceleration, newAcceleration );

		newAcceleration = randomDistribution( newAcceleration, 1 );

		var newSpeed = s + newAcceleration * deltaTime;
		newSpeed = Math.max( 0, newSpeed );

		this.speed = newSpeed;
		this.acceleration = ( newSpeed - s ) / deltaTime;

		this.timeSafeness += deltaTime;

		if ( this.timeSafeness >= 0.5 ) {

			this.timeSafeness -= 0.5;
			this.veryPastSafeness = this.pastSafeness;
			this.pastSafeness = this.safeness;
			this.safeness = newSafeness;

		}

	},

	updateLocation: function ( deltaTime ) {

		switch ( this.location.type ) {

			case "Road":

				var newLocalY = this.localY + this.speedY * deltaTime;
				var diff = newLocalY + this.length - this.location.length;

				if ( diff < 0 ) {

					this.localY = newLocalY;

				} else {

					this.location.vehiclesCount--;
					this.setLocation( this.locationTo, this.lane, diff );

				}

				break;

			default:

				break;

		}

	},

	updateCustom: function ( deltaTime ) {

	},

	update: function ( deltaTime ) {

		if ( this.isStationary ) return;

		//if ( this.traffic.checkCollision ) this.checkCollision();

		if ( this.speed !== 0 ) {

			this.isStop = false;
			this.stopTime = 0;

		} else {

			this.isStop = true;
			this.stopTime += deltaTime;

		}

		if ( this.stopTime >= 40 && this.delta <= 0 ) {

			this.removeLocation();
			this.removeVehicle();

		}

		if ( this.traffic.enableLaneChange && this.localY >= this.traffic.minLaneChangeY ) {
		this.updateLaneDecision( deltaTime );	// Update Lane Decision
		}

		this.updateLane( deltaTime );			// Update Lane

		this.updateSpeed( deltaTime );			// Update Speed

		this.updateLocation( deltaTime );		// Update Location

		this.updateCustom( deltaTime );

		this.totalTime += deltaTime;

	},

};
