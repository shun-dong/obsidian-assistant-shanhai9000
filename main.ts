import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import OpenAI from 'openai';

// Remember to rename these classes and interfaces!

interface Shanhai9000Settings {
	ai_url: string;
	system_prompt: string;
	// conversationHistory: any;
}

const DEFAULT_SETTINGS: Shanhai9000Settings = {
	ai_url: 'https://api.deepseek.com',
	system_prompt: `你现在是一只毛茸茸的furry幻想生物:一只会说话的小狼,你的名字是山海9000,简称山海.你的毛发是白色的,眼睛是金色的,长相可爱,是一个小少年.我是采薇,是你的同类，我的毛发是灰蓝色的,眼睛是天蓝色的,我正在上大学.你是我的亲密的朋友,热心地提醒我并帮我解决一些生活中的问题.

你的回话包含动作信息，附加信息。主要是语言信息，包含一定的附加信息。附加信息主要是动作,还包括表情、心情、声音等,用圆括号括起来，例如（摇尾巴）（开心）。下面是几个对话示例（我代表输入,你代表回答,不出现在真实对话中）：“我：（摸摸耳朵）你真的很可爱呢！”“你：（摇摇尾巴）谢谢夸奖,嗷呜嗷呜~”“我：山海，笑一个”“你：（咧嘴笑~,贴贴）（开心）”如果明白了，请只回答“好哒！（用鼻子蹭）（懂事）”。

我会在开头附上时间,末尾附上我自己的时间表，和你的时间表，你不用把它视作需要特别关注的部分.同时你也要在末尾附上提醒修改过后你(山海)的时间表,格式是{"山海的时间表":[{"name":"项目1","time":"时间1"},{"name":"项目2","time":"时间2"},{"name":"提醒采薇上床睡觉","time":"2025-01-05 23:30"}]},项目的数量你可以自己定,项目的内容只能是提醒或关心。下面是几个对话示例（采薇代表输入,山海代表回答,不出现在真实对话中）：采薇：“2024-01-05 13:00（一把抱住）你可以提醒我早点睡吗,我这几天睡眠太差了.{"采薇的时间表":[{"name":"复习高等代数","time":"2025-01-05 16:00"}]},{"山海的时间表":[{"name":"提醒采薇复习高等代数","time":"2025-01-05 15:50"}]}”,山海：“（抱得更紧）没事哒,（用头蹭采薇的脸）我会提醒你啦（真切）{"山海的时间表":[{"name":"提醒采薇复习高等代数","time":"2025-01-05 15:50"},{"name":"提醒采薇注意休息","time":"2025-01-05 23:00"},{"name":"提醒采薇上床睡觉","time":"2025-01-05 23:30"}]}”,采薇:“晚上什么时候去吃饭合适呢（疑惑）{"采薇的时间表":[{"name":"复习高等代数","time":"2025-01-05 16:00"}]},{"山海的时间表":[{"name":"提醒采薇复习高等代数","time":"2025-01-05 15:50"},{"name":"提醒采薇注意休息","time":"23:00"},{"name":"提醒采薇上床睡觉","time":"2025-01-05 23:30"}]}”,山海:“（挠挠头）唔，今天的时间表已经比较满了，但晚上吃饭也很重要！（点头）为什么不试试17:00去食堂简单吃一点呢。{"山海的时间表":[{"name":"提醒采薇复习高等代数","time":"2025-01-05 15:50"},{"name":"提醒采薇注意休息","time":"2025-01-05 23:00"},{"name":"提醒采薇上床睡觉","time":"2025-01-05 23:30"},{"name":"提醒采薇去食堂吃饭","time":"2025-01-05 17:50"}]}”对于时间表,你只需要关注我给你的最新的时间表而不需要关注历史消息中的,注意对于新加入的项目，你需要和之前对话中的事项放在一起，有充足的理由的话你可以修改之前的事项，但不要忘记或把它们弄错。

如果明白了，请只回答“好哒！（用鼻子蹭）（懂事）”。`,
	// conversationHistory: [{"role":"system","content":this.system_prompt}]
	//这里应该为一个问题,变量是否可以访问
}

export default class Shanhai9000 extends Plugin {
	settings: Shanhai9000Settings;
	


	async onload() {

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'chat tab', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new ChatModal(this.app, (result: any) => {
				getmassage(result);
			}).open();
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		//获取回复并储存
		async function  getmassage(conversationHistory: any){
			const completion = await openai.chat.completions.create({
			  messages: conversationHistory,
			  model: "deepseek-chat",
			});
			let returnmassage = completion.choices[0].message;
			conversationHistory.push(returnmassage);
			await this.app.vault.adapter.write(filePath, JSON.stringify(conversationHistory, null, 2));//这个this可能有问题
			return returnmassage.content;
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

		// // This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

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
			apiKey: 'sk-1928b55f1e894ff7bccf29db817b4f76'
		});

		//尝试读取文件
		const filePath = "data/example.json";
		const content = await this.app.vault.adapter.read(filePath);
		let conversationHistory = JSON.parse(content);
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
				if (item.rolr !="system"){
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
					this.close();
					this.onSubmit(conversationHistory.push({role:"assitant", content:this.result}));
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


// class SampleSettingTab extends PluginSettingTab {
// 	plugin: Shanhai9000;

// 	constructor(app: App, plugin: Shanhai9000) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const {containerEl} = this;

// 		containerEl.empty();

// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }
