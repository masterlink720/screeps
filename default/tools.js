var Tools = module.exports = {

    cleanThrottle: 10,
    cleanStatus: 0,

    printThrottle: 20,
    printStatus: 0,

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
        if (++this.printStatus < this.printThrottle) {
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