// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

const attack_mode=true
const second = 1000

// try to respawn every 20 in case you're dead
setInterval(function() {
    respawn()
}, 20 * second)



setInterval(function(){
    use_hp_or_mp()
    loot()

    if(!attack_mode || character.rip || is_moving(character)) return

    let target=get_targeted_monster()
    if(!target)
    {
        target=get_nearest_monster({min_xp:450,max_att:250,max_hp:10000})
        game_log(target && target.mtype)
        if(target) change_target(target)
        else {
            set_message("No Monsters")
            return
        }
    }

    // escape don't die
    if(character.hp < 0.05 * character.max_hp) {
        use("use_town")
    }


    if(!is_in_range(target))
    {
        smart_move(target)
        //move(
        //	(character.x+2*target.x)/3,
        //	(character.y+2*target.y)/3
        //	);
        // Walk half the distance
    }
    else if(can_attack(target))
    {
        set_message("Attacking")
        attack(target)
    }

},second/4) // Loops every 1/4 seconds.

//Source code of: use_hp_or_mp
function use_hp_or_mp()
{
    use_hp_or_mp_regen()
    if(safeties && mssince(last_potion)< 400) return
    let used_potion=false
    if(is_on_cooldown("use_hp")) return
    if(is_on_cooldown("use_mp")) return
    if(character.mp/character.max_mp<0.2) use("use_mp"),used_potion=true
    else if(character.hp/character.max_hp<0.3) use("use_hp"),used_potion=true

    if(used_potion) last_potion=new Date()
}

let last_regen = new Date()
function use_hp_or_mp_regen()
{
    if(safeties && mssince(last_regen)< 400) return
    let used_regen=false
    if(new Date()<parent.next_skill.use_hp) return
    if(new Date()<parent.next_skill.use_mp) return
    if(character.mp/character.max_mp<0.9) use("regen_mp"), used_regen=true
    else if(character.hp/character.max_hp<0.7) use("regen_hp"), used_regen=true

    if(used_regen) last_regen=new Date()
}

//Source code of: get_nearest_monster
function get_nearest_monster(args)
{
    //args:
    // max_att - max attack
    // min_xp - min XP
    // target: Only return monsters that target this "name" or player object
    // no_target: Only pick monsters that don't have any target
    // path_check: Checks if the character can move to the target
    // type: Type of the monsters, for example "goo", can be referenced from `show_json(G.monsters)` [08/02/17]
    var min_d=999999,target=null

    if(!args) args={}
    if(args && args.target && args.target.name) args.target=args.target.name
    if(args && args.type=="monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead")
    if(args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'")

    const sprites = Object.values(parent.entities)
    const sortedSprites = sprites.sort((a,b) => a.xp > b.xp).reverse()

    for (const current of sortedSprites) {
        if(current.type != "monster" || !current.visible || current.dead) continue
        if(args.type && current.mtype!=args.type) continue
        if(args.max_hp && current.hp>args.max_hp) continue
        //if(args.min_xp && current.xp<args.min_xp) continue
        //game_log(`${current.mtype}: ${current.attack}`)
        if(args.max_att && current.attack>args.max_att) continue
        if(args.target && current.target!=args.target) continue
        if(args.no_target && current.target && current.target!=character.name) continue
        if(args.path_check && !can_move_to(current)) continue
        var c_dist=parent.distance(character,current)
        if(c_dist<min_d) min_d=c_dist,target=current
    }
    return target
}