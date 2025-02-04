import Shanhai9000 from "./main";
import moment from 'moment';

export async function taskimporter(plugin:Shanhai9000) {
    let filePaths=plugin.settings.note_path.split(/\r?\n/);
    let globaltasks="";
    for (const path of filePaths){
        let files=plugin.app.vault.getMarkdownFiles().filter(file => 
            {if (file.path.startsWith(path)){
                if (plugin.settings.from_recent){
                    const startdate=moment().subtract(plugin.settings.duration,"days");
                    const lastModified = moment(file.stat.mtime);
                    return lastModified.isAfter(startdate);
                };
                return true;
            };return false;
        })
        for (const file of files){
            let content=await plugin.app.vault.read(file);
            let tasks=content.match(/^- \[.\].*/gm);
            if (tasks){
                for (const task of tasks){
                    globaltasks=globaltasks+task+"\n";
                }
            }
        }
    }
    plugin.app.vault.adapter.write(plugin.settings.data_path+plugin.settings.user_name+".md",globaltasks)
    
}