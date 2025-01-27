<p align="center">English|<a href="https://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.mdhttps://github.com/shun-dong/obsidian-assistance-shanhai9000/blob/master/README_zh.md">简体中文</a></p>

# Shanhai9000 - Task-based AI Assistant Plugin for Obsidian

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
