
const attack_mode=true
const second = 1000

// try to respawn every 20 in case you're dead
setInterval(function() {
    respawn()
}, 20 * second)

// change target if target is dead
setInterval(function() {
    const target = get_targeted_monster()
    if (!target || target.rip) {
        smarter_move()
    }
}, 2 * second)

// find a target, attack it
setInterval(function(){
    use_hp_or_mp()
    loot()

    if(!attack_mode || character.rip || is_moving(character)) return

    let target=get_targeted_monster()
    if(!target)
    {
        target=get_monster_for_attack()
        game_log(target && target.mtype)
        if(target) change_target(target)
        else {
            set_message("No Monsters")
            return
        }
    }

    // escape don't die
    if(character.hp < 0.1 * character.max_hp) {
        use("use_town")
    }
    if(!is_in_range(target))
    {
        smarter_move(target)
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
    else if(character.hp/character.max_hp<0.9) use("regen_hp"), used_regen=true

    if(used_regen) last_regen=new Date()
}

function get_monster_for_attack() {
    // const min_rate = 0.5
    const max_hp = 10000
    const max_att = character.attack
	
    const sprites = Object.values(parent.entities)
    const monsters = sprites.filter(sp => sp.type == "monster")
    const chars = sprites.filter(sp => sp.type == "character")
	
    const sortedMonsters = monsters.sort(monster_cmp).reverse()
	
    for (const monster of sortedMonsters) {
        if (monster.dead) continue
        if (monster.max_hp > max_hp || monster.attack > max_att) continue
        if (chars.find(char => char_to_close(monster, char))) continue
        return monster
    }
    return 0 // none found
}

function char_to_close(monster, char) {
    return (char.rip == "false") && in_range_to(monster, char, 500)
}

function monster_cmp(m1, m2) {
    const r1 = get_xp_rate(m1)
    const r2 = get_xp_rate(m2)
    const range1 = get_range(character, m1) / 500
    const range2 = get_range(character, m2) / 500
    return r1 - range1 > r2 - range2
}

// xp per hp. good rates are over
// Using max_hp since other player damage could distort calculation
// TODO add dodging ability
function get_xp_rate(monster) {
    const trueHp = monster.max_hp
    return monster.xp / trueHp
}

function get_range(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx**2 + dy**2)
}
	
function in_range_to(a, b, range) {
    return get_range(a, b) < range
}

function smarter_move(destination)
{
    if (!destination) {
        smart.moving = false
        return
    }
    if(smart.moving) smart.on_done(false,"interrupted")
    smart.map=""
    smart.map=destination.map||character.map
    smart.x=destination.x
    smart.y=destination.y
    if(!smart.map)
    {
        game_log("Unrecognized location","#CF5B5B")
        return rejecting_promise({reason:"invalid"})
    }
    smart.moving=true
    smart.plot=[]; smart.flags={}; smart.searching=smart.found=false
    smart.on_done=function(done,reason){
        if(done) resolve_deferreds("smart_move",{success:true})
        else reject_deferreds("smart_move",{reason:reason})
    }
    return push_deferred("smart_move")
}