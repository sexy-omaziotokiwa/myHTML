let gameSpeed = 1;
const BLUE = {r: 0x67, g: 0xd7, b: 0xf0};
const GREEN = {r: 0xa6, g: 0xe0, b: 0x2c};
const PINK = {r: 0xfa, g:0x24, b: 0x73};
const ORANGE = {r: 0xfe, g: 0x95, b: 0x22};
const allColors = [BLUE, GREEN, PINK, ORANGE];

//Gamelay
const getSpawnDelay = () => {
    const spawnDelayMax = 1400;
    const spawnDelayMin = 500;
    const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
    return Math.max(spawnDelay, spawnDelayMin)
}

const doubleStrongEnableScore = 2000;

// nunmber of cubes that must be smashed before activating a feature.
const slowmoThreshold = 10;
const strongThreshold = 25;
const spinnerThreshold = 25;

// interaction state
let pointIsDown = false;

// last known position of the primary point in screen coordinates.
let pointerScreen = {x: 0, y: 0};

// same as pointerScreen, but converted to scene coordinates in rAF
let pointerScene = {x: 0, y: 0};

// minimum speed of pointer before "hits" are counted
const minPointerSpeed = 60;

// the hit speed affects the direction of the target post-hit
// this number dampens the force
const hitDampening = 0.1;

// backboard receives shadows and is the farthest negative Z position of entities
const backboardZ = -400;
const shadowColor = '#262e36';

// how much air drag is applied to standard objects
const airDrag = 0.022;
const gravity = 0.3;

// spark config
const sparkColor = 'rgba(170, 221, 255, 0.9)';
const sparkThickness = 2.2;
const airDragSpark = 0.1;

// track pointer positions to show trail
const touchTrailColor = 'rgba(170, 221, 255, 0.62)';
const touchTrailThickness = 7;
const touchPointLife = 120;
const touchPoints = [];

// size of in-game targets. this affects rendered size and hit area
const targetRadius = 40;
const targetHitRadius = 50;
const makeTargetGlueColor = target => {
    //const alpha = (target.health - 1) / (target.maxHealth - 1);
    //return 'rgba(170, 221, 255, ${alpha, toFixed(3)});
    return 'rgb(170, 221, 255)';
}

// size of target fragments
const FragRadius = targetRadius/3;

// game canvas element needed in setup.js and interaction.js
const canvas = document.querySelector('#canvas');

// 3d camera config
// affects perspective
const cameraDistance = 900;

// does not affect perspective
const sceneScale = 1;

// objects that gert too close to the camera will be faded out to transparent over this range.
// const cameraFadeStartZ = 0.8*cameraDistance - 6*targetRadius;
const cameraFadeStartZ = 0.45*cameraDistance;
const cameraFadeEndZ = 0.65*cameraDistance;
const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

// global variables to accumulate all vertices/polygons in each frame
const allVertices = [];
const allPolys = [];
const allShadowVertices = [];
const allShadowPolys = [];


// state.js
// Game Modes
const GAME_MODE_RANKED = Symbol('GAME_MODE_RANKED');
const GAME_MODE_CASUAL = Symbol('GAME_MODE_CASUAL');

// AVAILABLE MENUS
const MENU_MAIN = Symbol('MENU_MAIN');
const MENU_PAUSE = Symbol('MENU_PAUSE');
const MENU_SCORE = Symbol('MENU_SCORE');


/////////////////
// Global state//
/////////////////
const state = {
    game: {
        mode: GAME_MODE_RANKED,
        time: 0, // run time of current game
        score: 0, // player score
        cubeCount: 0 // total number of cubes smashed
    },
    menus: {
        // set to 'null' to hide all menus
        active: MENU_MAIN
    }
};

///////////////////////////
// Global state Selectors//
//////////////////////////

const isInGame = () => !state.menus.active;
const isMenuVisible = () => !!state.menus.active;
const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
const isPaused = () => state.menus.active === MENU_PAUSE;


///////////////////
// Local Storage //
///////////////////

const highScoreKey = '__menja__highScore';
const getHighScore = () => {
    const raw = localStorage.getItem(highScoreKey);
    return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getHighScore();
const setHighScore = score => {
    _lastHighscore = getHighScore();
    localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.score > _lastHighscore;

// utils.js

const invariant = (condition, message) => {
    if (!condition) throw new Error(message);
};

/////////
// DOM //
/////////

const $ = selector => document.querySelector(selector);
const handleClick = (element, handler) => element.addEventListener('click', handler);
const handlePointerDown = (element, handler) => {
    element.addEventListener('touchstart', handler);
    element.addEventListener('mousedown', handler);
};

///////////////////////
// Formatting Helpers//
///////////////////////

// converts a number into a formatted string with thousand separators.
const formateNumber = num => num.toLocaleString();

///////////////////
// math constants//
///////////////////

const PI = Math.PI;
const TAU = Math.PI * 2;
const ETA = Math.PI * 0.5;

/////////////////
// Math helpers//
/////////////////

//clamps a number betwwen min and max values (inclusive)
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// linearly interpolate between numbers a and b by a specific amount.
// mix >= 0 && mix <= 1
const interpolate = (a, b, mix) => ((b-a) * mix + a);


///////////////////
// Random helpers//
///////////////////

// generates a random number between and [min, max)
const random = (min, max) => Math.random() * (max - min) + min;

// generates a random integer between and possibly included min and max values
const randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

// returns a random element from an array
const pickOne = arr => arr[Math.random() * arr.length | 0];


//////////////////
// Color helpers//
//////////////////

// converts an {r,g,b} color object to a 6-digit hex code.
const colorToHex = color => {
    return '#' +
        (color.r | 0).toString(16).padStart(2, '0') +
        (color.g | 0).toString(16).padStart(2, '0') +
        (color.b | 0).toString(16).padStart(2, '0');
};

// operates on an {r,g,b} color object
// returns string hex code
// 'lightness' must range from 0 to 1, 0 is pure black, 1 is pure white
const shadeColor = (color, lightness) => {
    let other, mix;
    if (lightness < 0.5) {
        other = 0;
        mix = 1 - (lightness * 2);
    }
    else {
        other = 255;
        mix = lightness * 2 - 1;
    }
    return '#' +
    (interpolate(color.r, other, mix) | 0).toString(16).padStart(2, '0') +
    (interpolate(color.g, other, mix) | 0).toString(16).padStart(2, '0') +
    (interpolate(color.b, other, mix) | 0).toString(16).padStart(2, '0');
};


///////////////////
// Timing helpers//
///////////////////

const _allCooldowns = [];

const makeCooldown  = (rechargeTime, units = 1) => {
    let timeRemaining = 0;
    let lastTime = 0;
    const initialOptions = {rechargeTime, units};

    const updateTime = () => {
        const now = state.game.time;
        // reset time remaining if time goes backwards.
        if (now < lastTime) timeRemaining = 0;
        else {
            timeRemaining -= now - lastTime;
            if (timeRemaining < 0) timeRemaining = 0;
        }
        lastTime = now;
    };

    const canUse = () => {
        updateTime();
        return timeRemaining <= (rechargeTime * (units - 1));
    };

    const cooldown = {
        canUse,
        useIfAble() {
            const usable = canUse();
            if (usable) timeRemaining += rechargeTime;
            return usable;
        },
        mutate(options) {
            if (options.rechargeTime) {
                // apply recharge time delta so change takes effect immediately
                timeRemaining -= rechargeTime - options.rechargeTime;
                if (timeRemaining < 0) timeRemaining = 0;
                rechargeTime = options.rechargeTime;
            }
            if (options.units) units = options.units;
        },

        reset() {
            timeRemaining = 0;
            lastTime = 0;
            this.mutate(initialOptions);
        }
    };

    _allCooldowns.push(cooldown);
    return cooldown;
};

const resetAllCooldowns = () => _allCooldowns.forEach(cooldown => cooldown.reset());

const makeSpawner = ({chance, cooldownPerSpawn, maxSpawns}) => {
    const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
    return {
        shouldSpawn() {
            return Math.random() <= chance && cooldown.useIfAble();
        },
        mutate(options) {
            if (options.chance) chance = options.chance;
            cooldown.mutate({
                rechargeTime: options.cooldownPerSpawn,
                units: options.maxSpawns
            });
        }
    };
};


////////////////////
// Vector Helpers //
////////////////////

const normalize = v => {
    const mag = Math.hypot(v.x, v.y, v.z);
    return {
        x: v.x/mag,
        y: v.y/mag,
        z: v.z/mag
    };
}

// curried math helpers
const add = a => b => a+b;
// curried vector helpers
const scaleVector = scale => vector => {
    vector.x *= scale;
    vector.y *= scale;
    vector.z *= scale;
};


////////////////
// 3D Helpers //
////////////////

// clone array and all veertices
function cloneVertices(vertics) {
    return vertics.map(v => ({x: v.x, y: v.y, z: v.z}));
}

// copy vertex data from one array into another
// arrays must be the same length.
function copyVerticesTo(arr1, arr2) {
    const len = arr1.length;
    for(let i = 0; i < len; i++) {
        const v1 = arr1[i];
        const v2 = arr2[i];
        v2.x = v1.x;
        v2.y = v1.y;
        v2.z = v1.z;
    }
}

// compute triangle midpoint
// mutates 'middle' property of given 'poly'

function computeTriMiddle(poly) {
    const v = poly.vertics;
    poly.middle.x = (v[0].x + v[1].x + v[2].x)/3;
    poly.middle.y = (v[0].y + v[1].y + v[2].y)/3;
    poly.middle.z = (v[0].z + v[1].z + v[2].z)/3;
}


// compute quadriletarl midpoint
// mutates 'middle' property of given 'poly'

function computeQuadMiddle(poly) {
    const v = poly.vertics;
    poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x)/4;
    poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y)/4;
    poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z)/4;
}

function computePolyMiddle(poly) {
    if (poly.vertics.length === 3) 
        computeTriMiddle(poly);
    else
        computeQuadMiddle(poly);
}

// compute distance from any polygon (tri or quad) midpoint to camera
// sets 'depth' property of give 'poly'
// also triggers midpoint calculation, which mutates 'middle' property of 'poly'
function computePolyDepth(poly) {
    computePolyMiddle(poly);
    const dx = poly.middle.x;
    const dy = poly.middle.y;
    const dz = poly.middle.z - cameraDistance;
    poly.depth = Math.hypot(dx, dy, dz)
}

// compute normal of any polygon, uses normalized vector cross product
// mutates 'normalName' property of given 'poly'
function computePolyNormal(poly, normalName) {
    // store quick refs to vertices
    const v1 = poly.vertics[0];
    const v2 = poly.vertics[1];
    const v3 = poly.vertics[2];

    // calculate difference of vertices, following winding order
    const ax = v1.x - v2.x;
    const ay = v1.y - v2.y;
    const az = v1.z - v2.z;
    const bx = v1.x - v3.x;
    const by = v1.y - v3.y;
    const bz = v1.z - v3.z;

    // cross product
    const nx = ay*bz - az*by;
    const ny = az*bx - ax*bz;
    const nz = ax*by - ay*bx;

    // compute magnitude of normal and normalize
    const mag = Math.hypot(nx, ny, nz);
    const polyNormal = poly[normalName];
    polyNormal.x = nx/mag;
    polyNormal.y = ny/mag;
    polyNormal.z = nz/mag;
}

// apply translation/rotation/scale to all given vertices
// if 'vertices' and 'target' are the same Array, the vertices will be mutated in place
// if 'vertices' and 'target' are different arrays, vertices will not be touched, instead
// the transformed values from 'vertices' will be written to 'target' array
function transformVertices(vertices, target, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    // matrix multiplicationn constants only need calculated once for all vertices.
    const sinX = Math.sin(rx);
    const cosX = Math.cos(rx);
    const sinY = Math.sin(ry);
    const cosY = Math.cos(ry);
    const sinZ = Math.sin(rz);
    const cosZ = Math.cos(rz);

    // using foreach() like map(), but with a (recycled) target array
    vertices.forEach((v, i) => {
        const targetVertex = target[i];
        // x axis rotation
        const x1 = v.x;
        const y1 = v.z*sinX + v.y*cosX;
        const z1 = v.z*cosX - v.y*sinX;

        // y axis rotation
        const x2 = x1*cosY - z1*sinY;
        const y2 = y1;
        const z2 = x1*sinY + z1*cosY;

        // z axis rotation
        const x3 = x2*cosZ - y2*sinZ;
        const y3 = x2*sinZ + y2*cosZ;
        const z3 = z2;

        // scale, translate, and set the transform
        targetVertex.x = x3 * sx + tx;
        targetVertex.y = y3 * sy + ty;
        targetVertex.z = z3 * sz + tz;
    });
}

// 3d projection on a single vertex
// directly mutates the vertex
const projectVertex = v => {
    const focalLength = cameraDistance * sceneScale;
    const depth = focalLength/(cameraDistance - v.z);
    v.x *= depth;
    v.y *= depth;
};

// 3d projection on a single vertex
// mutates a secondary target vertex
const projectVertexTo = (v, target) => {
    const focalLength = cameraDistance - sceneScale;
    const depth = focalLength/(cameraDistance - v.z);
    target.x = v.x * depth;
    target.y = v.y * depth;
};

// perf.js
/////////////////////
////////////////////

// dummy no-op functions
// i use these in a special build for custom performance profiling
const PERF_START = () => {};
const PERF_END = () => {};
const PERF_UPDATE = () => {};

// 3dModels.js
///////////////////////////
//////////////////////////

// define models once. the origin is the center of the model

// a simple cube, 8 vertices, 6 quads
// defaults to an edge length of 2 units, can be influenced with 'scale'
function makeCubeModel({scale=1}) {
    return {
        vertices: [
            // top
            {x: -scale, y: -scale, z: scale},
            {x:  scale, y: -scale, z: scale},
            {x:  scale, y:  scale, z: scale},
            {x: -scale, y:  scale, z: scale},
            // bottom
            {x: -scale, y: -scale, z: -scale},
            {x:  scale, y: -scale, z: -scale},
            {x:  scale, y:  scale, z: -scale},
            {x: -scale, y:  scale, z: -scale},
        ],
        polys: [
            // z = 1
            {vIndexes: [0,1,2,3]},
            // z = -1
            {vIndexes: [7,6,5,4]},
            // y = 1
            {vIndexes: [3,2,6,7]},
            // y = -1
            {vIndexes: [4,5,1,0]},
            // x = 1
            {vIndexes: [5,6,2,1]},
            // x = -1
            {vIndexes: [0,3,7,4]}
        ]
    };
}

// not very optimized - lots of duplicate vertices are generated
function makeRecursiveCubeModel({ recursionLevel, splitFn, color, scale=1}) {
    const getScaleAtLevel = level => 1/ (3**level);

    // we can model level 0 manually. it's just a single, centered cube
    let cubeOrigins = [{x:0, y:0, z:0}];

    // recursively replace cubes with smaller cubes.
    for (let i = 1; i <= recursionLevel; i++) {
        const scale = getScaleAtLevel(i) * 2;
        const cubeOrigins2 = [];
        cubeOrigins.forEach(origin => {
            cubeOrigins2.push(...splitFn(origin, scale));
        });
        cubeOrigins = cubeOrigins2;
    }

    const finalModel = {vertices: [], polys: []};

    //  generate single cube model and scale it.
    const cubeModel = makeCubeModel({scale: 1});
    cubeModel.vertices.forEach(scaleVector(getScaleAtLevel(recursionLevel)));

    // compute the max distance x, y, or z origin values wil be
    // same result as 'Math.max(...cubeOrigins.map(o => o.x))', but much faster
    const maxComponent = getScaleAtLevel(recursionLevel) * (3**recursionLevel - 1);

    // place cube geometry at each origin
    cubeOrigins.forEach((origin, cubeIndex) => {
        // to compute occlusion(shading), find origin component with greatest magnitued
        // and normalize it relative to 'maxComponent'
        const occlusion = Math.max(
            Math.abs(origin.x),
            Math.abs(origin.y),
            Math.abs(origin.z)
        )/maxComponent;

        // at lower iterations, occlusion looks better lightened up a bit
        const occlusionLighter = recursionLevel > 2 ? occlusion : (occlusion + 0.8)/1.8;

        // clone, translate vertices to origin, and apply scale
        finalModel.vertices.push(
            ...cubeModel.vertices.map(v => ({
                x: (v.x + origin.x) * scale,
            y: (v.y + origin.y) * scale,
            z: (v.z + origin.z) * scale
            }))
        );
        // clone polys, shift referenced vertex indexes, and compute color
        finalModel.polys.push(
            ...cubeModel.polys.map(poly => ({
                vIndexes: poly.vIndexes.map(add(cubeIndex * 8))
            }))
        );
    });
    return finalModel;
}

// o: vector3D - position of cube's origin (center),
// s: vector3D - determines size of menger sponge
function mengerSpongeSplit(o, s) {
    return [
        // top
        {  x: (o.x + s), y: (o.y - s), z: (o.z + s)  },
        {  x: (o.x + s), y: (o.y - s), z: (o.z + 0)  },
        {  x: (o.x + s), y: (o.y - s), z: (o.z - s)  },
        {  x: (o.x + 0), y: (o.y - s), z: (o.z + s)  },
        {  x: (o.x + 0), y: (o.y - s), z: (o.z - s)  },
        {  x: (o.x - s), y: (o.y - s), z: (o.z + s)  },
        {  x: (o.x - s), y: (o.y - s), z: (o.z + 0)  },
        {  x: (o.x - s), y: (o.y - s), z: (o.z - s)  },
        // bottom
        {  x: (o.x + s), y: (o.y + s), z: (o.z + s)  },
        {  x: (o.x + s), y: (o.y + s), z: (o.z + 0)  },
        {  x: (o.x + s), y: (o.y + s), z: (o.z - s)  },
        {  x: (o.x + 0), y: (o.y + s), z: (o.z + s)  },
        {  x: (o.x + 0), y: (o.y + s), z: (o.z - s)  },
        {  x: (o.x - s), y: (o.y + s), z: (o.z + s)  },
        {  x: (o.x - s), y: (o.y + s), z: (o.z + 0)  },
        {  x: (o.x - s), y: (o.y + s), z: (o.z - s)  },
        // middle
        {  x: (o.x + s), y: (o.y + 0), z: (o.z + s)},
        {  x: (o.x + s), y: (o.y + 0), z: (o.z - s)},
        {  x: (o.x - s), y: (o.y + 0), z: (o.z + s)},
        {  x: (o.x - s), y: (o.y + 0), z: (o.z - s)}
    ];
}


// helper to optimize models by merging duplicate vertices within a threshold,
// and removing all polys that share the same vertices
// directly mutates the model
function optimizeModel(model, threshold = 0.0001) {
    const {vertices, polys} = model;

    const compareVertices = (v1, v2) => {
        Math.abs(v1.x - v2.x) < threshold &&
        Math.abs(v1.y - v2.y) < threshold &&
        Math.abs(v1.z - v2.z) < threshold
    };

    const comparePolys = (p1, p2) => {
        const v1 = p1.vIndexes;
        const v2 = p2.vIndexes;
        return (
            (
                v1[0] === v2[0] ||
                v1[0] === v2[1] ||
                v1[0] === v2[2] ||
                v1[0] === v2[3]
            ) && (
                v1[1] === v2[0] ||
                v1[1] === v2[1] ||
                v1[1] === v2[2] ||
                v1[1] === v2[3]
            ) && (
                v1[2] === v2[0] ||
                v1[2] === v2[1] ||
                v1[2] === v2[2] ||
                v1[2] === v2[3]
            ) && (
                v1[3] === v2[0] ||
                v1[3] === v2[1] ||
                v1[3] === v2[2] ||
                v1[3] === v2[3]
            )
        );
    };

    vertices.forEach((v, i) => {
        v.originalIndexes = [i];
    });

    for (let i = vertices.length - 1; i >= 0; i--) {
        for (let ii = i-1; ii >= 0; ii--) {
            const v1 = vertices[i];
            const v2 = vertices[ii];
            if (compareVertices(v1,v2)) {
                vertices.splice(i, 1);
                v2.originalIndexes.push(...v1.originalIndexes);
                break;
            }
        }
    }

    vertices.forEach((v, i) => {
        polys.forEach(p => {
            p.vIndexes.forEach((vi, ii, arr) => {
                const vo = v.originalIndexes;
                if (vo.includes(vi))
                    arr[ii] = i;
            });
        });
    });

    polys.forEach(p => {
        const vi = p.vIndexes;
        p.sum = vi[0] + vi[1] + vi[2] + vi[3];
    });
    polys.sort((a, b) => b.sum - a.sum);

    // assumptions:
    // 1. each poly will either have no duplicates or 1 duplicate
    // 2. if two polys are equal, they are both hidden (two cubes touching),
    // therefore both can be removed.
    for (let i = polys.length - 1; i >= 0; i--) {
        const p1 = polys[i];
        const p2 = polys[ii];
        if (p1.sum !== p2.sum) break;
        if (comparePolys(p1, p2)) {
            polys.splice(i, 1);
            polys.splice(ii, 1);
            i--;
            break;
        }
    }
    return model;
}


// Entity.js
///////////////
///////////////

class Entity {
    constructor({ model, color, wireframe = false}) {
        const vertices = cloneVertices(model.vertices);
        const shadowVertices = cloneVertices(model.vertices);
        const colorHex = colorToHex(color);
        const darkColorHex = shadeColor(color, 0.4);

        const polys = model.polys.map(p => ({
            vertices: p.vIndexes.map(vIndex => vertices[vIndex]),
            color: color, // custom rgb color object
            wireframe: wireframe,
            strokeWidth: wireframe? 2: 0, // set to non-zero value to draw stroke
            strokeColor: colorHex, // must be a CSS color string
            strokeColorDark: darkColorHex, // must be a CSS color string
            depth: 0,
            middle: { x:0, y:0, z:0 },
            normalWorld: { x:0, y:0, z:0 },
            normalCamera: { x:0, y:0, z:0 }
        }));

        const shadowPolys = model.polys.map(p => ({
            vertices: p.vIndexes.map(vIndex => shadowVertices[vIndex]),
            wireframe: wireframe,
            normalWorld: { x:0, y:0, z:0 }
        }));

        this.projected = {}; // will store 2D projected data
        this.model = model;
        this.vertices = vertices;
        this.polys = polys;
        this.shadowVertices = shadowVertices;
        this.shadowPolys = shadowPolys;
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.xD = 0;
        this.yD = 0;
        this.zD = 0;

        this.rotateX = 0;
        this.rotateY = 0;
        this.rotateZ = 0;
        this.rotateXD = 0;
        this.rotateYD = 0;
        this.rotateZD = 0;

        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;

        this.projected.x = 0;
        this.projected.y = 0;
    }

    trnasform() {
        transformVertices(
            this.model.vertices,
            this.vertices,
            this.x,
            this.y,
            this.z,
            this.rotateX,
            this.rotateY,
            this.rotateZ,
            this.scaleX,
            this.scaleY,
            this.scaleZ
        );
        copyVerticesTo(this.vertices, this.shadowVertices);
    }

    // projects origin point, stoared as 'projected' property.
    project() {
        projectVertexTo(this, this.projected);
    }
}


// getTarget.js
////////////////////
////////////////////

// all active targets
const targets = [];

// polo target instances by color, using a map.
// keys are color objects, and values are arrays of targets.
// also pool wireframe instances separately
// const targetPool = new Map(allColors.map(c => ([c, [] ])));
const targetPool = allColors.map(c => ([c, []]));
// const targetWireframePool = new Map(allColors.map(c => ([c, [] ])));
const targetWireframePool = allColors.map(c => ([c, []]));


const getTarget = (() => {
    const slowmoSpawner = makeSpawner({
        chance: 0.5,
        cooldownPerSpawn: 10000,
        maxSpawns: 1
    });

    let doubleStrong = false;
    const strongSpawner = makeSpawner({
        chance: 0.3,
        cooldownPerSpawn: 12000,
        maxSpawns: 1
    });

    const spinnerSpawner = makeSpawner({
        chance: 0.1,
        cooldownPerSpawn: 10000,
        maxSpawns: 1
    });

    // cached array instances, no need to allocate every time
    const axisOptions = [
        ['x', 'y'],
        ['y', 'z'],
        ['z', 'x']
    ];

    function getTargetOfStyle(color, wireframe) {
        const pool = wireframe ? targetWireframePool : targetPool;
        let target = pool.get(color).pop();
        if (!target) {
            target = new Entity({
                model: optimizeModel(makeRecursiveCubeModel({
                    recursionLevel: 1,
                    splitFn: mengerSpongeSplit,
                    scale:targetRadius
                })),
                color: color,
                wireframe, wireframe
            });

            // init any properties that will be used
            // these will not be automatically reset when recycled
            target.color = color;
            target.wireframe = wireframe;

            // some properties don't have their final value yet
            // initialize with any value of the right type
            target.hit = false;
            target.maxHealth = 0;
            target.health = 0;
        }
        return target;
    }

    return function getTarget() {
        if (doubleStrong && state.game.score <= doubleStrongEnableScore) {
            doubleStrong = false;
        }
        else if (!doubleStrong && state.game.score > doubleStrongEnableScore) {
            doubleStrong = true;
            strongSpawner.mutate({ maxSpawns: 2 });
        }
        // target parameters

        let color = pickOne([BLUE, GREEN, ORANGE]);
        let wireframe = false;
        let health = 1;
        let maxHealth = 3;
        const spinner = state.game.cubeCount >= spinnerThreshold && isInGame() && spinnerSpawner.shouldSpawn();

        // target parameter overrides

        if (state.game.cubeCount >= slowmoThreshold && slowmoSpawner.shouldSpawn()) {
            color = BLUE;
            wireframe = true;
        }

        else if (state.game.cubeCount >= strongThreshold && strongSpawner.shouldSpawn()) {
            color = PINK;
            health = 3;
        }

        // target creation
        const target = getTargetOfStyle(color, wireframe);
        target.hit = false;
        target.maxHealth = maxHealth;
        target.health = health;
        updateTargetHealth(target, 0);

        const spinSpeeds = [
            Math.random() * 0.1 - 0.05,
            Math.random() * 0.1 - 0.05
        ];

        if (spinner) {
            // ends up spinning a random axis
            spinSpeeds[0] = -0.25;
            spinSpeeds[1] = 0;
            target.rotateZ = random(0, TAU);
        }

        const axes = pickOne(axisOptions);

        spinSpeeds.forEach((spinSpeed, i) => {
            switch(axes[i]) {
                case 'x':
                    target.rotateXD = spinSpeed;
                    break;
                case 'y':
                    target.rotateYD = spinSpeed;
                    break;
                case 'z':
                    target.rotateZD = spinSpeed;
                    break;
            }
        });
        return target();
    }
})();

const updateTargetHealth = (target, healthDelta) => {
    target.health += healthDelta;
    // only update stroke on non-wireframe targets.
    // showing "glue" is a temporary attempt to display health. For now, there's
    // no reason to have wireframe targets with high health, so we're fine.

    if (!target.wireframe) {
        const strokeWidth = target.health - 1;
        const strokeColor = makeTargetGlueColor(target);
        for (let p of target.polys) {
            p.strokeWidth = strokeWidth;
            p.strokeColor = strokeColor;
        }
    }
};

const returnTarget = target => {
    target.reset();
    const pool = target.wireframe ? targetWireframePool : targetPool;
    pool.get(target.color).push(target);
};

function resetAllTargets() {
    while(targets.length) {
        returnTarget(targets.pop());
    }
}

// createBurst.js
////////////////
////////////////

// track all active fragments
const frags = [];
// pool inactive fragments by color, using a map
// keys are color objects, and values are arrays of fragments.
// also pool wireframe instances separately

const fragPool = new Map(allColors.map(c => ( [c, []] )));
const fragWireframePool = new Map(allColors.map(c => ( [c, []] )));

const createBurst = (() => {
    // precompute some private data to be reused for all bursts
    const basePositions = mengerSpongeSplit({ x:0, y:0, z:0 }, FragRadius*2);
    const positions = cloneVertices(basePositions);
    const prevPositions = cloneVertices(basePositions);
    const velocities = cloneVertices(basePositions);

    const basePositionNormals = basePositions.map(normalize);
    const positionNormals = cloneVertices(basePositionNormals);

    const fragCount = basePositions.length;

    function getFragForTarget(target) {
        const pool = target.wireframe ? fragWireframePool : fragPool;
        let frag = pool.get(target.color).pop();
        if (!frag) {
            frag = new Entity ({
                model: makeCubeModel({ scale: FragRadius }),
                color: target.color,
                wireframe: target.wireframe
            });
            frag.color = target.color;
            frag.wireframe = target.wireframe;
        }
        return frag;
    }

    return (target, force = 1) => {
        // calculate fragment positions, and what would have been the previous positions
        // when still a part of the larger target
        transformVertices(
            basePositions, positions,
            target.x, target.y, target.z,
            target.rotateX, target.rotateY, target.rotateZ,
            1, 1, 1
        );
        transformVertices(
            basePositions, prevPositions,
            target.x - target.xD, target.y - target.yD, target.z - target.zD,
            target.x - target.rotateXD, target.y - target.rotateYD, target.z - target.rotateZD,
            1, 1, 1
        );

        // compute velocity of each fragment, based on previous positions.
        // will write to 'velocities' array.
        for (let i = 0; i < fragCount; i++) {
            const position = positions[i];
            const prevPosition = prevPositions[i];
            const velocity = velocities[i];

            velocity.x = position.x - prevPosition.x;
            velocity.y = position.y - prevPosition.y;
            velocity.z = position.z - prevPosition.z;
        }

        // apply target rotation to normals
        transformVertices(
            basePositionNormals, positionNormals,
            0, 0, 0,
            target.rotateX, target.rotateY, target.rotateZ,
            1, 1, 1
        );

        for (let i = 0; i < fragCount; i++) {
            const position = positions[i];
            const velocity = velocities[i];
            const normal = positionNormals[i];
            const frag = getFragForTarget(target);
            
            frag.x = position.x;
            frag.y = position.y;
            frag.z = position.z;
            frag.rotateX = target.rotateX;
            frag.rotateY = target.rotateY;
            frag.rotateZ = target.rotateZ;

            const burstSpeed = 2*force;
            const randSpeed = 2*force;
            const rotateScale = 0.015;
            frag.xD = velocity.x + (normal.x + burstSpeed) + (Math.random() * randSpeed);
            frag.yD = velocity.y + (normal.y + burstSpeed) + (Math.random() * randSpeed);
            frag.zD = velocity.z + (normal.z + burstSpeed) + (Math.random() * randSpeed);
            frag.rotateXD = frag.xD * rotateScale;
            frag.rotateYD = frag.yD * rotateScale;
            frag.rotateZD = frag.zD * rotateScale;
            frags.push(frag);
        }
    }
})();

const returnFrag = frag => {
    frag.reset();
    const pool = frag.wireframe ? fragWireframePool : fragPool;
    pool.get(frag.color).push(frag);
};

// spark.js
////////////
////////////

const sparks = [];
const sparkPool = [];

function addSpark(x, y, xD, yD) {
    const spark = sparkPool.pop() || {};

    spark.x = x + xD * 0.5;
    spark.y = y + yD * 0.5;
    spark.xD = xD;
    spark.yD = yD;
    spark.life = random(200, 300);
    spark.maxLife = spark.life;
    sparks.push(spark);
    
    return spark;
}

// spherical spark burst
function sparkBurst(x, y, count, maxSpeed) {
    const angleInc = TAU/count;
    for (let i = 0; i < count; i++) {
        const angle = i * angleInc + angleInc * Math.random();
        const speed = (1 - Math.random()**3) * maxSpeed;
        addSpark(x, y, (Math.sin(angle) * speed), (Math.cos(angle) * speed));
    }
}

// make a target "leak" sparks from all vertices
// this is used to create the effect of target glue "shedding"
let glueShedVertices;
function glueShedSparks(target) {
    if (!glueShedVertices) {
        glueShedVertices = cloneVertices(target.vertices);
    }
    else {
        copyVerticesTo(target.vertices, glueShedVertices);
    }

    glueShedVertices.forEach(v => {
        if (Math.random() < 0.4) {
            projectVertex(v);
            addSpark(v.x, v.y, random(-12, 12), random(-12, 12));
        }
    });
}

function returnSpark(spark) {
    sparkPool.push(spark);
}

//hud.js
////////////
////////////
const hudContainerNode = $('.hud');

function setHudVisibility(visible) {
    if (visible) 
        hudContainerNode.style.display = 'block';
    else
        hudContainerNode.style.display = 'none';
}


///////////
// Score //
///////////

const scoreNode = $('.score-lbl');
const cubeCountNode = $('.cube-count-lbl');

function renderScoreHud() {
    if (isCasualGame) {
        scoreNode.style.display = 'none';
        cubeCountNode.style.opacity = 1;
    }
    else {
        scoreNode.innerText = `SCORE: ${state.game.score}`;
        scoreNode.style.display = 'block';
        cubeCountNode.style.opacity = 0.65;
    }
    cubeCountNode.innerText = `CUBES SMASHED: ${state.game.cubeCount}`;
}

renderScoreHud();

//////////////////
// Pause Button //
//////////////////

handlePointerDown($('.pause-btn'), () => pauseGame());

////////////////////
// Slow-mo Status //
////////////////////

const slowmoNode = $('.slowmo');
const slowmoBarNode = $('slowmo_bar');

function renderSlowmoStatus(percentRemaining) {
    slowmoNode.style.opacity = percentRemaining === 0 ? 0:1;
    slowmoBarNode.style.transform = `scaleX(${percentRemaining.toFixed(3)})`;
}

// menus.js
/////////////////
/////////////////

// top-level menu containers
const menuContainerNode = $('.menus');
const menuMainNode = $('.menu-main');
const menuPauseNode = $('.menu-pause');
const menuScoreNode = $('.menu-score');
const finalScorelblNode = $('.final-score-lbl');
const highScorelblNode = $('.high-score-lbl');

function showMenu(node) {
    node.classList.add('active');
}

function hideMenu(node) {
    node.classList.remove('active');
}

function renderMenus() {
    hideMenu(menuMainNode);
    hideMenu(menuPauseNode);
    hideMenu(menuScoreNode);

    switch (state.menus.active) {
        case MENU_MAIN:
            showMenu(menuMainNode);
            break;
        case MENU_PAUSE:
            showMenu(menuPauseNode);
            break;
        case MENU_SCORE:
            finalScorelblNode.textContent = formateNumber(state.game.score);
            if (isNewHighScore()) {
                highScorelblNode.textContent = 'New High Score!';
            }
            else {
                highScorelblNode.textContent = `High Score: ${formateNumber(getHighScore())}`;
            }
            showMenu(menuScoreNode);
            break;
    }

    setHudVisibility(!isMenuVisible());
    menuContainerNode.classList.toggle('has-active', isMenuVisible());
    menuContainerNode.classList.toggle('interactive-mode', isMenuVisible() && pointIsDown);
}

renderMenus();

////////////////////
// Button actions //
////////////////////

// main menu
handleClick($('.play-normal-btn'), () => {
    setGameMode(GAME_MODE_RANKED);
    setActiveMenu(null);
    resetGame();
});

handleClick($('.play-casual-btn'), () => {
    setGameMode(GAME_MODE_CASUAL);
    setActiveMenu(null);
    resetGame();
});

// pause menu
handleClick($('.resume-btn'), () => resumeGame());
handleClick($('.menu-btn-pause'), () => setActiveMenu(MENU_MAIN));

// score menu
handleClick($('.play-again-btn'), () => {
    setActiveMenu(null);
    resetGame();
});

handleClick($('.menu-btn-score'), () => setActiveMenu(MENU_MAIN));

// actions.js
///////////////
///////////////


//////////////////
// MENU ACTIONS //
//////////////////

function setActiveMenu(menu) {
    state.menus.active = menu;
    renderMenus();
}

//////////////////
// HUD ACTIONS //
//////////////////

function setScore(score) {
    state.game.score = score;
    renderScoreHud();
}

function incrementScore(inc) {
    if (isInGame) {
        state.game.score += inc;
        if (state.game.score < 0) {
            state.game.score = 0;
        }
        renderScoreHud();
    }
}

function setCubeCount(count) {
    state.game.cubeCount = count;
    renderScoreHud();
}

function incrementCubeCount(inc) {
    if (isInGame) {
        state.game.cubeCount += inc;
        renderScoreHud();
    }
}

function setGameMode(mode) {
    state.game.mode = mode;
}

function resetGame() {
    resetAllTargets();
    state.game.time = 0;
    resetAllCooldowns();
    setScore(0);
    setCubeCount(0);
    spawnTime = getSpawnDelay();
}

function pauseGame() {
    isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
    isPaused() && setActiveMenu(null);
}

function endGame() {
    handleCanvasPointerUp();
    if (isNewHighScore) {
        setHighScore(state.game.score);
    }
    setActiveMenu(MENU_SCORE);
}

////////////////////////
// KEYBOARD SHORTCUTS //
////////////////////////

window.addEventListener('keydown', event => {
    if (event.key === 'p') {
        isPaused() ? resumeGame() : pauseGame();
    }
});

// tick.js
/////////////////
/////////////////

let spawnTime = 0;
const maxSpawnx = 450;
const pointerDelta = { x:0, y:0 };
const pointerDeltaScaled = { x:0, y:0 };

// temp slowmo state. should be relocated once this stabilizes
const slowmoDuration = 1500;
let slowmoRemaining = 0;
let spawnExtra = 0;
const spawnExtraDelay = 300;
let targetSpeed = -1;

function tick(width, height, simTime, simSpeed, lag) {
    PERF_START('frame');
    PERF_START('tick');

    state.game.time += simTime;

    if (slowmoRemaining > 0) {
        slowmoRemaining -= simTime;
        if (slowmoRemaining < 0)
            slowmoRemaining = 0;
        targetSpeed = pointIsDown ? 0.075: 0.3;
    }
    else {
        const menuPointerDown = isMenuVisible() && pointIsDown;
        targetSpeed = menuPointerDown ? 0.025 : 1;
    }
    renderSlowmoStatus(slowmoRemaining / slowmoDuration);

    gameSpeed += (targetSpeed - gameSpeed) / (22*lag);
    gameSpeed = clamp(gameSpeed, 0, 1);

    const centerX = width/2;
    const centerY = height/2;

    const simAirDrag = 1 - (airDrag * simSpeed);
    const simAirDragSpark = 1 - (airDragSpark * simSpeed);

    // pointer tracking

    // compute speed and x/y deltas
    // there is also a "scaled" variant taking game speed into account. this serves two purposes:
    // - lag won't create large spikes in speed/deltas
    // - in slow mo, speed is increased proportionately to match "reality".
    // without this boost, it feels like your actions are dampened in slow mo.
    const forceMultiplier  = 1/(simSpeed*0.75 + 0.25);
    pointerDelta.x = 0;
    pointerDelta.y = 0;
    pointerDeltaScaled.x = 0;
    pointerDeltaScaled.y = 0;
    const lastPointer = touchPoints[touchPoints.length - 1];

    if (pointIsDown && lastPointer && !lastPointer.touchBreak) {
        pointerDelta.x = (pointerScene.x - lastPointer.x);
        pointerDelta.y = (pointerScene.y - lastPointer.y);
        pointerDeltaScaled.x = pointerDelta.x * forceMultiplier;
        pointerDeltaScaled.y = pointerDelta.y * forceMultiplier;
    }

    const pointerSpeed = Math.hypot(pointerDelta.x, pointerDelta.y);
    const pointerSpeedScaled = pointerSpeed * forceMultiplier;

    // track points for later calculations , including drawing trail
    touchPoints.forEach(p => p.life -= simTime);

    if (pointIsDown) {
        touchPoints.push({
            x: pointerScene.x,
            y: pointerScene.y,
            life: touchPointLife
        });
    }

    while (touchPoints[0] && touchPoints[0].life <= 0) {
        touchPoints.shift();
    }

    // Entity manipulation
    PERF_START('entities');

    // spawn targets
    spawnTime -= simTime;
    if (spawnTime <= 0) {
        if (spawnExtra > 0) {
            spawnExtra--;
            spawnTime = spawnExtraDelay;
        }
        else {
            spawnTime = getSpawnDelay();
        }

        const target = getTarget();
        const spawnRadius = Math.min(centerX * 0.8, maxSpawnx);
        target.x = (Math.random() * spawnRadius*2 - spawnRadius);
        target.y = centerY + targetHitRadius * 2;
        target.z = (Math.random() * targetRadius*2, - targetRadius);
        target.xD = Math.random() * (target.x * -2/120);
        target.yD = -20;
        targets.push(target);
    }

    // animate targets and remove when offscreen
    const leftBound = -centerX + targetRadius;
    const rightBound = centerX - targetRadius;
    const ceiling = -centerY - 120;
    const boundDamping = 0.4;

    targetLoop:
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        target.x += target.xD * simSpeed;
        target.y += target.yD * simSpeed;

        if (target.y < ceiling) {
            target.y = ceiling;
            target.yD = 0;
        }

        if (target.x < leftBound) {
            target.x = leftBound;
            target.xD *= -boundDamping;
        }
        else if (target.x > rightBound) {
            target.x = rightBound;
            target.xD *= -boundDamping;
        }

        if (target.z < backboardZ) {
            target.z = backboardZ;
            target.zD *= -boundDamping;
        }

        target.yD += gravity * simSpeed;
        target.rotateX += target.rotateXD * simSpeed;
        target.rotateY += target.rotateYD * simSpeed;
        target.transform();
        target.project();
        
        // remove if offscreen
        if (target.y > centerY + targetHitRadius * 2) {
            targets.splice(i, 1);
            returnTarget(target);
            if (isInGame()) {
                if (isCasualGame()) incrementScore(-25);
                else endGame();
            }
            continue;
        }

        // if pointer is moving really fast, we want to hit test multiple points along the path
        // we can't use scaled pointer speed to determine this, since we care about actual
        // screen distance covered
        const hitTestCount = Math.ceil(pointerSpeed / targetHitRadius * 2);
        // start loop at '1' and <= check, so we skip 0% and end up at 100%
        // this omits the previous point position and includes the most recent
        for (let ii = 1; ii < hitTestCount; ii ++) {
            const percent = 1 - (ii/hitTestCount);
            const hitX = pointerScene.x - pointerDelta.x * percent;
            const hitY = pointerScene.y - pointerDelta.y * percent;
            const distance = Math.hypot(
                hitX - target.projected.x,
                hitY - target.projected.y
            );

            if (distance <= targetHitRadius) {
                // hit! (though we don't want to allow hits on multiple sequential frames)
                if (!target.hit) {
                    target.hit = true;
                    target.xD += pointerDeltaScaled.x * hitDampening;
                    target.yD += pointerDeltaScaled.y * hitDampening;
                    target.rotateXD += pointerDeltaScaled.y * 0.001;
                    target.rotateYD += pointerDeltaScaled.x * 0.001;
                    const sparkSpeed = 7 + pointerSpeedScaled * 0.125;

                    if (pointerSpeedScaled > minPointerSpeed) {
                        target.health--;
                        incrementScore(10);

                        if (target.health <= 0) {
                            incrementCubeCount(1);
                            createBurst(target, forceMultiplier);
                            sparkBurst(hitX, hitY, 8, sparkSpeed);
                            if (target.wireframe) {
                                slowmoRemaining = slowmoDuration;
                                spawnTime == 0;
                                spawnExtra = 2;
                            }
                            targets.splice(i, 1);
                            returnTarget(target);
                        }
                        else {
                            sparkBurst(hitX, hitY, 8, sparkSpeed);
                            glueShedSparks(target);
                            updateTargetHealth(target, 0);
                        }
                    }
                    else {
                        incrementScore(5);
                        sparkBurst(hitX, hitY, 3, sparkSpeed);
                    }
                } // if (!target.hit)
                // break the current loop and continue the outer loop
                // this skips to process the next target.
                continue targetLoop;

            } // if (distance <= targetHitRadius)
        } //  ii for loop
        // this code will only run if target hasn't been "hit"
        target.hit = false;
    }// targetloop for loop end

    // animte fragments and remove when offscreen
    const fragBackboardZ = backboardZ + FragRadius;
    // allow fragments to move off-screen to sides for a while, since shadows are still visible
    const fragLeftBound = -width;
    const fragRightBound = width;

    for (let i = frags.length - 1; i >= 0; i--) {
        const frag = frags[i];
        frag.x += frag.xD * simSpeed;
        frag.y += frag.yD * simSpeed;
        frag.z += frag.zD * simSpeed;

        frag.xD *= simAirDrag;
        frag.yD *= simAirDrag;
        frag.zD *= simAirDrag;

        if (frag.y < ceiling) {
            frag.y = ceiling;
            frag.yD = 0;
        }

        if (frag.z < fragBackboardZ) { 
            frag.z = fragBackboardZ;
            frag.zD *= -boundDamping;
        }

        frag.yD += gravity * simSpeed;
        frag.rotateX += frag.rotateXD * simSpeed;
        frag.rotateY += frag.rotateYD * simSpeed;
        frag.rotateZ += frag.rotateZD * simSpeed;
        frag.transform();
        frag.project();
        // removal conditions
        if (
            // bottom of screen
            frag.projected.y > centerY + targetHitRadius ||
            //sides of screen
            frag.projected.x < fragLeftBound ||
            frag.projected.x > fragRightBound ||
            // too close to camera
            frag.z > cameraFadeEndZ
        ) {
            frags.splice(i, 1);
            returnFrag(frag);
            continue;
        }
    }

    // 2d sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.life -= spawnTime;
        if (spark.life <= 0) {
            sparks.splice(i, 1);
            returnSpark(spark);
            continue;
        }
        spark.x += spark.xD * simSpeed;
        spark.y += spark.yD * simSpeed;
        spark.xD *= simAirDragSpark;
        spark.yD *= simAirDragSpark;
        spark.yD += gravity * simSpeed;
    }

    PERF_END('entities');

    // 3d transform
    PERF_START('3D');

    // aggregate all scene vertices/polys
    allVertices.length = 0;
    allPolys.length = 0;
    allShadowVertices.length = 0;
    allShadowPolys.length = 0;
    targets.forEach(entity => {
        allVertices.push(...entity.vertices);
        allPolys.push(...entity.polys);
        allShadowVertices.push(...entity.shadowVertices);
        allShadowPolys.push(...entity.shadowPolys);
    });

    // scene calculations / transformations
    allPolys.forEach(p => computePolyNormal(p, 'normalWorld'));
    allPolys.forEach(computePolyDepth);
    allPolys.sort((a,b) => b.depth - a.depth);

    // perspective projection
    allVertices.forEach(projectVertex);
    allPolys.forEach(p => computePolyNormal(p, 'normalCamera'));

    PERF_END('3d');
    PERF_START('shadows');

    //rotate shadow vertices to light source perspective
    transformVertices(
        allShadowVertices, allShadowVertices,
        0, 0, 0,
        TAU/8, 0, 0,
        1, 1, 1
    );

    allShadowPolys.forEach(p => computePolyNormal(p, 'normalWorld'));

    const shadowDistanceMult = Math.hypot(1, 1);
    const shadowVerticesLength = allShadowVertices.length;
    for (let i = 0; i < shadowVerticesLength; i++) {
        const distance = allVertices[i].z - backboardZ;
        allShadowVertices[i].z -= shadowDistanceMult * distance;
    }

    transformVertices(
        allShadowVertices, allShadowVertices,
        0, 0, 0,
        -TAU/8, 0, 0,
        1, 1, 1
    );
    allShadowVertices.forEach(projectVertex);

    PERF_END('shadows');

    PERF_END('tick');
} 

// draw.js
///////////
///////////

function draw(ctx, width, height, viewScale) {
    PERF_START('draw');
    const halfW = width/2;
    const halfH = height/2;

    // 3d polys
    ctx.lineJoin = 'bevel';

    PERF_START('drawShadows');
    ctx.fillStyle = shadowColor;
    ctx.strokeStyle = shadowColor;
    allShadowPolys.forEach(p => {
        if (p.wireframe) {
            ctx.lineWidth = 2;
            ctx.beginPath();
            const { vertices } = p;
            const vCount = vertices.length;
            const firstV = vertices[0];
            ctx.moveTo(firstV.x, firstV.y) ;
            for (let i = 1; i < vCount; i++) {
                const v = vertices[i];
                ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        else {
            ctx.beginPath();
            const { vertices } = p;
            const vCount = vertices.length;
            const firstV = vertices[0];
            ctx.moveTo(firstV.x, firstV.y) ;
            for (let i = 1; i < vCount; i++) {
                const v = vertices[i];
                ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.fill();
        }
    });

    PERF_END('drawShadows');

    PERF_START('drawPolys');

    allPolys.forEach(p => {
        if (!p.wireframe && p.normalCamera.z < 0) return;
        if (p.strokeWidth !== 0) {
            ctx.lineWidth = p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
            ctx.strokeStyle = p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
        }

        const { vertcies } = p;
        const lastV = vertcies[vertcies.length - 1];
        const fadeOut = p.middle.z > cameraFadeStartZ;

        if (!p.wireframe) {
            const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
            const lightness = normalLight > 0
                ? 0.1
                : ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
            ctx.fillStyle = shadeColor(p.color, lightness);
        }

        // fade out polys close to camera. 'globalAlpha must be reset later
        if (fadeOut) {
            // if polygon gets really close to camera (outside 'cameraFadeRange') the alpha
            // can go negative, which has the appearance of alpha  = 1. So, we'll clamp it at 0.
            ctx.globalAlpha = Math.max(0, 1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange);
        }

        ctx.beginPath();
        cx.moveTo(lastV.x, lastV.y);
        for (let v of vertices) {
            ctx.lineTo(v.x, v.y);
        }

        if (!p.wireframe)  ctx.fill();

        if (p.strokeWidth !== 0)   ctx.stroke();

        if (fadeOut)   ctx.globalAlpha = 1;
    });

    PERF_END('drawPolys');

    PERF_START('draw2D');

    // 2d sparks
    ctx.strokeStyle = sparkColor;
    ctx.lineWidth = sparkThickness;
    ctx.beginPath();
    sparks.forEach(spark => {
        ctx.moveTo(spark.x, spark.y);
        // shrink sparks to zero length as they die
        // speed up shringking as life approaches 0 (root curve)
        // note that sparks already get smaller over time as their speed
        // slows down from damping. So this is like a double scale down.
        // To counter this a bit and keep the sparks larger for longer,
        // we'll also increase the scale a bit after applynig the root curve

        const scale = (spark.life / spark.maxLife) ** 0.5 * 1.5;
        ctx.lineTo( (spark.x - spark.xD * scale), (spark.y - spark.yD * scale) );
    });
    ctx.stroke();

    // toucch strokes
    ctx.strokeStyle = touchTrailColor;
    const touchPointCount = touchPoints.length;
    for (let i = 0; i < touchPointCount; i++) {
        const current = touchPoints[i];
        const prev = touchPoints[i-1];
        if (current.touchBreak || prev.touchBreak)  continue;

        const scale = current.life / touchPointLife;
        ctx.lineWidth = scale * touchTrailThickness;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
    }

    PERF_END('draw2D');

    PERF_END('draw');
    PERF_END('frame');

    // display performance updates
    PERF_UPDATE();
}

// canvas.js
////////////
////////////

function setupCanvases() {
    const ctx = canvas.getContext('2d');
    // devicePixelRatio alias
    const dpr = window.devicePixelRatio || 1;
    // view will be scaled so objects appear sized similarly on al screen sizes
    let viewScale;
    // dimension (taking viewScale into account)
    let width, height;

    function handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        viewScale = h / 1000;
        width = w / viewScale;
        height = h / viewScale;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
    }

    // set initial size
    handleResize();

    // resize fullscreen canvas
    window.addEventListener('resize', handleResize);

    // run game loop
    let lastTimestamp = 0;
    function frameHandler(timestamp) {
        let frameTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        // always queue another frame
        raf();

        // if game is paused, we'll still track frametime (above)
        // but all other game logic and drawing can be avoided
        if (isPaused()) return;

        // make sure negative time isn't reported ( first frame can be whacky)
        if (frameTime < 0)   frameTime = 17;

        // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
        else if (frameTime > 68)  frameTime = 68;

        const halfW = width / 2;
        const halfH = height / 2;

        // convert pointer position from screen to scene coords
        pointerScene.x = pointerScene.x / viewScale - halfW;
        pointerScene.y  =pointerScene.y / viewScale - halfH;

        const lag = frameTime / 16.6667;
        const simTime = gameSpeed * frameTime;
        const simSpeed = gameSpeed * lag;
        tick(width, height, simTime, simSpeed, lag);

        // auto clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // auto scale drawing for high resolution displays, and incorporate 'viewScale'.
        // also shift canvas so (0, 0) is the middle of the screen
        // this just works with 3D perspective projection
        const drawScale = dpr * viewScale;
        ctx.scale(drawScale, drawScale);
        ctx.translate(halfW, halfH);
        draw(ctx, width, height, viewScale);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const raf = () => requestAnimationFrame(frameHandler);
    // start loop
    raf();
}

// interaction.js
////////////////
////////////////

function handleCanvasPointerDown(x, y) {
    if (!pointIsDown) {
        pointIsDown = true;
        pointerScene.x = x;
        pointerScene.y = y;
        // on when menus are open, point down/up toggles in interactive mode
        // we just need to rerender the menu system for it to respond.
        if (isMenuVisible()) renderMenus();
    }
}

function handleCanvasPointerUp() {
    if (pointIsDown) {
        pointIsDown = false;
        touchPoints.push({
            touchBreak: true,
            life: touchPointLife
        });
        // on when menus are open, point down/up toggles in interactive mode
        // we just need to rerender the menu system for it to respond.
        if (isMenuVisible()) renderMenus();
    }
}

function handleCanvasPointerMove(x,y) {
    if (pointIsDown) {
        pointerScreen.x = x;
        pointerScreen.y = y;
    }
}

// use pointer events if available, otherwise fallback to touch events (for iOS)
if ('PointerEvent' in window) {
    canvas.addEventListener('pointerdown', event => {
        event.isPrimary && handleCanvasPointerDown(event.clientX, event.clientY);
    });

    canvas.addEventListener('pointerup', event => {
        event.isPrimary && handleCanvasPointerUp();
    });

    canvas.addEventListener('pointermove', event => {
        event.isPrimary && handleCanvasPointerMove(event.clientX, event.clientY);
    });

    // we also need to know if the mouse leaves the page. For this game,
    // it's best if that cancels a swipe, so essentially acts as a 'mouseup' event
    document.body.addEventListener('mouseleave', handleCanvasPointerUp);
}

else {
    let activeTouchId = null;
    canvas.addEventListener('touchstart', event => {
        if (!pointIsDown) {
            const touch = event.changedTouches[0];
            activeTouchId = touch.identifier;
            handleCanvasPointerDown(touch.clientX, touch.clientY);
        }
    });

    canvas.addEventListener('touchend', event => {
        for (let touch of event.changedTouches) {
            if (touch.identifier === activeTouchId) {
                handleCanvasPointerUp();
                break;
            }
        }
    });

    canvas.addEventListener('touchmove', event => {
        for (let touch of event.changedTouches) {
            if (touch.identifier === activeTouchId) {
                handleCanvasPointerMove(touch.clientX, touch.clientY);
                event.preventDefault();
                break;
            }
        }
    }, { passive: false });
}

// index.js
//////////////
//////////////
setupCanvases();

