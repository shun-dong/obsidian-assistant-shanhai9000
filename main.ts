import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import OpenAI from 'openai';

// Remember to rename these classes and interfaces!

interface Shanhai9000Settings {
	ai_url: string;
	system_prompt: string;
	api_key: string;
	user_name: string;
	assitant_name: string;
	model: string;
	data_path: string;
	// conversationHistory: any;
}

const DEFAULT_SETTINGS: Shanhai9000Settings = {
	ai_url: 'https://api.deepseek.com',
	system_prompt: 'You are an AI assistant.',
	api_key:"",
	user_name: "user",
	assitant_name: "assistant",
	model: "deepseek-chat",
	data_path: "Function/dialog.json",
	// conversationHistory: [{"role":"system","content":this.system_prompt}]
	//这里应该为一个问题,变量是否可以访问
}

export default class Shanhai9000 extends Plugin {
	settings: Shanhai9000Settings;

	async onload() {

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'chat tab', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			let chatmodal=new ChatModal(this.app, (result: any) => {
				writemassage(result);
			})
			chatmodal.open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		//获取回复并储存
		var shanhai9000plugin=this
		async function  writemassage(stringifiedmassage: string){
			await shanhai9000plugin.app.vault.adapter.write(filePath, stringifiedmassage);//这个this可能有问题
		  }
		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new Shanhai9000SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		await this.loadSettings();
		const openai = new OpenAI({
			baseURL: this.settings.ai_url ,
			apiKey: this.settings.api_key,
			dangerouslyAllowBrowser: true
		});
		var shanhai9000model=this.settings.model;
		//尝试读取文件
		const filePath = this.settings.data_path;
		const content = await this.app.vault.adapter.read(filePath);
		let conversationHistory = JSON.parse(content);
		conversationHistory[0].content=this.settings.system_prompt;
		class ChatModal extends Modal {
			result: string;
			onSubmit: (result:any) => void;
		
			constructor(app: App, onSubmit: (result: string) => void) {
			super(app);
			this.onSubmit = onSubmit;
			}
			
			onOpen() {
				const { contentEl } = this;
				for (const item of conversationHistory){
					if (item.role !="system"){
						contentEl.createEl("h1", { text: item.role });
						contentEl.createEl("small", { text: item.content});
					}}
					//尝试写一个交互界面,怎么读取数据,可以换一种方式,或参考其他插件
			
				new Setting(contentEl)
					.setName("User:")
					.addText((text) =>
					text.onChange((value) => {
						this.result = value
					}));
			
				new Setting(contentEl)
					.addButton((btn) =>
					btn
						.setButtonText("Send")
						.setCta()
						.onClick(() => {
						//this.close();//看能不能不自动关闭
						conversationHistory.push({role:"user", content:this.result});
						async function getmassage(conversationHistory: any){
							const completion = await openai.chat.completions.create({
							messages: conversationHistory,
							model: shanhai9000model,//这里需要改成可以设置的
							});
							let returnmassage = completion.choices[0].message;
							conversationHistory.push(returnmassage);
							let completedmassage =JSON.stringify(conversationHistory, null, 2);//这个this可能有问题
							return completedmassage;
						}
						getmassage(conversationHistory).then((result) => {
							this.onSubmit(result);
							contentEl.empty();
							this.onOpen();});

							}));
			}
		
			onClose() {
			let { contentEl } = this;
			contentEl.empty();
			}
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class Shanhai9000SettingTab extends PluginSettingTab {
	plugin: Shanhai9000;

	constructor(app: App, plugin: Shanhai9000) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		//添加设置
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
			.setDesc('from openai compatible servers')
			.addText(text => text
				.setPlaceholder('sk-   ')
				.setValue(this.plugin.settings.api_key)
				.onChange(async (value) => {
					this.plugin.settings.api_key = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('to communicate with the AI')
			.addText(text => text
				.setPlaceholder('You are an AI assistant.  ')
				.setValue(this.plugin.settings.system_prompt)
				.onChange(async (value) => {
					this.plugin.settings.system_prompt = value;
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
			.setName('AI assistant\'s name')
			.addText(text => text
				.setPlaceholder('assistant')
				.setValue(this.plugin.settings.assitant_name)
				.onChange(async (value) => {
					this.plugin.settings.assitant_name = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('AI model')
			.addText(text => text
				.setPlaceholder('deepseek-chat')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Data path')
			.addText(text => text
				.setPlaceholder('Function/dialog.json')
				.setValue(this.plugin.settings.data_path)
				.onChange(async (value) => {
					this.plugin.settings.data_path = value;
					await this.plugin.saveSettings();
				}));

	}
}
