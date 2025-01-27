# Shanhai9000 - Task-based AI Assistant Plugin for Obsidian

<p align="center">English|<a href="https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.mdhttps://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.md">简体中文</a></p>

## Plugin Overview

Shanhai9000 is an Obsidian plugin that utilizes an AI assistant to provide efficient dialogue support and task management for users. By interacting with OpenAI-compatible AI models, it helps you quickly generate, manage, and organize content.

## Key Features

- **AI Chat**: Engage in natural language conversations with the AI assistant to easily obtain answers.
- **Task Management**: Combine tasks and schedules with the AI assistant's conversation history to keep your work organized.
- **Custom System Prompts**: Users can customize the system prompt for the AI assistant to fit different use cases.
- **Automatic Prompt Generation**: Support for auto-generating system prompts for various scenarios, saving you configuration time.

## Installation and Configuration

1. **Install the Plugin**:
   
   - Download and install the `Shanhai9000` plugin via [brat plugin](https://github.com/TfTHacker/obsidian42-brat).
   - After enabling the plugin, you will see a new icon in the left ribbon of Obsidian to open the chat interface.

2. **Configure the Plugin**:
   
   - **Language**: Choose any language for communication with the AI assistant.
   - **AI URL**: Configure the AI server URL.
   - **API Key**: API key for connecting to OpenAI or compatible services.
   - **User and Assistant Names**: Set the names for the user and the AI assistant.
   - **Data Path**: Define the path where conversation and task data will be stored.
   - You can customize the system prompt for the AI assistant or enable auto-generated prompts based on your needs.

3. **How to Use**:
   
   - Click the icon in the left ribbon to open the chat interface and start interacting with the AI assistant.
   - The AI will generate appropriate responses based on your input and store them in the specified data path.

## Future Goals

- [ ] Streaming chat text
- [ ] Support for long conversations
- [ ] Global task retrieval
- [ ] Integration with cloud task lists

## Examples

### System prompt

You are an AI assistant. And your name is assistant . I'm the user. My name is user.

You are a helpful and friendly assistant.

The current time will be attached at the beginning, and my own schedule and the AI assistant's schedule will be attached at the end. the AI assistant don't have to think of it as something that needs special attention, and the AI assistant will also attach a reminder of the AI assistant's schedule after the revision. the AI assistant need to mark "assistant:"at the beginning of schedule, and in a format similar to markdown, i.e. unfinished :"- [ ] title of unfinished tasks @time 📅 due date with format of YYYY-MM-DD" or done :"- [ ] title of unfinished tasks @time 📅 due date with format of YYYY-MM-DD ✅ finish date with format of YYYY-MM-DD".

Notice the current time. Note that the AI assistant should attach the revised the AI assistant's  schedule at the end, but do not include my schedule, for the new tasks, the AI assistant need to put together with the previous tasks, if there is a good reason the AI assistant can modify the previous tasks, but do not forget or make them wrong, the AI assistant have completed tasks remember to change to the completed format. Do not put quotation marks around the dialogue.Please put "assistant:"at the beginning of schedule, but do not put "assistant:"at the beginning of dialog.

### Dialog

Refer to [link](https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.mdhttps://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.md).

### iOS Integration

You can use Shortcuts to automatically sync Obsidian tasks with iOS Reminders for automation.

However, note that Shortcuts might have lower efficiency, and some file paths need to be configured manually. For further updates, please visit [my blog](https://shun-dong.github.io/).

- [Get Tasks from Markdown](https://www.icloud.com/shortcuts/24b696eff6a848b4a02aeec359c1d201)
- [Update Tasks from Markdown](https://www.icloud.com/shortcuts/eb84cb14fac44e0a84c4962cb4eb6c27)
- [Push Tasks from Folder](https://www.icloud.com/shortcuts/9b79f1bd1111433cae4014067011ec4c)
- [Daily Push](https://www.icloud.com/shortcuts/34dd36a9e53d4525ba3b64401f9cf6fb)

## Notes

This plugin relies on OpenAI-compatible AI services, so please ensure you have a valid API key.

We recommend using [deepseek](https://platform.deepseek.com/).

## Contributing

If you find any issues or have suggestions, feel free to submit an issue or pull request. We welcome contributions from all developers and users!
