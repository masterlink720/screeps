const repairTargets = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
];

const tools = require('./tools');

var Tower = module.exports = {

    /** @param {TowerConfig} tower */
    run: function(tower) {
        // Can't do anything
        if( !tower.energy ) {
            return false;
        }

        let foe = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
            friend = tower.pos.findClosestByRange(tools.getStructures(tower.room),
                struct => _.includes(repairTargets, struct.structureType) && struct.hits < struct.hitsMax
            );

        if( foe ) {
            tower.attack(foe);
        }

        // Repair only if the tower has at least half of its energy left
        else if( friend && tower.energy >= (tower.energyCapacity / 2)  ) {
            tower.repair(friend);
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
