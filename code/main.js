
const characters = get_characters().map(chr => chr.name)

for (const name of characters) {
    start_character(name, "warrior")
}

// main can be a warrior too
load_code("warrior")