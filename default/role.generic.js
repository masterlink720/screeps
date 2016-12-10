const roles = {
    builder:    require('role.builder'),
    upgrader:   require('role.upgrader'),
    harvester:  require('role.harvester'),
};

const rolesOrder = ['upgrader', 'builder', 'harvester'];

const roleUtil = require('role.util');

var roleGeneric = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Try in order
        let res = _.find(rolesOrder, function(role) {

            // Don't re-try
            if( creep.memory.role === role ) {
                return false;
            }

            return roles[role].run(creep) !== false;
        });

        if( !res ) {
            creep.say('Nothing to do.....');
            creep.moveTo(0, 0);
        }
    }
};
