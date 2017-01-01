var Tools = module.exports = {

    _structs: {},
    _creeps: {},
    _constructionSites: {},
    _energy: {},
    _minerals: {},

    cleanThrottle: 10,
    cleanStatus: 0,

    _printThrottle: 20,
    _printStatus: 0,

    reset: function(room) {
        if( room ) {
            this._structs[room.id] = null;
            this._creeps[room.id] = null;
            this._constructionSites[room.id] = null;
            this._energy[room.id] = null;
        }
        else {
            this._structs = {};
            this._creeps = {};
            this._constructionSites = {};
            this._energy = {};
        }
    },

    testerage: function() {
        let spawn = Game.spawns.s1,
            repairStructs = this.getStructures(spawn.room, t => t.structureType === STRUCTURE_ROAD && t.hits < t.hitsMax)
                .slice(0, 10);

        let util = require('./role.util');

        let byRepairers = _.map(
                _.sortBy(repairStructs, t => util.targetCreeps(t, 'repairer')),
                function(t) { return {id: t.id, hits: t.hits} }
            ),
            byAll      = _.map(
                _.sortBy(repairStructs, t => util.targetCreeps(t, 'repairer'), 'hits'),
                function(t) { return {id: t.id, hits: t.hits} }
            );

        this.dump('testerage', {
            byRepairers: byRepairers,
            byAll: byAll
        });

    },

    getStructures(room, filter = null, refresh = false) {
        room = this.getRoom(room);

        if( !this._structs[room.id] || refresh ) {
            let structs = this._structs[room.id] = {
                all: room.find(FIND_STRUCTURES)
            };

            _.each(this._structs[room.id].all, function(struct) {
                if( !structs.hasOwnProperty(struct.structureType) ) {
                    structs[struct.structureType] = [struct];
                }
                else {
                    structs[struct.structureType].push(struct);
                }
            })
        }

        if( filter ) {
            if( typeof filter === 'function' ) {
                return _.filter(this._structs[room.id].all, filter);
            }
            if( typeof filter === 'string' ) {
                return this._structs[room.id][filter] || [];
            }
        }

        return this._structs[room.id].all;
    },

    getConstructionSites(room, filter = null, refresh = false) {
        if( !this._constructionSites[room.id] || refresh ) {
            let sites = this._constructionSites[room.id] = {
                all: room.find(FIND_MY_CONSTRUCTION_SITES)
            };

            _.each(this._constructionSites[room.id].all, function(struct) {
                if( !sites.hasOwnProperty(struct.structureType) ) {
                    sites[struct.structureType] = [struct];
                }
                else {
                    sites[struct.structureType].push(struct);
                }
            });
        }

        if( filter ) {
            if( typeof filter === 'function' ) {
                return _.filter(this._constructionSites[room.id].all, filter);
            }
            if( typeof filter === 'string' ) {
                return this._constructionSites[room.id][filter] || [];
            }
        }

        return this._constructionSites[room.id].all;
    },

    getCreeps(room, filter = null,  refresh = false) {
        let roomId = room ? room.id : '_all_';

        if( !this._creeps[roomId] || refresh ) {
            if( room ) {
                this._creeps[roomId] = room.find(FIND_MY_CREEPS, {
                    filter: c => !c.spawning
                });
            }
            else {
                this._creeps[roomId] = _.find(Game.creeps, c => !c.spawning)
            }
        }

        if( typeof filter === 'function' || typeof filter === 'object' ) {
            return _.filter(this._creeps[roomId], filter);
        }
        // Role name
        if( filter && typeof filter === 'string' ) {
            return _.filter(this._creeps[roomId], creep => creep.memory.role === filter);
        }

        return this._creeps[roomId];
    },

    /**
     * Update local memory of a creep
     *
     * @param creep
     */
    updateCreep(creep) {
        if( this._creeps[creep.room.id] ) {
            this._creeps[creep.room.id] = _.map(this._creeps[creep.room.id], function(c) {
                if( c.id === creep.id ) {
                    return creep;
                }
                return c;
            });
        }
        if( this._creeps['_all_'] ) {
            this._creeps._all_ = _.map(this._creeps._all_, function(c) {
                if( c.id === creep.id ) {
                    return creep;
                }
                return c;
            });
        }
    },

    /**
     * Returns the cost of the body components for the given creep
     */
    getCreepValue(creep) {
        return _.sum(creep.body, b => BODYPART_COST[b.type]);
    },


    /**
     * Returns a list of sources from which to gather energy
     *
     * @param room
     * @param getSources
     * @param getStructures
     * @param refresh
     * @returns {Array}
     */
    getEnergy(room, getSources = true, getStructures = false, refresh = false) {
        /*
        room = this.getRoom(room);

        if( !Memory.roomSources ) {
            Memory.roomSources = {};
        }
        if( !Memory.roomSources[room.name] ) {
            Memory.roomSources[room.name] = room.find(FIND_SOURCES)
        }

        if( !this._energy[room.id] || refresh ) {
            this._energy[room.id] = Memory.roomSources[room.name]; // room.find(FIND_SOURCES);
                // .concat(room.find(FIND_DROPPED_RESOURCES));
        }
        */

        if( !this._energy[room.id] || refresh ) {
            this._energy[room.id] = room.find(FIND_DROPPED_ENERGY).concat(
                room.find(FIND_SOURCES)
            );
        }

        let sources = [];
        if( getSources )  {
            sources = this._energy[room.id];
        }
        if( getStructures ) {
            let structs = this.getStructures(room, function(struct) {
                if( struct.structureType !== STRUCTURE_CONTAINER && struct.structureType !== STRUCTURE_STORAGE ) {
                    return false;
                }

                return struct.store.energy > 0;
            }, refresh);

            if( structs.length ) {
                 sources = structs.concat(sources);
            }
        }

        return sources;
    },

    cleanup: function() {
        if (++this.cleanStatus < this.cleanThrottle) {
            return;
        }

        this.cleanStatus = 0;
        _.each(Object.keys(Memory.creeps), function(name) {
            let cleanCount = 0;

            if (!Game.creeps[name]) {
                // console.debug(`Clearing non-existing creep memory: ${name}`);

                delete Memory.creeps[name];
                ++cleanCount;
            }

            if (cleanCount) {
                console.log(`Cleaned up ${cleanCount} dead creep(s) from memory`);
            }
        });
    },

    getRoom: function(struct) {
        if( struct ) {
            if (struct instanceof Room) {
                return struct;
            }
            if (typeof struct === 'object' && struct.room) {
                return struct.room;
            }
        }

        return Game.rooms[Object.keys(Game.rooms)[0]];
    },

    printStatus: function() {
        if (++this._printStatus < this._printThrottle) {
            return;
        }

        this.printStatus = 0;

        let room = Tools.getRoom(),
            msg = '\n\n - Status -' +
            '\nRoom: ' + room.name +
            '\nRoom energy available: ' + room.energyAvailable,

            creepCounts = {},
            totalCreeps = 0;

        _.each(Game.creeps, function(creep) {
            ++totalCreeps;
            if (!creepCounts.hasOwnProperty(creep.memory.role)) {
                creepCounts[creep.memory.role] = 0;
            }
            creepCounts[creep.memory.role]++;
        });

        console.log(msg + '\n\n');
    },

    printHtml: function(title, content) {
        let styles = {
            width: '800px',
            background: '#158',
            margin: '10px 0 10px 80px',
            'border-radius': '4px',
            padding: '6px'
        };

        let css = _.map(styles, function(val, key) {
            return `${key}: ${val}`;
        }).join(';');

        let out = '';
        if( title ) {
            out = `<h5 style="margin: 10px; font-weight: 600; color: white;">${title}</h5>`;
        }

        console.log(`<div style="${css}">${out}${content}</div>`);
    },

    /**
     * "Pretty" print a message and optional complex objects
     */
    dump: function(...args) {
        if( !args.length ) {
            return null;
        }

        let title;
        if( typeof args[0] === 'string' ) {
            title = args[0];
            args = args.slice(1);
        }

        let data = args.map(function(arg) {
            if( !arg ) {
                return '';
            }

            let out = '';
            if( typeof arg == 'string' ) {
                out += arg;
            }
            else {
                out += '<pre style="color: #ddd; background: #235; border: none; margin: 5px; border-radius: 3px;">' +
                    JSON.stringify(arg, null, 2) + '</pre>';
            }

            return '<div>' + out + '</div>';
        }).join('');

        this.printHtml(title, data);
    },

    /**
     * Recursively "var dump" a value and convert it into formatted html
     *
     * @todo build this
     */
    _toHtml: function(val, opts = {}, depth = 0) {
        opts = _.defaults({}, {
            nullColor: "#555",
            keyColor:  "#25A",
            valueColor: "#222",
            keyWeight:  600
        });

        let styles = {};
        let out = [];
        if( val === null ) {
            styles.color = opts.nullColor;
            out = "NULL";
        }

        else if( typeof val === 'object' ) {
            _.each(val, function(k, v) {
            });
        }
    },

    claimController: function(id) {
        if( !Memory.claimQueue ) {
            Memory.claimQueue = {};
        }

        if( !Memory.claimQueue[id] ) {
            Memory.claimQueue[id] = {id: id, creeps: []}
        }
    }

};
