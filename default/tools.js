var Tools = module.exports = {

    _structs: {},
    _creeps: {},
    _constructionSites: {},
    _energy: {},

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

    getStructures(room, filter = null, refresh = false) {
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
     * Returns the cost of the body components for the given creep
     */
    getCreepValue(creep) {
        return _.sum(creep.body, b => BODYPART_COST[b.type]);
    },


    /**
     * Returns the cost of the body components for the given creep
     */
    getCreepValue(creep) {
        return _.sum(creep.body, b => BODYPART_COST[b.type]);
    },

    getEnergy(room, getSources = true, getStructures = false, refresh = false) {
        if( !this._energy[room.id] || refresh ) {
            this._energy[room.id] = room.find(FIND_SOURCES);
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

    getRooom: function() {
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

    printHtml: function(title, data) {
        let styles = {
            width: '800px',
            background: '#158',
            margin: '10px 0 10px 100px',
            'border-radius': '5px',
            padding: '6px'
        };

        let css = _.map(styles, function(val, key) {
            return `${key}: ${val}`
        }).join(';');

        let out = `<br /><div style="${css}">`;
        if( title ) {
            out += '<h3 style="margin-bottom: 5px;">' + title + '</h3><hr style="margin-bottom: 5px" />';
        }

        // process data
        out += data;

        out += '</div>';
        console.log(out);
    },

    /**
     * "Pretty" print a message and optional complex objects
     */
    dump: function(...args) {
        if( !args.length ) {
            return null;
        }

        let title;
        if( typeof args.length[0] === 'string' ) {
            title = args[0];
            args = args.slice(1);
        }

        let data = args.map(function(arg) {
            if( !arg ) {
                return '';
            }

            let out = '<div>';
            if( typeof arg == 'string' ) {
                out += arg;
            }
            else {
                out += '<pre style="background: none, border: none margin: 5px 0;">' + JSON.stringify(arg, null, 2) + '</pre>';
            }

            return out + '</div>';
        }).join('');

        this.printHtml(title, data);
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
