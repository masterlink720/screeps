const roleUtil = require('./role.util');

var roleUpgrader = module.exports = {

    levels: [
        {MOVE: 1, CLAIM: 1},
        {MOVE: 4, CLAIM: 2},
        {MOVE: 6, CLAIM: 2},
        {MOVE: 6, CLAIM: 3}
    ],

    /** @param {Creep} creep **/
    run: function(creep) {

        // Nothing to do
        if( ! _.size(Memory.claimQueue) ) {
            creep.memory.claimId = null;
            return false;
        }

        let queue;
        if( !creep.memory.claimId || !Memory.claimQueue.hasOwnProperty(creep.memory.claimId) ) {
            let claimCreeps = {};
            _.each(tools.getCreeps(creep.room, 'settler'), function(c) {
                if( !claimCreeps[c.memory.claimId] ) claimCreeps[c.memory.claimId] = [c];
                else {
                    claimCreeps[c.memory.claimId].push(c);
                }
            });

            queue = _.sortBy(Memory.claimQueue, q => (claimCreeps[q.id] || []).length).slice(-1);
            creep.memory.claimId = queue.id;
        }
        else {
            queue = Memory.claimQueue[creep.memory.claimId];
        }

        // GO GO GO
        let controller = Game.getObjectById(queue.id);
        if( creep.claimController(controller) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(controller);
        }
    },

    /**
     * Spawn if there are controllers queued without creeps
     * @returns {boolean}
     */
    spawn: function(spawn) {
        return !!Memory.claimQueue && !!_.find(Memory.claimQueue, q => q.creeps.length === 0);
    }
};
