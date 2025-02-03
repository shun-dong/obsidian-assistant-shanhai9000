import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Shanhai9000 from "./main";

export async function taskimporter(plugin:Shanhai9000) {
    let filePaths=plugin.settings.note_path.split(/\r?\n/);
    let globaltasks="";
    for (const path of filePaths){
        let files=plugin.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(path));
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