const fs = require("fs");
const upload = require("./tools/upload.js");


/**
 * Change this for files to save 
 */
const save_map = {
    "code/warrior.js": {slot: 2, name: "warrior"}
};

// Function to check file checksums and upload if it's changed
async function upload_changed_files() {
    // Upload files that has changed
    for (const file_path in save_map) {
        const slot = save_map[file_path].slot;
        const name = save_map[file_path].name;

        let upload_result;
        try {
            upload_result = await upload(file_path, slot, name);
        } catch(error) {
            console.log(`Error uploading ${file_path} with reason: ${JSON.stringify(error.message)}`);
            continue;
        }
        const json_data = await upload_result.json();
        if (json_data[0].type === "message") {
            console.log(`Uploaded ${file_path} to save slot ${slot} with name ${name}`);
            console.log(`${json_data[0].message}`);
        } else {
            console.log(`Error during upload. Server gave responded with a ${json_data[0].type}`);
            console.log(`${json_data[0].message}`);
        }
    }
}

upload_changed_files();