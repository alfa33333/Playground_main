const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const TEXTURE_SIZE = 32;
const NUM_TEXTURES = 3;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;
const TEXTURE_SCALE = (TEXTURE_SIZE/TILE_SIZE);

const MINIMAP_SCALE_FACTOR = 0.2;

var figures= [];
var texture1;
var texturesArray = [];

function preload(){
    for( var i = 1; i < NUM_TEXTURES + 1 ; i++){
        figures.push( loadImage('./assets/texture'+i+'.png'));
    }
}

class Map {
    constructor() {
        this.grid = [
            [1, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 6, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 1],
            [1, 0, 0, 3, 0, 0, 1, 0, 0, 3, 1, 0, 1, 0, 1],
            [1, 0, 0, 3, 3, 0, 0, 0, 5, 3, 5, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 0, 2, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    getWallContentAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return 1;
        }
        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX];
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] != 0 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2.3;
        this.y = WINDOW_HEIGHT / 1.5;
        this.radius = 4;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle =3 * Math.PI / 2;
        this.moveSpeed = 4.0;
        this.rotationSpeed = 3 * (Math.PI / 180);
    }
    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        var moveStep = this.walkDirection * this.moveSpeed;

        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (grid.getWallContentAt(newPlayerX, newPlayerY) == 0) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill("blue");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius
        );
        stroke("blue");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
            MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;
        this.hitWallColor = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(columnId) {
        var xintercept, yintercept;
        var xstep, ystep;

        ///////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;
        var horzWallColor = 0;

        // Find the y-coordinate of the closest horizontal grid intersenction
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // Find the x-coordinate of the closest horizontal grid intersection
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        // if (this.isRayFacingUp)
        //     nextHorzTouchY--;

        // Increment xstep and ystep until we find a wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            var wallGridContent = grid.getWallContentAt(nextHorzTouchX,nextHorzTouchY - (this.isRayFacingUp ? 1 : 0 ) );
            if (wallGridContent != 0) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                horzWallColor = wallGridContent;
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        ///////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;
        var vertWallColor = 0;

        // Find the x-coordinate of the closest vertical grid intersenction
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // Find the y-coordinate of the closest vertical grid intersection
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        // if (this.isRayFacingLeft)
        //     nextVertTouchX--;

        // Increment xstep and ystep until we find a wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            var wallGridContent = grid.getWallContentAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY);
            if (wallGridContent != 0) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                vertWallColor = wallGridContent;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // Calculate both horizontal and vertical distances and choose the smallest value
        var horzHitDistance = (foundHorzWallHit)
            ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit)
            ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        // only store the smallest of the distances
        if (vertHitDistance < horzHitDistance) {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = vertHitDistance;
            this.hitWallColor = vertWallColor;
            this.wasHitVertical = true;
        } else {
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horzHitDistance;
            this.hitWallColor = horzWallColor;
            this.wasHitVertical = false;
        }
    }
    render() {
        stroke("rgba(255, 0, 0, 1.0)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    var columnId = 0;

    // start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    // loop all columns casting the rays
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;

        columnId++;
    }
}

function render3DProjectedWalls() {
    // loop every ray in the array of rays
    // var specialRayCounter =  0;
    //puppy.loadPixels();
    loadPixels(); 
    // let c;
    //puppy.loadPixels();
    for (var i = 0; i < NUM_RAYS; i++) {

        // if (!(i==2 || i==8)){
        //     fill(255, 204, 0);
        //     noStroke();
            
        //     rect(i*32, 20, 32, 60);
        //     } else {
        //       printfiguretest(puppy, i*32, 20, 1, 1, 0, 32 );
        //     }

        
        var ray = rays[i];
        

        // get the perpendicular distance to the wall to fix fishbowl distortion
        var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        // calculate the distance to the projection plane
        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        // projected wall height
        var wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

        // compute the transparency based on the wall distance
        var alpha =   255*(100/correctWallDistance);
        
        if (ray.hitWallColor < 4 ){
        // set the correct color based on the wall hit grid content (1=Red, 2=Green, 3=Blue)
        var colorR = ray.hitWallColor == 1 ? 255 : ray.hitWallColor == 2 ? 0 : ray.hitWallColor == 3 ? 0 : 255;
        var colorG = ray.hitWallColor == 1 ? 0 : ray.hitWallColor == 2 ? 255 : ray.hitWallColor == 3 ? 0 : 255;
        var colorB = ray.hitWallColor == 1 ? 0 : ray.hitWallColor == 2 ? 0 : ray.hitWallColor == 3 ? 255 : 255;
        // fill("rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + alpha + ")");
        // noStroke();
        // fill(255, 204, 0);
        // // render a rectangle with the calculated wall height
        // rect(
        //    i * WALL_STRIP_WIDTH,
        //    (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
        //    WALL_STRIP_WIDTH,
        //    wallStripHeight
        // );
        writerect(
            i * WALL_STRIP_WIDTH,
            Math.floor((WINDOW_HEIGHT / 2)- (wallStripHeight / 2)) + 1,
            WALL_STRIP_WIDTH,
            wallStripHeight,
            [colorR,colorG,colorB,alpha]
        );
        // console.log(alpha, correctWallDistance);
        // console.log(i,'ok')
        
        } else {
                texture1 = texturesArray[ray.hitWallColor- 4];
                printfigure(
                texture1,
                i * WALL_STRIP_WIDTH,
                Math.floor((WINDOW_HEIGHT / 2)- (wallStripHeight / 2)) + 1,
                TEXTURE_SCALE*Math.floor((ray.wallHitX)%TILE_SIZE),
                WALL_STRIP_WIDTH,
                wallStripHeight,
                alpha
                );
          } 
    }
    updatePixels();
}

function printfigure(test,  xoffset, yoffset, xorigin, deltax,deltay, alpha){
    //test.loadPixels();
    
    //console.log(yoffset)
    //yoffset = Math.floor(yoffset)+1;
    var index;
    var index2;
    var Rcolor;
    var Gcolor;
    var Bcolor;
    // set((xoffset),(yoffset),[255,255,255,255]); 
    for (var y = 0;  y < deltay; y++){
        index = ((xorigin)  + ( Math.floor(y*TEXTURE_SIZE/deltay)) * TEXTURE_SIZE)*4;
        Rcolor = test[index + 0];  //test.pixels[index + 0]; //puppyarray[index + 0];
        Gcolor = test[index + 1]; //test.pixels[index + 1];
        Bcolor = test[index + 2]; //test.pixels[index + 2];
      for (var x = 0 ; x < deltax ; x++){
          if (x + xoffset - xorigin >= WINDOW_WIDTH){
            break;
          }
        //index = ((xorigin + Math.floor(scalex*x/deltax)) + ( Math.floor(y*test.height/deltay)) * test.width)*4;
        //set((x + xoffset),(y + yoffset),[Rcolor,Gcolor,Bcolor, 255]);
        
        index2 = ((x + xoffset)+ (y+yoffset) *width)*4;

        pixels[index2 + 0] = Rcolor;
        pixels[index2 + 1] = Gcolor;
        pixels[index2 + 2] = Bcolor;
        pixels[index2 + 3] = alpha;
      }
    }
           
  }
 
 function writerect( xoffset, yoffset,deltax,deltay ,c){

    for (var y = 0;  y < deltay; y++){
      for (var x = 0 ; x < deltax ; x++){
          if (x + xoffset >= WINDOW_WIDTH){
            break;
          }
        pixels[((x + xoffset)+ (y+yoffset) *width)*4 + 0] = c[0];
        pixels[((x + xoffset)+ (y+yoffset) *width)*4 + 1] = c[1];
        pixels[((x + xoffset)+ (y+yoffset) *width)*4 + 2] = c[2];
        pixels[((x + xoffset)+ (y+yoffset) *width)*4 + 3] = c[3]; 
      }
    }
           
  }

  
function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function setup() {
    var canvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    canvas.parent('sketch-div');
    pixelDensity(1);
    loadTextures();
    frameRate(60);
}

function loadTextures(){

    for(var i = 0; i < NUM_TEXTURES; i++){
        figures[i].loadPixels();
        texturesArray.push(figures[i].pixels);
    }
    
    
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    background("#111");
    update();
    
    render3DProjectedWalls();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();

}
