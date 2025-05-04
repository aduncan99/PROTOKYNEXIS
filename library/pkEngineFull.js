const pkEngine = {
    GameScreen: class {
        constructor(_canvas, _gsSettings) {
            this.canvas = _canvas;
            this.ctx = this.canvas.getContext("2d");
            this.settings = _gsSettings || {};
            this.scenes = [];
        }
        createScene(_name, _options) {
            let newScene = new pkEngine.Scene(_name, _options);
            this.scenes.push(newScene);
        }
        getSettings() {
            return this.settings;
        }
        editSettings(_newSettings) {
            this.settings = _newSettings;
        }
    },
    Scene: class {
        constructor(_name, _options, _gameScreenContext) {
            this.name = _name;
            this.gameScreenContext = _gameScreenContext || null;
            this.nestedObjects = [];
            this.components = [];
        }
        addNestedObject(_object) {
            _object.scene = this;
            this.nestedObjects.push(_object);
        }
    },
    Object: class {
        constructor(_name, _options, _parentContext) {
            this.name = _name;
            this.scene = _options.scene || null;
            this.parentContext = _parentContext || null;
            this.type = _options.type || 'none';
            this.position = this.options.position || { x: 0, y: 0 };
            this.nestedObjects = [];
            this.components = [];
        }
        addComponent(_component) {
            this.components.push(_component);
        }
        addNestedObject(_object) {
            _object.scene = this.scene;
            this.nestedObjects.push(_object);
        }
        update(_parentContext) {
            for (let component of this.components) {
                component.update(this);
            }
            for (let nestedObject of this.nestedObjects) {
                nestedObject.update(this);
            }
        }

    },
    Component: class {
        constructor(_name, _options, _parentContext) {
            this.name = _name;
            this.type = _options.type || 'none';
            this.parentContext = _parentContext || null;


            if (type == 'rigidBody') {
                this.parentContext.rigidBody = this;
                this.mass = _options.mass || 1;
                this.useGravity = _options.useGravity || true;
                this.useWind = _options.useWind || true;
                this.velocity = { x: 0, y: 0 };
                // this.freezeRotation = _options.freezeRotation || { x: false, y: false }; DONT USE THESE YET!!!
                // this.naturalRotation = _options.naturalRotation || { x: 0, y: 0 }; 
                // this.naturalVelocity = _options.naturalVelocity || { x: 0, y: 0 };
                this.linearDamping = _options.linearDamping || { x: 0, y: 0 }; // The linear damping coefficients for the x and y axes

                this.update = function () {
                    this.endPosition = {
                        x: this.parentContext.position.x + this.velocity.x,
                        y: this.parentContext.position.y + this.velocity.y
                    };
                    if (this.parentContext.boxCollider) {
                        this.parentContext.scene.nestedObjects.forEach((nestedObject) => {
                            if (nestedObject.boxCollider) {
                                let simulation = this.simulatePathForCollision(this, { startPosition: this.parentContext.position, endPosition: this.endPosition }, nestedObject);
                                if (simulation.collided) { // Check for collisions with other colliders in the same scene
                                    this.parentContext.position.x = simulation.newEndPosition.x;
                                    this.parentContext.position.y = simulation.newEndPosition.y;

                                    this.velocity.x = 0; // Reset velocity on collision
                                    this.velocity.y = 0;

                                    this.parentContext.boxCollider.handleCollision(simulation.collisionObject);
                                }
                            }
                        });
                    }

                    this.parentContext.position.x += this.velocity.x;
                    this.parentContext.position.y += this.velocity.y;
                    this.velocity.x = this.velocity.x - ((1 / this.linearDamping.x) * this.velocity.x);
                    this.velocity.y = this.velocity.y - ((1 / this.linearDamping.y) * this.velocity.y);
                };
                this.applyForce = function (force) {
                    this.velocity.x += force.x / this.mass;
                    this.velocity.y += force.y / this.mass;
                };
                this.simulatePathForCollision = function (_movingObject, _path, _targetObject) {
                    let pathStart = _path.startPosition;
                    let pathEnd = _path.endPosition;
                    let pathDirection = {
                        x: pathEnd.x - pathStart.x,
                        y: pathEnd.y - pathStart.y
                    };
                    // Check for intersection

                };
            } else if (type == 'boxCollider') {
                this.extents = _options.extents || { x: 1, y: 1 };
                // this.friction = _options.friction || 0.5;
                this.restitution = _options.restitution || 0.5;
                this.parentContext.boxCollider = this;

                this.update = function () {
                    
                };

                this.handleCollision = function (_collisionInfoObject) {

                };
            } else if (type == 'camera') {
                this.cameraType = _options.cameraType || 'fixed'; // follow, fixed, free
                if (_options.cameraType == 'follow') {
                    this.followTarget = _options.followTarget || null;
                    this.offset = _options.offset || { x: 0, y: 0 };
                } else if (_options.cameraType == 'fixed') {
                    this.position = _options.position || { x: 0, y: 0 };
                    this.zoom = _options.zoom || 1;
                } else if (_options.cameraType == 'free') {
                    this.position = _options.position || { x: 0, y: 0 };
                    this.zoom = _options.zoom || 1;
                    this.rotation = _options.rotation || 0;
                }
            } else if (type == 'spriteRenderer') {
                this.sprite = _options.sprite || null;
                this.color = _options.color || { r: 255, g: 255, b: 255, a: 1 };
                this.flipX = _options.flipX || false;
                this.flipY = _options.flipY || false;
                this.rotation = _options.rotation || 0;
                this.scale = _options.scale || { x: 1, y: 1 };
            } else if (type == 'UIPanel') {
                this.position = _options.position || { x: 0, y: 0 };
                this.size = _options.size || { width: 100, height: 100 };
                this.backgroundColor = _options.backgroundColor || { r: 255, g: 255, b: 255, a: 1 };
                this.borderColor = _options.borderColor || { r: 0, g: 0, b: 0, a: 1 };
                this.borderWidth = _options.borderWidth || 1;
                this.uiElements = [];
            } else if (type == 'animatedSpriteRenderer') {
                this.animations = _options.animations || {};
                this.currentAnimation = _options.currentAnimation || null;
                this.frameIndex = 0;
                this.frameTime = _options.frameTime || 100; // milliseconds
                this.elapsedTime = 0;
            } else if (type == 'repulsionField') {
                this.strength = _options.strength || 1;
                this.isActive = _options.isActive || true;
                this.isVisible = _options.isVisible || true;
                this.origin = _options.origin || { x: 0, y: 0 };
                if (_options.repulsionType == 'circular') {
                    this.radius = _options.radius || 100;
                } else if (_options.repulsionType == 'rectangular') {
                    this.size = _options.size || { width: 100, height: 100 };
                    this.rotation = _options.rotation || 0;
                } else if (_options.repulsionType == 'beam') {
                    this.range = _options.range || 100;
                    this.beamWidth = _options.beamWidth || 10;
                    this.rotation = _options.rotation || 0;
                }
            } else if (type == 'attractionField') {
                this.strength = _options.strength || 1;
                this.isActive = _options.isActive || true;
                this.isVisible = _options.isVisible || true;
                this.origin = _options.origin || { x: 0, y: 0 };
                if (_options.attractionType == 'circular') {
                    this.radius = _options.radius || 100;
                } else if (_options.attractionType == 'rectangular') {
                    this.size = _options.size || { width: 100, height: 100 };
                    this.rotation = _options.rotation || 0;
                } else if (_options.attractionType == 'beam') {
                    this.range = _options.range || 100;
                    this.beamWidth = _options.beamWidth || 10;
                    this.rotation = _options.rotation || 0;
                }
            } else if (type == 'gravity') {
                this.strength = _options.strength || 1;
                this.isActive = _options.isActive || true;

                if (_options.gravityType == 'fromOrigin') {
                    this.radius = _options.radius || 100;
                    this.origin = _options.origin || { x: 0, y: 0 };
                } else if (_options.gravityType == 'directional') {
                    this.direction = _options.direction || 0; // angle in degrees (0 is up)
                }

            } else if (type == 'wind') {
                this.strength = _options.strength || 1;
                this.isActive = _options.isActive || true;

                if (_options.windType == 'directional') {
                    this.direction = _options.direction || 0; // angle in degrees (0 is up)
                }
            } else if (type == 'artificialIntelligence') {

                if (_options.aiType == 'seeking') {
                    this.target = _options.target || null;
                    this.speed = _options.speed || 1;
                } else if (_options.aiType == 'fleeing') {
                    this.target = _options.target || null;
                    this.speed = _options.speed || 1;
                } else if (_options.aiType == 'patrolling') {
                    this.waypoints = _options.waypoints || [];
                    this.currentWaypointIndex = 0;
                    this.speed = _options.speed || 1;
                } else if (_options.aiType == 'wanderingAboutOrigin') {
                    this.origin = _options.origin || { x: 0, y: 0 };
                    this.radius = _options.radius || 100;
                    this.speed = _options.speed || 1;
                } else if (_options.aiType == 'wanderingAboutTarget') {
                    this.target = _options.target || null;
                    this.radius = _options.radius || 100;
                    this.speed = _options.speed || 1;
                } else if (_options.aiType == 'wandering') {
                    this.speed = _options.speed || 1;
                    this.angle = 0;
                }
            } else if (type == 'grid') {
                this.cellSize = _options.cellSize || 1;
                this.gridSize = _options.gridSize || { width: 10, height: 10 };
                this.cells = _options.cells || Array.from({ length: _options.gridSize.height }, () => Array(_options.gridSize.width).fill(null));
            } else if (type == 'gameEntity') {
                // To be added later.
                // Will include features like preset player, enemy, etc.
            } else if (type == 'HUD') {
                this.displayText = _options.displayText || "";
                this.isVisible = _options.isVisible || true;
                this.offset = _options.offset || { x: 0, y: 0 };
            }
            // Need to add health system
        }
    }
};
const info = {
    packageName: "pgin = _options.origin || { x: 0, y: 0 };kEngineFull",
    packageVersion: "1.0.0",
    packageDescription: "A full-featured game engine for creating 2D games in JavaScript.",
    packageAuthor: "Alex Duncan",
    packageReleaseDate: "5/3/2025"
};

