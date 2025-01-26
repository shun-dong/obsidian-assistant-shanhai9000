import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import OpenAI from 'openai';
import moment from 'moment';

// Remember to rename these classes and interfaces!

interface Shanhai9000Settings {
	ai_url: string;
	system_prompt: string;
	api_key: string;
	user_name: string;
	assitant_name: string;
	model: string;
	data_path: string;
	//我应该把promopt的tail独立出来,自动创建dialog文件,才能真正使用
	// conversationHistory: any;
}

const DEFAULT_SETTINGS: Shanhai9000Settings = {
	ai_url: 'https://api.deepseek.com',
	system_prompt: 'You are an AI assistant.',
	api_key:"",
	user_name: "user",
	assitant_name: "assistant",
	model: "deepseek-chat",
	data_path: "Function/",
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
				getmassage(result).then((returnmassage) => {
					writemassage(returnmassage);
					chatmodal.close();
					chatmodal.open();
					});
			})
			chatmodal.open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		//获取回复并储存
		var shanhai9000plugin=this

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
		var shanhai9000user=this.settings.user_name;
		var shanhai9000assistant=this.settings.assitant_name;
		//尝试读取文件
		const dataPath = this.settings.data_path;
		const filePath = dataPath+"dialog.json";
		const content = await this.app.vault.adapter.read(filePath);
		var conversationHistory = JSON.parse(content);
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
						contentEl.createEl("h1", { text: eval("shanhai9000"+item.role) +":"});
						contentEl.createEl("small", { text: item.content});
					}}
					//尝试写一个交互界面,怎么读取数据,可以换一种方式,或参考其他插件
			
				new Setting(contentEl)
					.setName(shanhai9000user+":")
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
							this.onSubmit(this.result);
						}));
			}
		
			onClose() {
			let { contentEl } = this;
			contentEl.empty();
			}
		}
		function massagetimer(massage: string){
			return moment().format('YYYY-MM-DD HH:mm')+" "+massage;
		}
		async function massageplanner(massage: string,rolename:string){
			if (await shanhai9000plugin.app.vault.adapter.exists(dataPath+rolename+".md")){
			let plan=await shanhai9000plugin.app.vault.adapter.read(dataPath+rolename+".md");
			massage=massage +"\n"+rolename+":\n"+plan};
			return massage;
		}
		function massagedeplanner(massage: string){
			let key=new RegExp(`(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}的时间表更新)(:|：)[\\s\\S]*`, 'g');
			let returnmassage=massage.replace(key, "").trim();
			return returnmassage;
		}
		function massagefliter(massage: string){
			let key=new RegExp(`(?<=(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}的时间表更新)(:|：))[\\s\\S]*`,"g");
			let matchresult=massage.match(key);
			return matchresult
		}
		async function  writemassage(returnmassage: string){
			let matchresult=massagefliter(returnmassage);
			if (matchresult){let writemassage=matchresult[0];
			await shanhai9000plugin.app.vault.adapter.write(
					dataPath+shanhai9000assistant+".md", writemassage);};
			let rawmassage=massagedeplanner(returnmassage);
			conversationHistory.push({"role":"assistant","content":rawmassage});
			let strhistory =JSON.stringify(conversationHistory, null, 2);
			await shanhai9000plugin.app.vault.adapter.write(filePath,strhistory);//这里写this有问题
		  }
		  async function getmassage(massage: string) { // 修改返回类型
			let inputmassage: any[];
			const userMassage = await massageplanner(massage, shanhai9000user);
			const assistantMassage = await massageplanner(userMassage, shanhai9000assistant);
			
			inputmassage = [...conversationHistory, { "role": "user", "content": assistantMassage }];
			conversationHistory.push({ "role": "user", "content": massagetimer(massage) });
			
			const completion = await openai.chat.completions.create({
				messages: inputmassage,
				model: shanhai9000model, // 这里改成可以设置的
			});
			let returnmassage = completion.choices[0].message.content;
			if(returnmassage){returnmassage=returnmassage.replace(/^"|"$/g, "")}
			else{returnmassage=""};
			return returnmassage; 
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
				.setPlaceholder('Function/')
				.setValue(this.plugin.settings.data_path)
				.onChange(async (value) => {
					this.plugin.settings.data_path = value;
					await this.plugin.saveSettings();
				}));

	}
}
