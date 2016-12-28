const repairTargets = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION
];

const tools = require('./tools');

var Tower = module.exports = {

    /** @param {TowerConfig} tower */
    run: function(tower) {
        // Can't do anything
        if( !tower.energy ) {
            return false;
        }

        let foe = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if( foe ) {
            tower.attack(foe);
            return;
        }

        // Try healing if we have at least half energy
        if( tower.energy >= tower.energyCapacity / 2 ) {

            let friends = tools.getStructures(tower.room, function(struct) {
                return _.includes(repairTargets, struct.structureType) && struct.hits < struct.hitsMax
            });

            if( friends.length ) {
                tower.repair(tower.pos.findClosestByRange(friends) || friends[0]);
            }
        }
    }

};

/*
     let tower = Game.getObjectById('f9c4e0babc76c9ed0244b94a');
     if(tower) {
     let foe     = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
     friend  = tower.pos.findClosestByRange(FIND_STRUCTURES, {
     filter: (structure) => structure.hits < structure.hitsMax
     });

     if( friend ) {
     tower.repair(friend);
     }

     if( foe ) {
     tower.attack(foe);
     }
*/

/**
 * @namespace TowerConfig
 * @type {object}
 *
 * @property {number[]} coords
 */
