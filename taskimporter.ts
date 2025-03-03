import Shanhai9000 from "./main";
import moment from 'moment';
import {normalizePath} from 'obsidian';

export async function taskimporter(plugin:Shanhai9000) {
    let filePaths=plugin.settings.note_path.split(/\r?\n/);
    let globaltasks="";
    const startdate=moment().subtract(plugin.settings.duration,"hours");
    for (const path of filePaths){
        let files=plugin.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(path))
        for (const file of files){
            const lastModified = moment(file.stat.mtime);
            let content=await plugin.app.vault.read(file);
            let tasks;
            if (plugin.settings.from_recent && lastModified.isAfter(startdate)){
                tasks=content.match(/^- \[( |\/)\].*/gm);
            }
            else{tasks=content.match(new RegExp(`^- \\[( |\\/)\\].*${plugin.settings.filter}.*`,'gm'));}
                if (tasks){
                    for (const task of tasks){
                        globaltasks=globaltasks+task+"\n";
                    }
                }
            }
        }
    plugin.app.vault.adapter.write(normalizePath(plugin.settings.data_path+plugin.settings.user_name+".md"),globaltasks)
    }