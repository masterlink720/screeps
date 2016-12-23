var Tools = module.exports = {

    _structs: {},
    _creeps: {},

    cleanThrottle: 10,
    cleanStatus: 0,

    _printThrottle: 20,
    _printStatus: 0,

    getStructures(room, filter = null, refresh = false) {
        if( !this._structs.hasOwnProperty(room.id) || refresh ) {
            let structs = this._structs[room.id] = {
                all: room.find(FIND_MY_CREEPS)
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

        if( typeof filter === 'function' ) {
            return _.filter(this._structs[room.id].all, filter);
        }
        if( filter && typeof filter === 'string' ) {
            return this._structs[room.id][filter] || [];
        }

        return this._structs.all;
    },

    getCreeps(room, filter = null, refresh = false) {
        if( !this._creeps.hasOwnProperty(room.id) || refresh ) {
            this._creeps[room.id] = room.find(FIND_MY_CREEPS);
        }

        if( typeof filter === 'function' ) {
            return _.filter(this._creeps[room.id], filter);
        }
        // Role name
        if( filter && typeof filter === 'string' ) {
            return _.filter(this._creeps[room.id], creep => creep.memory.role === filter);
        }

        return this._creeps[room.id];
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
    }

};
