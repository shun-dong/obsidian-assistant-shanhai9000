import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Shanhai9000SettingTab } from "./setting";
import { taskimporter } from 'taskimporter';
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
	note_path: string;
	extract_tasks: boolean;
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
	extract_tasks: true,
	note_path:"Note/"
	// conversationHistory: [{"role":"system","content":this.system_prompt}]
	//这里应该为一个问题,变量是否可以访问
}

export default class Shanhai9000 extends Plugin {
	settings: Shanhai9000Settings;

	async onload() {

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('paw-print', 'chat tab', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			taskimporter(this);
			let chatmodal=new ChatModal(this.app, (result: any) => {
				getmessage(result).then(async(returnmessage) => {
					await writemessage(returnmessage);
					chatmodal.onClose();
					chatmodal.onOpen();
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
			content = await this.app.vault.adapter.read(filePath);}
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
		function messagetimer(message: string){
			return moment().format('YYYY-MM-DD HH:mm')+" "+message;
		}
		async function messageplanner(message: string,rolename:string){
			if (await shanhai9000plugin.app.vault.adapter.exists(dataPath+rolename+".md")){
			let plan=await shanhai9000plugin.app.vault.adapter.read(dataPath+rolename+".md");
			message=message +"\n"+rolename+":\n"+plan}
			else {await shanhai9000plugin.app.vault.adapter.write(dataPath+rolename+".md","")}
			return message;
		}
		function messagedeplanner(message: string){
			let key=new RegExp(
				`(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}(的时间表更新)?) ?(:|：)[\\s\\S]*`, 'g');
			let returnmessage=message.replace(key, "").trim();
			return returnmessage;
		}
		function messagefliter(message: string){
			let key=new RegExp(
				`(?<=(\\n)*(tasks of ${shanhai9000assistant}|${shanhai9000assistant}(的时间表更新)?) ?(:|：)(\\n)*)[\\s\\S]*`,"g");
			//时间表前面有空行
			let matchresult=message.match(key);
			return matchresult
		}
		async function  writemessage(returnmessage: string){
			let matchresult=messagefliter(returnmessage);
			if (matchresult){let writemessage=matchresult[0];
			await shanhai9000plugin.app.vault.adapter.write(
					dataPath+shanhai9000assistant+".md", writemessage);};
			let rawmessage=messagedeplanner(returnmessage);
			conversationHistory.push({"role":"assistant","content":rawmessage});
			let strhistory =JSON.stringify(conversationHistory, null, 2);
			await shanhai9000plugin.app.vault.adapter.write(filePath,strhistory);//这里写this有问题
		  }
		async function getmessage(message: string) { // 修改返回类型
			let inputmessage: any[];
			const usermessage = await messageplanner(message, shanhai9000user);
			const assistantmessage = await messageplanner(usermessage, shanhai9000assistant);
			if (conversationHistory.length>=9){
			inputmessage = [conversationHistory[0], ...conversationHistory.slice(-6), { "role": "user", "content": assistantmessage }];}
			else{inputmessage=[...conversationHistory, { "role": "user", "content": assistantmessage }]}
			conversationHistory.push({ "role": "user", "content": messagetimer(message) });
			
			const completion = await openai.chat.completions.create({
				messages: inputmessage,
				model: shanhai9000model, // 这里改成可以设置的
			});
			let returnmessage = completion.choices[0].message.content;
			if(returnmessage){returnmessage=returnmessage.replace(/^"|"$/g, "")}
			else{returnmessage=""};
			return returnmessage; 
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

