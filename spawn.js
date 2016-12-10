var Spawn = module.exports = {

    spawn: null,
    name: null,


    run: function(spawn) {
        this.spawn = spawn;

        if (!spawn.memory.tasks) {
            spawn.meory.tasks = {
                resources: {}
            }
        }
    }

}