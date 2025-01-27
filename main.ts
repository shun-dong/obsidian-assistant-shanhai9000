import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import OpenAI from 'openai';
import moment from 'moment';

// Remember to rename these classes and interfaces!

interface Shanhai9000Settings {
	language: string;
	ai_url: string;
	generate_prompt: boolean;
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
	language: 'English',
	ai_url: 'https://api.deepseek.com',
	generate_prompt:true,
	system_prompt: '',
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
		const ribbonIconEl = this.addRibbonIcon('paw-print', 'chat tab', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			let chatmodal=new ChatModal(this.app, (result: any) => {
				getmassage(result).then(async(returnmassage) => {
					await writemassage(returnmassage);
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
		let content;
		if (await shanhai9000plugin.app.vault.adapter.exists(filePath)){
			content = await this.app.vault.adapter.read(filePath)}
		else{content=`[{"role":"system","content":""}]`
			await this.app.vault.adapter.write(filePath,content);}
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
					.addTextArea((text) =>//会大一些
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
							this.onSubmit(this.result)
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
			massage=massage +"\n"+rolename+":\n"+plan}
			else {await shanhai9000plugin.app.vault.adapter.write(dataPath+rolename+".md","")}
			return massage;
		}
		function massagedeplanner(massage: string){
			let key=new RegExp(`(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}(的时间表更新)?) ?(:|：)[\\s\\S]*`, 'g');
			let returnmassage=massage.replace(key, "").trim();
			return returnmassage;
		}
		function massagefliter(massage: string){
			let key=new RegExp(`(?<=(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}(的时间表更新)?) ?(:|：)(\\n)*)[\\s\\S]*`,"g");
			//时间表前面有空行
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
			.setDesc("Please reopen the tab after change this. This plugin needs a custom system prompt to work properly, which can be referred on page https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README.md . If you don't have one, we highly recommend you use the generated one.")
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.generate_prompt)
					.onChange(async (value) => {
						// 更新插件设置中的 generate_prompt值
						this.plugin.settings.generate_prompt = value;
						await this.plugin.saveSettings();
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

	}
}
