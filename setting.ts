import Shanhai9000 from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";


export class Shanhai9000SettingTab extends PluginSettingTab {
	plugin: Shanhai9000;

	constructor(app: App, plugin: Shanhai9000) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		//添加设置
		containerEl.createEl("h1",{text:"Basic Settings:"})
		new Setting(containerEl)
			.setName('Language')
			.setDesc('to communicate with the AI and organize the data')
			.addText(text => text
				.setPlaceholder('English/Chinese are recommended')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
				}));		
		new Setting(containerEl)
			.setName('AI url')
			.setDesc('for openai compatible servers')
			.addText(text => text
				.setPlaceholder('https://api.deepseek.com')
				.setValue(this.plugin.settings.ai_url)
				.onChange(async (value) => {
					this.plugin.settings.ai_url = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('API key')
			.addText(text => text
				.setPlaceholder('sk-   ')
				.setValue(this.plugin.settings.api_key)
				.onChange(async (value) => {
					this.plugin.settings.api_key = value;
					await this.plugin.saveSettings();
				}));
				new Setting(containerEl)
			.setName('User\'s name')//缺少setCDesc
			.addText(text => text
				.setPlaceholder('user')
				.setValue(this.plugin.settings.user_name)
				.onChange(async (value) => {
					this.plugin.settings.user_name = value;
					await this.plugin.saveSettings();
				}));
						new Setting(containerEl)
			.setName('API key')
			.addText(text => text
				.setPlaceholder('sk-   ')
				.setValue(this.plugin.settings.api_key)
				.onChange(async (value) => {
					this.plugin.settings.api_key = value;
					await this.plugin.saveSettings();
				}));
				new Setting(containerEl)
			.setName('User\'s name')//缺少setCDesc
			.addText(text => text
				.setPlaceholder('user')
				.setValue(this.plugin.settings.user_name)
				.onChange(async (value) => {
					this.plugin.settings.user_name = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Model')
			.addText(text => text
				.setPlaceholder('deepseek-reasoner')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('AI assistant\'s name')
			.addText(text => text
				.setPlaceholder('assistant')
				.setValue(this.plugin.settings.assitant_name)
				.onChange(async (value) => {
					this.plugin.settings.assitant_name = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)//- [ ] 可以改成能自动刷新的
			.setName("Use generated  system prompt")
			.setDesc("This plugin needs a custom system prompt to work properly, which can be referred on page https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README.md . If you don't have one, we highly recommend you use the generated one.")
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.generate_prompt)
					.onChange(async (value) => {
						// 更新插件设置中的 generate_prompt值
						this.plugin.settings.generate_prompt = value;
						await this.plugin.saveSettings();
						containerEl.empty();
						this.display();
					}))
		if	(this.plugin.settings.generate_prompt==true){
			let character="";
			let generatetext="";
			new Setting(containerEl)
			.setName("Character of your AI assistant")
			.addTextArea(text => text
				.setPlaceholder('The AI assistant is a helpful and friendly assistant.')
				.setValue(character)
				.onChange(async (value) => {
					character = value;
					generatetext=`Your answer should in language of ${this.plugin.settings.language}. You are an AI assistant. And your name is ${this.plugin.settings.assitant_name}. I'm the user. My name is ${this.plugin.settings.user_name}. 
${character}
The current time will be attached at the beginning, and my own schedule and the AI assistant's schedule will be attached at the end. the AI assistant don't have to think of it as something that needs special attention, and the AI assistant will also attach a reminder of the AI assistant's schedule after the revision. the AI assistant need to mark "${this.plugin.settings.assitant_name}:"at the beginning of schedule, and in a format similar to markdown, i.e. unfinished :"- [] title of unfinished tasks @time 📅 due date with format of YYYY-MM-DD" or done :"- [] title of unfinished tasks @time 📅 due date with format of YYYY-MM-DD ✅ finish date with format of YYYY-MM-DD". 
Notice the current time. Note that the AI assistant should attach the revised the AI assistant's  schedule at the end, but do not include my schedule, for the new tasks, the AI assistant need to put together with the previous tasks, if there is a good reason the AI assistant can modify the previous tasks, but do not forget or make them wrong, the AI assistant have completed tasks remember to change to the completed format. Do not put quotation marks around the dialogue.Please put "${this.plugin.settings.assitant_name}:"at the beginning of schedule, but do not put "${this.plugin.settings.assitant_name}:"at the beginning of dialog.`
					this.plugin.settings.system_prompt= generatetext;
					await this.plugin.saveSettings()}))
				}else{
		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc("Examples can be referred on page https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README.md")
			.addTextArea(text => text
				.setPlaceholder('You are an AI assistant.  ')
				.setValue(this.plugin.settings.system_prompt)
				.onChange(async (value) => {
					this.plugin.settings.system_prompt = value;
					await this.plugin.saveSettings();
				}));}
		new Setting(containerEl)
			.setName('Data path')
			.addText(text => text
				.setPlaceholder('Function/')
				.setValue(this.plugin.settings.data_path)
				.onChange(async (value) => {
					this.plugin.settings.data_path = value;
					await this.plugin.saveSettings();
				}));
		containerEl.createEl("h1",{text:"Extra features:"})
		new Setting(containerEl)//- [ ] 可以改成能自动刷新的
			.setName("Extract tasks from folder")
			.setDesc(`It will extract tasks and store in ${this.plugin.settings.data_path}${this.plugin.settings.user_name}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.extract_tasks)
					.onChange(async (value) => {
						this.plugin.settings.extract_tasks = value;
						await this.plugin.saveSettings();
						containerEl.empty();
						this.display();
					}))	
		if (this.plugin.settings.extract_tasks){
			new Setting(containerEl)
				.setName("Note path")
				.addTextArea(text=>text
					.setPlaceholder("Note/")
					.setValue(this.plugin.settings.note_path)
					.onChange(async (value) => {
						this.plugin.settings.note_path = value;
						await this.plugin.saveSettings();
					}));
			new Setting(containerEl)//- [ ] 可以改成能自动刷新的
			.setName("Only from recent notes")
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.from_recent)
					.onChange(async (value) => {
						this.plugin.settings.from_recent = value;
						await this.plugin.saveSettings();
						containerEl.empty();
						this.display();
					}))	
			if (this.plugin.settings.from_recent){
				new Setting(containerEl)
					.setName("Duration")
					.setDesc(`(in day)`)
					.addTextArea(text=>text
						.setPlaceholder("30")
						.setValue(String(this.plugin.settings.duration))
						.onChange(async (value) => {
							this.plugin.settings.duration = Number(value);
							await this.plugin.saveSettings();
						}));
			}
		}
		new Setting(containerEl)//- [ ] 可以改成能自动刷新的
		.setName("Use local alternative ")
		.setDesc(`In case of any error of online server`)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.use_localmodel)
				.onChange(async (value) => {
					this.plugin.settings.use_localmodel = value;
					await this.plugin.saveSettings();
					containerEl.empty();
					this.display();
				}))		
		if(this.plugin.settings.use_localmodel){
		new Setting(containerEl)
		.setName('Local AI url')
		.setDesc('Local AI eg Ollama ')
		.addText(text => text
			.setPlaceholder('http://localhost:11434')
			.setValue(this.plugin.settings.local_url)
			.onChange(async (value) => {
				this.plugin.settings.local_url = value;
				await this.plugin.saveSettings();
			}));		
		new Setting(containerEl)
		.setName('Local AI model')
		.setDesc("Model that is too small cannot give proper answer.")
		.addText(text => text
			.setPlaceholder('deepseek-r1:8b')
			.setValue(this.plugin.settings.local_model)
			.onChange(async (value) => {
				this.plugin.settings.local_model = value;
				await this.plugin.saveSettings();
			}));		}			


	}
}
